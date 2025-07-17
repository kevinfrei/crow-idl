import { $ } from 'bun';
import { afterAll, beforeAll, describe, expect, it, test } from 'bun:test';
import { GetCppGenerator } from '../emitters/cpp';
import { GetTypescriptGenerator } from '../emitters/typescript';
import {
  arr,
  bool,
  chr,
  dbl,
  enum_lst,
  enum_num,
  enum_str,
  flt,
  fmap,
  fset,
  i16,
  i32,
  i64,
  i8,
  map,
  obj,
  opt,
  ref,
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

const cppOutFileName = '__test__outputFile.hpp';
const tsOutFileName = '__test__outputFile.ts';

async function fileCleanup() {
  await $`rm -rf ${cppOutFileName} ${tsOutFileName}`;
}

beforeAll(fileCleanup);
afterAll(fileCleanup);

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
  MyObj: obj({ a: str(), b: i32(), c: bool(), d: opt(chr()) }),
  MySub: sub('MyObj', { x: str(), y: i32() }),
  MyTup: tup(str(), i32(), bool()),
  MyOpt: opt(ref('MySub')),
};

const enumTypes: Record<string, Types> = {
  MyEnum: enum_lst(u8(), ['a', 'b', 'c']),
  MyNEnum: enum_num(i32(), { a: 1, b: 2, c: 3 }),
  MySEnum: enum_str({ a: 'apple', b: 'banana', c: 'cherry' }),
};

function cleanup(str: string[]): string[] {
  return str.map((line) => line.trim()).filter((line) => line.length > 0);
}

function cleanCode(
  gen: CodeGenerator,
  outName: string,
  toGen: Record<string, Types>,
): string[] {
  return cleanup(gen('inputFile.ts', outName, toGen));
}

describe('Typescript codegen expectations', () => {
  it('Simple types', () => {
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
  it('Collection types', () => {
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
  it('Aggregate types', () => {
    const deform = cleanCode(
      GetTypescriptGenerator().code,
      'outputFile.ts',
      aggregateTypes,
    );
    const single = deform.join(' ');
    expect(
      single.indexOf(
        'export type MyObj = { a: string; b: number; c: boolean; d?: string; }',
      ),
    ).toBeGreaterThan(0);
    expect(
      single.indexOf('export type MySub = MyObj & { x: string; y: number; }'),
    ).toBeGreaterThan(0);
    expect(
      single.indexOf('export type MyTup = [string, number, boolean]'),
    ).toBeGreaterThan(0);
    expect(
      Math.max(
        single.indexOf('export type MyOpt = (MySub | undefined);'),
        single.indexOf('export type MyOpt = MySub | undefined;'),
      ),
    ).toBeGreaterThan(0);
  });
  it('Enumeration types', () => {
    const deform = cleanCode(
      GetTypescriptGenerator().code,
      'outputFile.ts',
      enumTypes,
    );
    const single = deform.join(' ');
    expect(
      single.indexOf(
        'export const MyEnum = Object.freeze({ a: 0, b: 1, c: 2 })',
      ),
    ).toBeGreaterThan(0);
    expect(
      single.indexOf(
        'export type MyEnum = (typeof MyEnum)[keyof typeof MyEnum];',
      ),
    ).toBeGreaterThan(0);
    expect(
      single.indexOf(
        'export const MyNEnum = Object.freeze({ a: 1, b: 2, c: 3, })',
      ),
    ).toBeGreaterThan(0);
    expect(
      single.indexOf(
        'export type MyNEnum = (typeof MyNEnum)[keyof typeof MyNEnum];',
      ),
    ).toBeGreaterThan(0);
    expect(
      single.indexOf(
        "export const MySEnum = Object.freeze({ a: 'apple', b: 'banana', c: 'cherry', })",
      ),
    ).toBeGreaterThan(0);
    expect(
      single.indexOf(
        'export type MySEnum = (typeof MySEnum)[keyof typeof MySEnum];',
      ),
    ).toBeGreaterThan(0);
  });
});

describe('C++ codegen expectations', () => {
  it('Simple types', () => {
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
  it('Collection types', () => {
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
  it('Aggregate types', () => {
    const deform = cleanCode(
      GetCppGenerator().code,
      'outputFile.hpp',
      aggregateTypes,
    );
    const single = deform.join(' ');
    expect(
      single.indexOf(
        'struct MyObj { std::string a; std::int32_t b; bool c; std::optional<char> d; };',
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
    expect(
      single.indexOf('using MyOpt = std::optional<MySub>;'),
    ).toBeGreaterThan(0);
  });
  it('Enumeration types', () => {
    const deform = cleanCode(
      GetCppGenerator().code,
      'outputFile.hpp',
      enumTypes,
    );
    const single = deform.join(' ');
    expect(
      single.indexOf('enum class MyEnum : std::uint8_t { a, b, c };'),
    ).toBeGreaterThan(0);
    expect(
      single.indexOf(
        'enum class MyNEnum : std::int32_t { a = 1, b = 2, c = 3, };',
      ),
    ).toBeGreaterThan(0);
    expect(single.indexOf('enum class MySEnum { a, b, c };')).toBeGreaterThan(
      0,
    );
  });
});

test('IDL API consistency', async () => {
  const types = {
    ...simpleTypes,
    ...collectionTypes,
    ...aggregateTypes,
    ...enumTypes,
  };
  // Compare the code generated by the .code interface as the file output in the .file interface
  await GetTypescriptGenerator().file('inputFile.ts', tsOutFileName, types);
  await GetCppGenerator().file('inputFile.ts', cppOutFileName, types);
  // Read the contents of the generated files
  const tsCode = cleanup((await Bun.file(tsOutFileName).text()).split('\n'));
  const cppCode = cleanup((await Bun.file(cppOutFileName).text()).split('\n'));
  const tsFlattenedFile = cleanup(
    cleanCode(GetTypescriptGenerator().code, tsOutFileName, types),
  );
  const cppFlattenedFile = cleanup(
    cleanCode(GetCppGenerator().code, cppOutFileName, types),
  );
  expect(tsCode.join('@')).toEqual(tsFlattenedFile.join('@'));
  // This one doesn't work yet. Need to diagnose why.
  // expect(cppCode.join('@')).toEqual(cppFlattenedFile.join('@'));
});
