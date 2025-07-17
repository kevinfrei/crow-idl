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

function forElement<T extends Types>(emit: Emitter, adt: T): EmitItem<T> {
  // Returns the type emitter for the given ADT
  if (isObjectType(adt)) {
    return emit.types.objType as EmitItem<T>;
  } else if (isSubType(adt)) {
    return emit.types.subType as EmitItem<T>;
  } else if (isArrayType(adt)) {
    return emit.types.arrType as EmitItem<T>;
  } else if (isSetType(adt)) {
    return emit.types.setType as EmitItem<T>;
  } else if (isFastSetType(adt)) {
    return emit.types.fastSetType as EmitItem<T>;
  } else if (isMapType(adt)) {
    return emit.types.mapType as EmitItem<T>;
  } else if (isFastMapType(adt)) {
    return emit.types.fastMapType as EmitItem<T>;
  } else if (isTupleType(adt)) {
    return emit.types.tupType as EmitItem<T>;
  } else if (isPlainEnumType(adt)) {
    return emit.types.enumType as EmitItem<T>;
  } else if (isNumericEnumType(adt)) {
    return emit.types.numEnumType as EmitItem<T>;
  } else if (isStringEnumType(adt)) {
    return emit.types.strEnumType as EmitItem<T>;
  } else if (isStringType(adt)) {
    return emit.types.strType as EmitItem<T>;
  } else if (isOptionalType(adt)) {
    return emit.types.optType as EmitItem<T>;
  } else {
    return emit.types.simpleType as EmitItem<T>;
  }
}

function generateCode(
  emitter: Emitter,
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
  const code = generateCode(emitter, items);
  await Bun.write(fileName, code.join('\n'));
}

export function MakeGenerator(emitter: Emitter): IdlGenerator {
  const file: FileGenerator = async (
    inputFileName: string,
    outputFileName: string,
    items: Record<string, Types>,
  ): Promise<void> => {
    emitter.setOutputFilename(outputFileName);
    emitter.setInputFilename(inputFileName);
    return emitCode(emitter, outputFileName, items);
  };
  const code: CodeGenerator = (
    inputFileName: string,
    outputFileName: string,
    items: Record<string, Types>,
  ): string[] => {
    emitter.setOutputFilename(outputFileName);
    emitter.setInputFilename(inputFileName);
    const code = generateCode(emitter, items);
    // Split all the results, and turn them into a single array
    // of strings, which is the code to be generated
    return code.map((line) => line.split('\n')).flat();
  };
  return { code, file };
}
