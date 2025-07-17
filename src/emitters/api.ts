import {
  isArrayType,
  isFastMapType,
  isFastSetType,
  isMapType,
  isNumericEnumType,
  isObjectType,
  isOptionalType,
  isPlainEnumType,
  isSetType,
  isStringEnumType,
  isStringType,
  isSubType,
  isTupleType,
} from '../IDL';
import type {
  CodeGenerator,
  EmitItem,
  Emitter,
  FileGenerator,
  IdlGenerator,
  Types,
} from '../types';

function forElement(emit: Emitter, adt: Types): EmitItem<unknown> {
  // Returns the type emitter for the given ADT
  if (isObjectType(adt)) {
    return emit.types.objType;
  } else if (isSubType(adt)) {
    return emit.types.subType;
  } else if (isArrayType(adt)) {
    return emit.types.arrType;
  } else if (isSetType(adt)) {
    return emit.types.setType;
  } else if (isFastSetType(adt)) {
    return emit.types.fastSetType;
  } else if (isMapType(adt)) {
    return emit.types.mapType;
  } else if (isFastMapType(adt)) {
    return emit.types.fastMapType;
  } else if (isTupleType(adt)) {
    return emit.types.tupType;
  } else if (isPlainEnumType(adt)) {
    return emit.types.enumType;
  } else if (isNumericEnumType(adt)) {
    return emit.types.numEnumType;
  } else if (isStringEnumType(adt)) {
    return emit.types.strEnumType;
  } else if (isStringType(adt)) {
    return emit.types.strType;
  } else if (isOptionalType(adt)) {
    return emit.types.optType;
  }
  throw new Error(`Unknown ADT type: ${adt}`);
}

function generateCode(
  emitter: Emitter,
  fileName: string,
  items: Record<string, Types>,
): string[] {
  const body: string[] = [];
  for (const [name, item] of Object.entries(items)) {
    // Emit the C++ code for each SharedConstants item, either numeric or string type
    const itemEmitter = forElement(emitter, item);
    body.push(...itemEmitter(name, item));
  }
  const header = emitter.generateHeader();
  const footer = emitter.generateFooter();
  return [...header, ...body, ...footer];
}

async function emitCode(
  emitter: Emitter,
  fileName: string,
  items: Record<string, Types>,
): Promise<void> {
  const code = generateCode(emitter, fileName, items);
  await Bun.write(fileName, code.join('\n'));
}

export function MakeGenerator(emitter: Emitter): IdlGenerator {
  const file: FileGenerator = async (
    input: string,
    output: string,
    items: Record<string, Types>,
  ): Promise<void> => {
    emitter.setOutputFilename(output);
    emitter.setInputFilename(input);
    return emitCode(emitter, output, items);
  };
  const code: CodeGenerator = (
    input: string,
    output: string,
    items: Record<string, Types>,
  ): string[] => {
    emitter.setOutputFilename(output);
    emitter.setInputFilename(input);
    return generateCode(emitter, output, items);
  };
  return { code, file };
}
