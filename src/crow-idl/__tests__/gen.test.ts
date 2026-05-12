import * as TC from '@freik/typechk';
import { $ } from 'bun';
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import ts from 'typescript';

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
  Types,
  u16,
  u32,
  u64,
  u8,
} from '../../../IDL';
import { GetTypescriptGenerator } from '../emitters/typescript';

const cppOutFileName = '__test__gen.hpp';
const tsOutFileName = '__test__gen.ts';

async function fileCleanup() {
  await $`rm -rf ${cppOutFileName} ${tsOutFileName}`;
}

beforeAll(fileCleanup);
afterAll(fileCleanup);

const typesToGenerate: Record<string, Types> = {
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
  Int8Array: arr(i8()),
  Int16Set: set(i16()),
  CharFastSet: fset(chr()),
  Int32toStrMap: map(i32(), str()),
  StrToU16FastMap: fmap(str(), u16()),
  MyObj: obj({ a: str(), b: i32(), c: bool(), d: opt(chr()) }),
  MySub: sub('MyObj', { x: str(), y: i32() }),
  MyTup: tup(str(), i32(), bool()),
  MyOpt: opt(ref('MySub')),
  MyEnum: enum_lst(u8(), ['a', 'b', 'c']),
  MyNEnum: enum_num(i32(), { a: 1, b: 2, c: 3 }),
  MySEnum: enum_str({ a: 'apple', b: 'banana', c: 'cherry' }),
};

function tsCheck(filename: string): readonly ts.Diagnostic[] {
  const program = ts.createProgram([filename], {
    noEmit: true,
    strict: true,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.NodeNext,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    skipLibCheck: true,
    allowJs: true,
    // types: ['@types/bun', '@freik/typechk'],
    allowSyntheticDefaultImports: true,
    isolatedModules: false,
    noImplicitAny: true,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strictNullChecks: true,
    strictPropertyInitialization: true,
    noUnusedLocals: false,
    noUnusedParameters: false,
    noFallthroughCasesInSwitch: true,
    noImplicitReturns: true,
    skipDefaultLibCheck: true,
  });
  return ts.getPreEmitDiagnostics(program);
}

/*
diagnostics.forEach(d => {
  const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
  console.log(`${fileName} (${d.start}): ${message}`);
});
*/

