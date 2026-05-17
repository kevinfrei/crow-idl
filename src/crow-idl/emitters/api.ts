import { promises as fsp } from 'node:fs';
import type {
  CodeGenerator,
  EmitItem,
  Emitter,
  FileGenerator,
  IdlGenerator,
  Types,
} from '../../../IDL';
import {
  isArrayType,
  isFastMapType,
  isFastSetType,
  isMapType,
  isNumericEnumType,
  isObjectType,
  isOptionalType,
  isPlainEnumType,
  isRefType,
  isSetType,
  isStringEnumType,
  isStringType,
  isSubType,
  isTupleType,
} from '../typechecks';

// Fully resolve a reference type to its underlying type, throwing an error if
// the reference is invalid or if it references an optional type (which is not allowed).
function getReferencedType(ref: string, item_map: Map<string, Types>): Types {
  let refType: Types | undefined = undefined;
  let curRef = ref;
  do {
    refType = item_map.get(curRef);
    if (refType) {
      if (isOptionalType(refType)) {
        throw new Error(
          `Cannot reference an optional type ${curRef} (started from ${ref})`,
        );
      } else if (isRefType(refType)) {
        curRef = refType.r;
      }
    } else {
      throw new Error(
        `Reference to unknown type ${curRef} (started from ${ref})`,
      );
    }
  } while (isRefType(refType));
  return refType;
}

function forElement<T extends Types>(
  emit: Emitter,
  adt: T,
  item_map: Map<string, Types>,
): EmitItem<T> {
  // Do some sanity checks, and then return the type emitter for the given ADT
  if (isRefType(adt)) {
    // This triggers a full lookup
    getReferencedType(adt.r, item_map);
  }
  if (isObjectType(adt)) {
    return emit.types.objType as EmitItem<T>;
  } else if (isSubType(adt)) {
    let parentType = getReferencedType(adt.p, item_map)!;
    if (!isObjectType(parentType) && !isSubType(parentType)) {
      throw new Error(
        `Subtype's parent type ${adt.p} eventual target is is not a valid object or subtype`,
      );
    }
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

async function generateCode(
  emitter: Emitter,
  items: Record<string, Types>,
): Promise<string[]> {
  const body: string[] = [];
  const item_map = new Map<string, Types>(Object.entries(items));
  for (const [name, item] of item_map) {
    // Emit the generated code for each item
    const itemEmitter = forElement(emitter, item, item_map);
    body.push(...itemEmitter(name, item));
  }
  const header = emitter.generateHeader();
  const footer = emitter.generateFooter();
  const res = [...header, ...body, ...footer];
  if (emitter.postProcess) {
    return await emitter.postProcess(res);
  }
  return res;
}

async function emitCode(
  emitter: Emitter,
  fileName: string,
  items: Record<string, Types>,
): Promise<void> {
  const code = await generateCode(emitter, items);
  await fsp.writeFile(fileName, code.join('\n'));
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
  const code: CodeGenerator = async (
    inputFileName: string,
    outputFileName: string,
    items: Record<string, Types>,
  ): Promise<string[]> => {
    emitter.setOutputFilename(outputFileName);
    emitter.setInputFilename(inputFileName);
    const code = await generateCode(emitter, items);
    // Split all the results, and turn them into a single array
    // of strings, which is the code to be generated
    return code.map((line) => line.split('\n')).flat();
  };
  return { code, file };
}
