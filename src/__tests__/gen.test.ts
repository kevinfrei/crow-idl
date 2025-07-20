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
});
