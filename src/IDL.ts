// My silly IDL is actually just a set of functions that can be interpreted
// by a script to create types for the data structures.

import {
  chkArrayOf,
  chkRecordOf,
  hasFieldOf,
  hasStrField,
  isNumber,
  isObjectNonNull,
  isString,
} from '@freik/typechk';
import {
  TypeId,
  type Anonymous,
  type ArrType,
  type Bool,
  type Char,
  type Dbl,
  type Enum,
  type EnumType,
  type FastMapType,
  type FastSetType,
  type Flt,
  type I,
  type I16,
  type I32,
  type I64,
  type I8,
  type Int,
  type MapType,
  type NEnum,
  type ObjType,
  type Of,
  type OptType,
  type RefType,
  type SEnum,
  type SetType,
  type Simple,
  type Str,
  type SubType,
  type TupType,
  type Types,
  type U16,
  type U32,
  type U64,
  type U8,
} from './types';

export const str = (): Str => TypeId.Str;
export const chr = (): Char => TypeId.Char;
export const u8 = (): U8 => TypeId.U8;
export const i8 = (): I8 => TypeId.I8;
export const u16 = (): U16 => TypeId.U16;
export const i16 = (): I16 => TypeId.I16;
export const u32 = (): U32 => TypeId.U32;
export const i32 = (): I32 => TypeId.I32;
export const u64 = (): U64 => TypeId.U64;
export const i64 = (): I64 => TypeId.I64;
export const num = (): I => TypeId.I; // This is just used for Enum types
export const bool = (): Bool => TypeId.Bool;
export const flt = (): Flt => TypeId.Flt;
export const dbl = (): Dbl => TypeId.Dbl;
export const arr = (d: Anonymous): ArrType => ({ t: TypeId.Arr, d });
export const set = (d: Anonymous): SetType => ({ t: TypeId.Set, d });
export const fset = (d: Anonymous): FastSetType => ({ t: TypeId.FastSet, d });
export const map = (k: Anonymous, v: Anonymous): MapType => ({
  t: TypeId.Map,
  k,
  v,
});
export const fmap = (k: Anonymous, v: Anonymous): FastMapType => ({
  t: TypeId.FastMap,
  k,
  v,
});
export const tup = (...l: Anonymous[]): TupType => ({ t: TypeId.Tup, l });
export const obj = (d: Of<Anonymous>): ObjType => ({ t: TypeId.Obj, d });
export const opt = (d: Types): OptType => ({ t: TypeId.Opt, d });
export const sub = (p: string, d: Of<Anonymous>): SubType => ({
  t: TypeId.Sub,
  p,
  d,
});
export const ref = (r: string): RefType => ({ t: TypeId.Ref, r });
export const enum_lst = (u: Int | I, v: string[]): Enum => ({
  t: TypeId.Enum,
  u,
  v,
});
export const enum_num = (u: Int | I, v: Of<number>): NEnum => ({
  t: TypeId.NEnum,
  u,
  v,
});
export const enum_str = (v: Of<string>): SEnum => ({ t: TypeId.SEnum, v });

