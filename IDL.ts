// My silly IDL is actually just a set of functions that can be interpreted
// by a script to create types for the data structures.

// These could be longer & more descriptive, but I'm using indexOf into a
// substring to check for a set of different types, and that's super easy.
// It's cheating, but easy.
export enum TypeId {
  Str = 's',
  Char = 'c',
  U8 = '0',
  I8 = '1',
  U16 = '2',
  I16 = '3',
  U32 = '4',
  I32 = '5',
  U64 = '6',
  I64 = '7',
  I = '8', // This is just used for Enum types for generics
  Bool = 'b',
  Flt = 'f',
  Dbl = 'd',
  Obj = 'O',
  Sub = 'C',
  Arr = 'A',
  Set = 'S',
  Opt = '?', // Optional type
  FastSet = 'H', // Fast Set, used for std::unordered_set in C++
  Map = 'M',
  FastMap = 'F', // Fast Map, used for std::unordered_map in C++
  Tup = 'T',
  Ref = 'R', // Reference type, Points at a type by name
  Enum = '#',
  NEnum = '%',
  SEnum = '$',
}

export type Of<T> = Record<string, T>;

// Simple Types:
export type Str = TypeId.Str;
export type Char = TypeId.Char;
export type U8 = TypeId.U8;
export type I8 = TypeId.I8;
export type U16 = TypeId.U16;
export type I16 = TypeId.I16;
export type U32 = TypeId.U32;
export type I32 = TypeId.I32;
export type U64 = TypeId.U64;
export type I64 = TypeId.I64;
export type I = TypeId.I; // This is just used for Enum types for generics
export type Bool = TypeId.Bool;
export type Flt = TypeId.Flt;
export type Dbl = TypeId.Dbl;

export type Int = U8 | I8 | U16 | I16 | U32 | I32 | U64 | I64;
export type Num = Int | Flt | Dbl;
export type Simple = Str | Char | Num | Bool;

// Named Types:
// Simple objects, a collectdion of named fields:
export type ObjType = { t: TypeId.Obj; d: Of<Anonymous> };
// Subtypes, which inherit from an ObjType, and can add fields
export type SubType = { t: TypeId.Sub; p: string; d: Of<Anonymous> };
export type ArrType = { t: TypeId.Arr; d: Anonymous };
// Set types:
export type SetType = { t: TypeId.Set; d: Anonymous };
export type FastSetType = { t: TypeId.FastSet; d: Anonymous }; // Fast Set, used for std::unordered_set in C++
// Map types:
export type MapType = { t: TypeId.Map; k: Anonymous; v: Anonymous };
export type FastMapType = { t: TypeId.FastMap; k: Anonymous; v: Anonymous }; // Fast Map, used for std::unordered_map in C++
// Tuple types, a fixed-size array of types
export type TupType = { t: TypeId.Tup; l: Anonymous[] };
// Reference type, Points at a type by name
export type RefType = { t: TypeId.Ref; r: string };
// Optional type
export type OptType = { t: TypeId.Opt; d: Types };
// Enumeration Types:
export type Enum = { t: TypeId.Enum; u: Int | I; v: string[] };
export type NEnum = { t: TypeId.NEnum; u: Int | I; v: Of<number> };
export type SEnum = { t: TypeId.SEnum; v: Of<string> };

export type EnumType = Enum | NEnum | SEnum;
// Objects and Enumeratoins have to be named, so they can't be used in anonymous context
export type Collection =
  | ArrType
  | SetType
  | FastSetType
  | MapType
  | FastMapType;
export type Anonymous = Simple | RefType | Collection | TupType | OptType;
export type NamedTypes = ObjType | SubType | EnumType;
export type Types = Anonymous | NamedTypes | I;
export type SymbolList = Record<string, Types>;

export type EmitItem<T> = (name: string, item: T) => string[];

export type Emitter = {
  setInputFilename: (fileName: string) => void;
  setOutputFilename: (fileName: string) => void;
  setAdditionalOptions: (opts: Record<string, string>) => void;
  generateHeader: () => string[];
  generateFooter: () => string[];
  types: {
    simpleType: EmitItem<Simple>;
    objType: EmitItem<ObjType>;
    optType: EmitItem<OptType>;
    subType: EmitItem<SubType>;
    arrType: EmitItem<ArrType>;
    setType: EmitItem<SetType>;
    fastSetType: EmitItem<FastSetType>;
    mapType: EmitItem<MapType>;
    fastMapType: EmitItem<FastMapType>;
    tupType: EmitItem<TupType>;
    strType: EmitItem<Str>;
    enumType: EmitItem<Enum>;
    numEnumType: EmitItem<NEnum>;
    strEnumType: EmitItem<SEnum>;
  };
  postProcess?: (code: string[]) => PromiseLike<string[]>;
};

export type FileGenerator = (
  inputFileName: string,
  outputFileName: string,
  items: Record<string, Types>,
) => PromiseLike<void>;

export type CodeGenerator = (
  inputFileName: string,
  outputFileName: string,
  items: Record<string, Types>,
) => PromiseLike<string[]>;

export type IdlGenerator = {
  code: CodeGenerator;
  file: FileGenerator;
};

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
