import { describe, expect, it } from 'bun:test';
import { GetCppGenerator } from '../emitters/cpp';
import { GetTypescriptGenerator } from '../emitters/typescript';

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
