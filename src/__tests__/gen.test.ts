import * as TC from '@freik/typechk';
import { $ } from 'bun';
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import ts from 'typescript';

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
import type { Types } from '../types';

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
      expect(chkMyI8(myObj.MyI8)).toBeTruthy();
      expect(chkMyI8(myObj.NotMyI8)).toBeFalsy();
      expect(chkMyI16(myObj.MyI16)).toBeTruthy();
      expect(chkMyI16(myObj.NotMyI16)).toBeFalsy();
      expect(chkMyI32(myObj.MyI32)).toBeTruthy();
      expect(chkMyI32(myObj.NotMyI32)).toBeFalsy();
      expect(chkMyI64(myObj.MyI64)).toBeTruthy();
      expect(chkMyI64(myObj.NotMyI64)).toBeFalsy();
      expect(chkMyU8(myObj.MyU8)).toBeTruthy();
      expect(chkMyU8(myObj.NotMyU8)).toBeFalsy();
      expect(chkMyU16(myObj.MyU16)).toBeTruthy();
      expect(chkMyU16(myObj.NotMyU16)).toBeFalsy();
      expect(chkMyU32(myObj.MyU32)).toBeTruthy();
      expect(chkMyU32(myObj.NotMyU32)).toBeFalsy();
      expect(chkMyU64(myObj.MyU64)).toBeTruthy();
      expect(chkMyU64(myObj.NotMyU64)).toBeFalsy();
      expect(chkMyFloat(myObj.MyFloat)).toBeTruthy();
      expect(chkMyFloat(myObj.NotMyFloat)).toBeFalsy();
      expect(chkMyDouble(myObj.MyDouble)).toBeTruthy();
      expect(chkMyDouble(myObj.NotMyDouble)).toBeFalsy();
      expect(chkMyString(myObj.MyString)).toBeTruthy();
      expect(chkMyString(myObj.NotMyString)).toBeFalsy();
      expect(chkMyBoolean(myObj.MyBoolean)).toBeTruthy();
      expect(chkMyBoolean(myObj.NotMyBoolean)).toBeFalsy();
      expect(chkMyChar(myObj.MyChar)).toBeTruthy();
      expect(chkMyChar(myObj.NotMyChar)).toBeFalsy();
      expect(chkInt8Array(myObj.Int8Array)).toBeTruthy();
      expect(chkInt8Array(myObj.NotInt8Array)).toBeFalsy();
      expect(chkInt16Set(myObj.Int16Set)).toBeTruthy();
      expect(chkInt16Set(myObj.NotInt16Set)).toBeFalsy();
      expect(chkCharFastSet(myObj.CharFastSet)).toBeTruthy();
      expect(chkCharFastSet(myObj.NotCharFastSet)).toBeFalsy();
      expect(chkInt32toStrMap(myObj.Int32toStrMap)).toBeTruthy();
      expect(chkInt32toStrMap(myObj.NotInt32toStrMap)).toBeFalsy();
      expect(chkInt32toStrMap(myObj.NotInt32toStrMap2)).toBeFalsy();
      expect(chkStrToU16FastMap(myObj.StrToU16FastMap)).toBeTruthy();
      expect(chkStrToU16FastMap(myObj.NotStrToU16FastMap)).toBeFalsy();
      expect(chkMyObj(myObj.MyObj)).toBeTruthy();
      expect(chkMyObj(myObj.NotMyObj)).toBeFalsy();
      expect(chkMyObj(myObj.NotMyObj2)).toBeFalsy();
      expect(chkMySub(myObj.MySub)).toBeTruthy();
      expect(chkMySub(myObj.NotMySub)).toBeFalsy();
      expect(chkMySub(myObj.NotMySub2)).toBeFalsy();
      expect(chkMyTup(myObj.MyTup)).toBeTruthy();
      expect(chkMyTup(myObj.NotMyTup)).toBeFalsy();
      expect(chkMyTup(myObj.NotMyTup2)).toBeFalsy();
      expect(chkMyTup(myObj.NotMyTup3)).toBeFalsy();
      expect(chkMyOpt(myObj.MyOptNothing)).toBeTruthy();
      expect(chkMyOpt(myObj.MyOpt)).toBeTruthy();
      expect(chkMyOpt(myObj.NotMyOpt)).toBeFalsy();
      expect(chkMyOpt(myObj.NotMyOpt2)).toBeFalsy();
      expect(chkMyEnum(myObj.MyEnum)).toBeTruthy();
      expect(chkMyEnum(myObj.NotMyEnum)).toBeFalsy();
      expect(chkMyNEnum(myObj.MyNEnum)).toBeTruthy();
      expect(chkMyNEnum(myObj.NotMyNEnum)).toBeFalsy();
      expect(chkMySEnum(myObj.MySEnum)).toBeTruthy();
      expect(chkMySEnum(myObj.NotMySEnum)).toBeFalsy();
    `);
    const result = new Bun.Transpiler({ loader: 'tsx' }).transformSync(
      code.join('\n'),
    );
    expect(
      result.startsWith('import * as TC from "@freik/typechk";'),
    ).toBeTruthy();
    // Rip off the import statement and remove all exports
    const trimmed = result.substring(38).replaceAll('\nexport ', '\n');
    expect(TC).toBeDefined();
    eval(trimmed);
  });
});
