import {
  enum_lst,
  enum_num,
  enum_str,
  obj,
  Of,
  sub,
  SymbolList,
  Types,
} from '../../IDL';
import {
  isNumericEnumType,
  isObjectType,
  isPlainEnumType,
  isSimpleType,
  isStringEnumType,
  isSubType,
} from './typechecks';

function cleanKeys<T>(inObj: Of<T>, filts: string[]): Of<T> {
  const newType: Of<T> = {};
  for (const entry of Object.entries(inObj)) {
    if (!filts.some((filt) => entry[0].startsWith(filt))) {
      newType[entry[0]] = entry[1];
    }
  }
  return newType;
}

function FilterType(type: Types, filts: string[]): Types {
  // I need to filter each type that has fields:
  if (isSimpleType(type)) {
    return type;
  } else if (isPlainEnumType(type)) {
    return enum_lst(
      type.u,
      type.v.filter((val) => !filts.some((f) => val.startsWith(f))),
    );
  } else if (isStringEnumType(type)) {
    return enum_str(cleanKeys(type.v, filts));
  } else if (isNumericEnumType(type)) {
    return enum_num(type.u, cleanKeys(type.v, filts));
  } else if (isObjectType(type)) {
    return obj(cleanKeys(type.d, filts));
  } else if (isSubType(type)) {
    return sub(type.p, cleanKeys(type.d, filts));
  } else {
    return type;
  }
}

export function FilterTypes(
  ttg: Record<string, Types>,
  filts: string[],
): Record<string, Types> {
  // First, remove any top level types with the prefixes provided
  const entries = Object.entries(ttg);
  const newTypes: SymbolList = {};
  for (const entry of entries) {
    if (!filts.some((filt) => entry[0].startsWith(filt))) {
      newTypes[entry[0]] = FilterType(entry[1], filts);
    }
  }
  return newTypes;
}
