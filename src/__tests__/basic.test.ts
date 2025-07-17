import { isArrayOfString } from '@freik/typechk';
import { describe, expect, it } from 'bun:test';
import { GetCppGenerator } from '../emitters/cpp';
import { GetTypescriptGenerator } from '../emitters/typescript';
import {
  arr,
  bool,
  chr,
  dbl,
  flt,
  fmap,
  fset,
  i16,
  i32,
  i64,
  i8,
  map,
  obj,
  set,
  str,
  sub,
  tup,
  u16,
  u32,
  u64,
  u8,
} from '../IDL';
import type { CodeGenerator, Types } from '../types';

describe('The Basics', () => {
  it('C++ IDL generator', () => {
    const { code, file } = GetCppGenerator();
    expect(code).toBeDefined();
    expect(file).toBeDefined();
    expect(typeof code).toBe('function');
    expect(typeof file).toBe('function');
  });

  it('Typescript IDL generator', () => {
    const generator = GetTypescriptGenerator();
    expect(generator.code).toBeInstanceOf(Function);
    expect(generator.file).toBeInstanceOf(Function);
  });
});

function genCheck(
  gen: CodeGenerator,
  toGen: Record<string, Types>,
  exp: string,
) {
  const code = gen('inputFile.ts', 'outputFile.ts', toGen);
  const isType = isArrayOfString(code);
  expect(isType).toBeTrue();
  if (!isType) throw new Error();
  const pos = code.indexOf(exp);
  if (pos < 0) {
    console.error(`Expected code not found: ${exp}`);
    console.error(`Generated code: ${code.join('\n')}`);
  }
  expect(pos >= 0).toBeTrue();
}

const simpleTypes: Record<string, Types> = {
  MyI8: i8(),
  MyI16: i16(),
  MyI32: i32(),
  MyI64: i64(),
  MyU8: u8(),
  MyU16: u16(),
  MyU32: u32(),
  MyU64: u64(),
  MyFloat: flt(),
  MyDouble: dbl(),
  MyString: str(),
  MyBoolean: bool(),
  MyChar: chr(),
};

const collectionTypes: Record<string, Types> = {
  Int8Array: arr(i8()),
  Int16Set: set(i16()),
  CharFastSet: fset(chr()),
  Int32toStrMap: map(i32(), str()),
  StrToU16FastMap: fmap(str(), u16()),
};

const aggregateTypes: Record<string, Types> = {
  MyObj: obj({ a: str(), b: i32(), c: bool() }),
  MySub: sub('MyObj', { x: str(), y: i32() }),
  MyTup: tup(str(), i32(), bool()),
};

function cleanCode(
  gen: CodeGenerator,
  outName: string,
  toGen: Record<string, Types>,
): string[] {
  const code = gen('inputFile.ts', outName, toGen);
  return code.map((line) => line.trim()).filter((line) => line.length > 0);
}