// Type guards for the IDL types
export function isStringType(x: unknown): x is Str {
  return x === TypeId.Str;
}
export function isCharType(x: unknown): x is Char {
  return x === TypeId.Char;
}
export function isU8Type(x: unknown): x is U8 {
  return x === TypeId.U8;
}
export function isI8Type(x: unknown): x is I8 {
  return x === TypeId.I8;
}
export function isU16Type(x: unknown): x is U16 {
  return x === TypeId.U16;
}
export function isI16Type(x: unknown): x is I16 {
  return x === TypeId.I16;
}
export function isU32Type(x: unknown): x is U32 {
  return x === TypeId.U32;
}
export function isI32Type(x: unknown): x is I32 {
  return x === TypeId.I32;
}
export function isU64Type(x: unknown): x is U64 {
  return x === TypeId.U64;
}
export function isI64Type(x: unknown): x is I64 {
  return x === TypeId.I64;
}
export function isPlainIntEnumType(x: unknown): x is I {
  return x === TypeId.I;
}
export function isBoolType(x: unknown): x is Bool {
  return x === TypeId.Bool;
}
export function isFloatType(x: unknown): x is Flt {
  return x === TypeId.Flt;
}
export function isDoubleType(x: unknown): x is Dbl {
  return x === TypeId.Dbl;
}
export function isSimpleType(x: unknown): x is Simple {
  return isString(x) && x.length === 1 && 'sc01234567bfd'.indexOf(x) >= 0;
}
export function isIntegerType(
  x: unknown,
): x is Int | I8 | I16 | I32 | I64 | U8 | U16 | U32 | U64 {
  return '012345678'.indexOf(x) >= 0;
}
export function isRefType(x: unknown): x is RefType {
  return (
    isObjectNonNull(x) &&
    hasStrField(x, 't') &&
    x.t === TypeId.Ref &&
    hasStrField(x, 'r')
  );
}
export function isArrayType(x: unknown): x is ArrType {
  return (
    isObjectNonNull(x) &&
    hasStrField(x, 't') &&
    x.t === TypeId.Arr &&
    hasFieldOf(x, 'd', isTypes)
  );
}
export function isSetType(x: unknown): x is SetType {
  return (
    isObjectNonNull(x) &&
    hasStrField(x, 't') &&
    x.t === TypeId.Set &&
    hasFieldOf(x, 'd', isTypes)
  );
}
export function isFastSetType(x: unknown): x is FastSetType {
  return (
    isObjectNonNull(x) &&
    hasStrField(x, 't') &&
    x.t === TypeId.FastSet &&
    hasFieldOf(x, 'd', isTypes)
  );
}
export function isMapType(x: unknown): x is MapType {
  return (
    isObjectNonNull(x) &&
    hasStrField(x, 't') &&
    x.t === TypeId.Map &&
    hasFieldOf(x, 'k', isTypes) &&
    hasFieldOf(x, 'v', isTypes)
  );
}
export function isFastMapType(x: unknown): x is FastMapType {
  return (
    isObjectNonNull(x) &&
    hasStrField(x, 't') &&
    x.t === TypeId.FastMap &&
    hasFieldOf(x, 'k', isTypes) &&
    hasFieldOf(x, 'v', isTypes)
  );
}
export function isTupleType(x: unknown): x is TupType {
  return (
    isObjectNonNull(x) &&
    hasStrField(x, 't') &&
    x.t === TypeId.Tup &&
    hasFieldOf(x, 'l', chkArrayOf(isTypes))
  );
}
export function isObjectType(x: unknown): x is ObjType {
  return (
    isObjectNonNull(x) &&
    hasStrField(x, 't') &&
    x.t === TypeId.Obj &&
    hasFieldOf(x, 'd', chkRecordOf(isString, isAnonymousType))
  );
}
export function isOptionalType(x: unknown): x is OptType {
  return (
    isObjectNonNull(x) &&
    hasStrField(x, 't') &&
    x.t === TypeId.Opt &&
    hasFieldOf(x, 'd', isTypes)
  );
}
export function isSubType(x: unknown): x is SubType {
  return (
    isObjectNonNull(x) &&
    hasStrField(x, 't') &&
    x.t === TypeId.Sub &&
    hasFieldOf(x, 'p', isString) &&
    hasFieldOf(x, 'd', chkRecordOf(isString, isAnonymousType))
  );
}
export function isPlainEnumType(x: unknown): x is Enum {
  return (
    isObjectNonNull(x) &&
    hasStrField(x, 't') &&
    x.t === TypeId.Enum &&
    hasFieldOf(x, 'u', isIntegerType) &&
    hasFieldOf(x, 'v', chkArrayOf(isString))
  );
}
export function isNumericEnumType(x: unknown): x is NEnum {
  return (
    isObjectNonNull(x) &&
    hasStrField(x, 't') &&
    x.t === TypeId.NEnum &&
    hasFieldOf(x, 'v', chkRecordOf(isString, isNumber))
  );
}
export function isStringEnumType(x: unknown): x is SEnum {
  return (
    isObjectNonNull(x) &&
    hasStrField(x, 't') &&
    x.t === TypeId.SEnum &&
    hasFieldOf(x, 'v', chkRecordOf(isString, isString))
  );
}
export function isEnumType(x: unknown): x is EnumType {
  return isPlainEnumType(x) || isNumericEnumType(x) || isStringEnumType(x);
}
export function isNamedType(x: unknown): x is ObjType | SubType | EnumType {
  return isEnumType(x) || isSubType(x) || isObjectType(x);
}
export function isCollectionType(
  x: unknown,
): x is ArrType | SetType | FastSetType | MapType | FastMapType {
  return (
    isArrayType(x) ||
    isSetType(x) ||
    isFastSetType(x) ||
    isMapType(x) ||
    isFastMapType(x)
  );
}
export function isAnonymousType(x: unknown): x is Anonymous {
  return (
    isSimpleType(x) ||
    isRefType(x) ||
    isCollectionType(x) ||
    isTupleType(x) ||
    isOptionalType(x)
  );
}
export function isTypes(x: unknown): x is Types {
  return isNamedType(x) || isAnonymousType(x);
}

// An example of how to define types using the IDL:
/*
const ExampleEnum1 = enum_lst(u8(), ['one', 'two', 'three']);
const ExampleEnum2 = enum_num(num(), { one: 1, two: 2, tre: 3 });
const ExampleEnum3 = enum_str({
  Red: 'red',
  Green: 'green',
  Blue: 'blue',
});
const ExampleObjectType = obj({
  name: str(),
  age: i32(),
  isActive: bool(),
  scores: arr(i32()),
  metadata: ref('Metadata'),
  friends: set(str()),
  info: map(str(), ref('ExampleTupleType')),
  id: ref('ExampleEnum1'),
});

const ExampleTupleType_otherName = tup(str(), i32(), bool());
const ExampleArrayType = arr(ref('ExampleObjectType'));
const ExampleNestedObjectType = obj({
  id: str(),
  data: ref('ExampleTupleType'),
});
const ExampleObjectTupleType = tup(
  ref('ExampleNestedObjectType1'),
  ref('ExampleNestedObjectType2'),
);
const ExampleNestedObjectType1 = obj({ id: str(), value: i32() });
const ExampleNestedObjectType2 = obj({ id: str(), value: dbl() });

export const TypesToGenerate: SymbolList = {
  ExampleEnum1,
  ExampleEnum2,
  ExampleEnum3,
  // Inlined type for Metadata:
  Metadata: obj({ author: str(), angle: dbl() }),
  ExampleTupleType: ExampleTupleType_otherName,
  ExampleObjectType,
  ExampleArrayType,
  ExampleNestedObjectType,
  ExampleNestedObjectType1,
  ExampleNestedObjectType2,
  ExampleObjectTupleType,
};
*/
