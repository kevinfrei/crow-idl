import {
  isArrayType,
  isFastMapType,
  isFastSetType,
  isMapType,
  isNumericEnumType,
  isObjectType,
  isPlainEnumType,
  isSetType,
  isStringEnumType,
  isStringType,
  isSubType,
  isTupleType,
} from '../IDL';
import type { EmitItem, Emitter, FileGenerator, Types } from '../types';

function forElement(emit: Emitter, adt: Types): EmitItem<any> {
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
  }
  throw new Error(`Unknown ADT type: ${adt}`);
}

async function emitCode(
  emitter: Emitter,
  fileName: string,
  items: Record<string, Types>,
): Promise<void> {
  const file = Bun.file(fileName);
  if (await file.exists()) {
    await file.delete();
  }
  const body: string[] = [];
  for (const [name, item] of Object.entries(items)) {
    // Emit the C++ code for each SharedConstants item, either numeric or string type
    const itemEmitter = forElement(emitter, item);
    body.push(...itemEmitter(name, item));
  }
  const header = emitter.generateHeader();
  const footer = emitter.generateFooter();
  const writer = file.writer();
  await writer.write(header.join('\n') + '\n');
  await writer.write(body.join('\n') + '\n');
  await writer.write(footer.join('\n') + '\n');
  await writer.end();
}

export function MakeGenerator(emitter: Emitter): FileGenerator {
  return async (
    input: string,
    output: string,
    items: Record<string, Types>,
  ) => {
    emitter.setOutputFilename(output);
    emitter.setInputFilename(input);
    await emitCode(emitter, output, items);
  };
}
