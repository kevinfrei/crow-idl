import { isArrayOfString } from '@freik/typechk';
import { describe, expect, it } from 'bun:test';
import { GetCppGenerator } from '../emitters/cpp';
import { GetTypescriptGenerator } from '../emitters/typescript';
import {
  bool,
  chr,
  dbl,
  flt,
  i16,
  i32,
  i64,
  i8,
  str,
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
describe('Typescript IDL Types', () => {
  it('Try simple Typescript IDL types', () => {
    const code = GetTypescriptGenerator().code('inputFile.ts', 'outputFile.ts', simpleTypes);
    const deform = code.map((line) => line.trim());
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
    expect(deform.indexOf('export type MyBoolean = boolean;')).toBeGreaterThan(0);
    expect(deform.indexOf('export type MyChar = string;')).toBeGreaterThan(0);
  });
});
describe('C++ IDL Types', () => {
  it('Try simple C++ IDL types', () => {
    const code = GetCppGenerator().code('inputFile.ts', 'outputFile.hpp', simpleTypes);
    const deform = code.map((line) => line.trim());
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
});