describe('Typescript IDL Types', () => {
  it('Try simple Typescript IDL types', () => {
    const deform = cleanCode(
      GetTypescriptGenerator().code,
      'outputFile.ts',
      simpleTypes,
    );
    expect(deform.indexOf('export type MyI8 = number;')).toBeGreaterThan(0);
    expect(deform.indexOf('export type MyI16 = number;')).toBeGreaterThan(0);
    expect(deform.indexOf('export type MyI32 = number;')).toBeGreaterThan(0);
    expect(deform.indexOf('export type MyI64 = BigInt;')).toBeGreaterThan(0);
    expect(deform.indexOf('export type MyU8 = number;')).toBeGreaterThan(0);
    expect(deform.indexOf('export type MyU16 = number;')).toBeGreaterThan(0);
    expect(deform.indexOf('export type MyU32 = number;')).toBeGreaterThan(0);
    expect(deform.indexOf('export type MyU64 = BigInt;')).toBeGreaterThan(0);
    expect(deform.indexOf('export type MyFloat = number;')).toBeGreaterThan(0);
    expect(deform.indexOf('export type MyDouble = number;')).toBeGreaterThan(0);
    expect(deform.indexOf('export type MyString = string;')).toBeGreaterThan(0);
    expect(deform.indexOf('export type MyBoolean = boolean;')).toBeGreaterThan(
      0,
    );
    expect(deform.indexOf('export type MyChar = string;')).toBeGreaterThan(0);
  });
  it('Try collection Typescript IDL types', () => {
    const deform = cleanCode(
      GetTypescriptGenerator().code,
      'outputFile.ts',
      collectionTypes,
    );
    expect(deform.indexOf('export type Int8Array = number[];')).toBeGreaterThan(
      0,
    );
    expect(
      deform.indexOf('export type Int16Set = Set<number>;'),
    ).toBeGreaterThan(0);
    expect(
      deform.indexOf('export type CharFastSet = Set<string>;'),
    ).toBeGreaterThan(0);
    expect(
      deform.indexOf('export type Int32toStrMap = Map<number, string>;'),
    ).toBeGreaterThan(0);
    expect(
      deform.indexOf('export type StrToU16FastMap = Map<string, number>;'),
    ).toBeGreaterThan(0);
  });
  it('Try aggregate Typescript IDL types', () => {
    const deform = cleanCode(
      GetTypescriptGenerator().code,
      'outputFile.ts',
      aggregateTypes,
    );
    const single = deform.join(' ');
    expect(
      single.indexOf(
        'export type MyObj = { a: string; b: number; c: boolean; }',
      ),
    ).toBeGreaterThan(0);
    expect(
      single.indexOf('export type MySub = MyObj & { x: string; y: number; }'),
    ).toBeGreaterThan(0);
    expect(
      single.indexOf('export type MyTup = [string, number, boolean]'),
    ).toBeGreaterThan(0);
  });
});
describe('C++ IDL Types', () => {
  it('Try simple C++ IDL types', () => {
    const deform = cleanCode(
      GetCppGenerator().code,
      'outputFile.hpp',
      simpleTypes,
    );
    expect(deform.indexOf('using MyI8 = std::int8_t;')).toBeGreaterThan(0);
    expect(deform.indexOf('using MyI16 = std::int16_t;')).toBeGreaterThan(0);
    expect(deform.indexOf('using MyI32 = std::int32_t;')).toBeGreaterThan(0);
    expect(deform.indexOf('using MyI64 = std::int64_t;')).toBeGreaterThan(0);
    expect(deform.indexOf('using MyU8 = std::uint8_t;')).toBeGreaterThan(0);
    expect(deform.indexOf('using MyU16 = std::uint16_t;')).toBeGreaterThan(0);
    expect(deform.indexOf('using MyU32 = std::uint32_t;')).toBeGreaterThan(0);
    expect(deform.indexOf('using MyU64 = std::uint64_t;')).toBeGreaterThan(0);
    expect(deform.indexOf('using MyFloat = float;')).toBeGreaterThan(0);
    expect(deform.indexOf('using MyDouble = double;')).toBeGreaterThan(0);
    expect(deform.indexOf('using MyString = std::string;')).toBeGreaterThan(0);
    expect(deform.indexOf('using MyBoolean = bool;')).toBeGreaterThan(0);
    expect(deform.indexOf('using MyChar = char;')).toBeGreaterThan(0);
  });
  it('Try collection C++ IDL types', () => {
    const deform = cleanCode(
      GetCppGenerator().code,
      'outputFile.hpp',
      collectionTypes,
    );
    expect(
      deform.indexOf('using Int8Array = std::vector<std::int8_t>;'),
    ).toBeGreaterThan(0);
    expect(
      deform.indexOf('using Int16Set = std::set<std::int16_t>;'),
    ).toBeGreaterThan(0);
    expect(
      deform.indexOf('using CharFastSet = std::unordered_set<char>;'),
    ).toBeGreaterThan(0);
    expect(
      deform.indexOf(
        'using Int32toStrMap = std::map<std::int32_t, std::string>;',
      ),
    ).toBeGreaterThan(0);
    expect(
      deform.indexOf(
        'using StrToU16FastMap = std::unordered_map<std::string, std::uint16_t>;',
      ),
    ).toBeGreaterThan(0);
  });
  it('Try aggregate C++ IDL types', () => {
    const deform = cleanCode(
      GetCppGenerator().code,
      'outputFile.hpp',
      aggregateTypes,
    );
    const single = deform.join(' ');
    expect(
      single.indexOf(
        'struct MyObj { std::string a; std::int32_t b; bool c; };',
      ),
    ).toBeGreaterThan(0);
    expect(
      single.indexOf(
        'struct MySub : public MyObj { std::string x; std::int32_t y; };',
      ),
    ).toBeGreaterThan(0);
    expect(
      single.indexOf(
        'using MyTup = std::tuple<std::string, std::int32_t, bool>;',
      ),
    ).toBeGreaterThan(0);
  });
});
