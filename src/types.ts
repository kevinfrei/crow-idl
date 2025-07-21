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

export type Of<T> = { [key: string]: T };

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