describe('Typescript codegen', () => {
  it('Type checking generated output', async () => {
    await GetTypescriptGenerator().file(
      'fakeInput.ts',
      tsOutFileName,
      typesToGenerate,
    );
    const val = tsCheck(tsOutFileName);
    val.forEach((d) => {
      const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
      console.log(`${tsOutFileName} (${d.start}): ${message}`);
    });
    expect(val).toHaveLength(0);
  });
  it('Execution of some of the generated code', async () => {
    const code = await GetTypescriptGenerator().code(
      'fakeInput.ts',
      tsOutFileName,
      typesToGenerate,
    );
    // Add the testing code to the end of the generated code...
    code.push(`
      const myObj: TC.Of<Types> = {
        MyI8: 127,
        NotMyI8: -129,
        MyI16: -32768,
        NotMyI16: 32768,
        MyI32: 2147483647,
        NotMyI32: -2147483999,
        MyI64: BigInt('9223372036854775807'),
        NotMyI64: BigInt('12349223372036854775808'),
        MyU8: 255,
        NotMyU8: 256,
        MyU16: 65535,
        NotMyU16: 655366,
        MyU32: 4294967295,
        NotMyU32: 4294967296,
        MyU64: BigInt('18446744073709551615'),
        NotMyU64: -5555555555,
        MyFloat: 3.14,
        NotMyFloat: Math.pow(2, 128),
        MyDouble: 2.718281828459045,
        NotMyDouble: Math.NaN,
        MyString: 'Hello, World!',
        NotMyString: 12345,
        MyBoolean: true,
        NotMyBoolean: 'true',
        MyChar: 'A',
        NotMyChar: "ab",
        NotMyChar2: 123,
        Int8Array: [1, 2, 3],
        NotInt8Array: [1, 2, 3, 'b'],
        Int16Set: new Set([1, 2, 3]),
        NotInt16Set: new Set([1, 2, '3']),
        CharFastSet: new Set(['a', 'b', 'c']),
        NotCharFastSet: new Set(['a', 'b', 123]),
        NotCharFastSet2: new Map([['a', 1], ['b', 2]]),
        Int32toStrMap: new Map([[1, 'one'], [2, 'two']]),
        NotInt32toStrMap: new Map([[1, 'one'], [2, 3]]),
        NotInt32toStrMap2: new Map([[1, 'one'], ['2', 3]]),
        StrToU16FastMap: new Map([['one', 1], ['two', 2]]),
        NotStrToU16FastMap: new Map([['one', 1], ['two', 77777]]),
        MyObj: { a: 'test', b: 42, c: false },
        NotMyObj: { a: 'test', b: 42 },
        NotMyObj2: { a: 'test', b: 42, c: 1 },
        MySub: { a: 'test2', b: 43, c: true, x: 'subtest', y: 100 },
        NotMySub: { a: 'test2', b: 43, c: true, x: 'subtest', y: 1.2 },
        NotMySub2: { a: 'test2', b: 43, c: true, x: 'subtest' },
        MyTup: ['tuple', 123, true],
        NotMyTup: ['tuple', 123, true, 'extra'],
        NotMyTup2: ['tuple', 123, 456],
        NotMyTup3: ['tuple', 123, true, 'extra', 456],
        MyOptNothing: undefined,
        MyOpt: { a: 'test3', b: 445, c: true, x: 'optional', y: 200 },
        NotMyOpt: { a: 'test3', b: 445, c: true, x: 'optional', y: 2.1},
        NotMyOpt2: { a: 'test3', b: 445, c: true, x: 'optional' },
        MyEnum: MyEnum.a,
        NotMyEnum: 3,
        MyNEnum: MyNEnum.b,
        NotMyNEnum: 4,
        MySEnum: MySEnum.c,
        NotMySEnum: 'date',
      };
      expect(chkMyI8(myObj.MyI8)).toBeTrue();
      expect(chkMyI8(myObj.NotMyI8)).toBeFalse();
      expect(chkMyI16(myObj.MyI16)).toBeTrue();
      expect(chkMyI16(myObj.NotMyI16)).toBeFalse();
      expect(chkMyI32(myObj.MyI32)).toBeTrue();
      expect(chkMyI32(myObj.NotMyI32)).toBeFalse();
      expect(chkMyI64(myObj.MyI64)).toBeTrue();
      expect(chkMyI64(myObj.NotMyI64)).toBeFalse();
      expect(chkMyU8(myObj.MyU8)).toBeTrue();
      expect(chkMyU8(myObj.NotMyU8)).toBeFalse();
      expect(chkMyU16(myObj.MyU16)).toBeTrue();
      expect(chkMyU16(myObj.NotMyU16)).toBeFalse();
      expect(chkMyU32(myObj.MyU32)).toBeTrue();
      expect(chkMyU32(myObj.NotMyU32)).toBeFalse();
      expect(chkMyU64(myObj.MyU64)).toBeTrue();
      expect(chkMyU64(myObj.NotMyU64)).toBeFalse();
      expect(chkMyFloat(myObj.MyFloat)).toBeTrue();
      expect(chkMyFloat(myObj.NotMyFloat)).toBeFalse();
      expect(chkMyDouble(myObj.MyDouble)).toBeTrue();
      expect(chkMyDouble(myObj.NotMyDouble)).toBeFalse();
      expect(chkMyString(myObj.MyString)).toBeTrue();
      expect(chkMyString(myObj.NotMyString)).toBeFalse();
      expect(chkMyBoolean(myObj.MyBoolean)).toBeTrue();
      expect(chkMyBoolean(myObj.NotMyBoolean)).toBeFalse();
      expect(chkMyChar(myObj.MyChar)).toBeTrue();
      expect(chkMyChar(myObj.NotMyChar)).toBeFalse();
      expect(chkInt8Array(myObj.Int8Array)).toBeTrue();
      expect(chkInt8Array(myObj.NotInt8Array)).toBeFalse();
      expect(chkInt16Set(myObj.Int16Set)).toBeTrue();
      expect(chkInt16Set(myObj.NotInt16Set)).toBeFalse();
      expect(chkCharFastSet(myObj.CharFastSet)).toBeTrue();
      expect(chkCharFastSet(myObj.NotCharFastSet)).toBeFalse();
      expect(chkInt32toStrMap(myObj.Int32toStrMap)).toBeTrue();
      expect(chkInt32toStrMap(myObj.NotInt32toStrMap)).toBeFalse();
      expect(chkInt32toStrMap(myObj.NotInt32toStrMap2)).toBeFalse();
      expect(chkStrToU16FastMap(myObj.StrToU16FastMap)).toBeTrue();
      expect(chkStrToU16FastMap(myObj.NotStrToU16FastMap)).toBeFalse();
      expect(chkMyObj(myObj.MyObj)).toBeTrue();
      expect(chkMyObj(myObj.NotMyObj)).toBeFalse();
      expect(chkMyObj(myObj.NotMyObj2)).toBeFalse();
      expect(chkMySub(myObj.MySub)).toBeTrue();
      expect(chkMySub(myObj.NotMySub)).toBeFalse();
      expect(chkMySub(myObj.NotMySub2)).toBeFalse();
      expect(chkMyTup(myObj.MyTup)).toBeTrue();
      expect(chkMyTup(myObj.NotMyTup)).toBeFalse();
      expect(chkMyTup(myObj.NotMyTup2)).toBeFalse();
      expect(chkMyTup(myObj.NotMyTup3)).toBeFalse();
      expect(chkMyOpt(myObj.MyOptNothing)).toBeTrue();
      expect(chkMyOpt(myObj.MyOpt)).toBeTrue();
      expect(chkMyOpt(myObj.NotMyOpt)).toBeFalse();
      expect(chkMyOpt(myObj.NotMyOpt2)).toBeFalse();
      expect(chkMyEnum(myObj.MyEnum)).toBeTrue();
      expect(chkMyEnum(myObj.NotMyEnum)).toBeFalse();
      expect(chkMyNEnum(myObj.MyNEnum)).toBeTrue();
      expect(chkMyNEnum(myObj.NotMyNEnum)).toBeFalse();
      expect(chkMySEnum(myObj.MySEnum)).toBeTrue();
      expect(chkMySEnum(myObj.NotMySEnum)).toBeFalse();
    `);
    const result = new Bun.Transpiler({ loader: 'tsx' }).transformSync(
      code.join('\n'),
    );
    expect(
      result.startsWith('import * as TC from "@freik/typechk";'),
    ).toBeTrue();
    // Rip off the import statement and remove all exports
    const trimmed = result.substring(38).replaceAll('\nexport ', '\n');
    expect(TC).toBeDefined();
    eval(trimmed);
  });
});
