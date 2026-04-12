import { Pickle, Unpickle } from '@freik/typechk';
import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { spawn } from 'child_process';
import * as readline from 'readline';
import { MyEnum, MyNEnum, MySEnum } from '../../../cpptests/gen.ts';
/*

MyI8 = number;
MyI16 = number;
MyI32 = number;
MyI64 = bigint;
MyU8 = number;
MyU16 = number;
MyU32 = number;
MyU64 = bigint;
MyFloat = number;
MyDouble = number;
MyString = string;
MyBoolean = boolean;
MyChar = string;
Int8Array = number[];
Int16Set = Set<number>;
CharFastSet = Set<string>;
Int32toStrMap = Map<number, string>;
StrToU16FastMap = Map<string, number>;
MyObj = {  a: string;  b: number;  c: boolean;  d?: string; };
MySub = MyObj & {  x: string;  y: number; };
MyTup = [string, number, boolean];
MyOpt = MySub | undefined;
MyEnum = Object.freeze({  a: 0,  b: 1,  c: 2 });
MyEnum = (typeof MyEnum)[keyof typeof MyEnum];
MyNEnum = Object.freeze({  a: 1,  b: 2,  c: 3 });
MyNEnum = (typeof MyNEnum)[keyof typeof MyNEnum];
MySEnum = Object.freeze({  a: 'apple',  b: 'banana',  c: 'cherry' });
MySEnum = (typeof MySEnum)[keyof typeof MySEnum];
Aggregate = {  le: MyEnum;  ne: MyNEnum;  se: MySEnum; };
Aggregate2 = {  tup: MyTup;  opt?: MySub; };
Aggregate3 = Aggregate2[];

*/
const BINARY_PATH = './cpptests/Debug/tests/js_cpp_xproc';

let kill_child: () => void;
let send: (data: unknown) => Promise<unknown>;

beforeAll(() => {
  const child = spawn(BINARY_PATH);
  kill_child = () => child.kill();
  const rl = readline.createInterface({ input: child.stdout });

  send = (data: unknown): Promise<unknown> => {
    return new Promise((resolve) => {
      rl.once('line', (line) => resolve(Unpickle(line)));
      child!.stdin!.write(Pickle(data) + '\n');
    });
  };
});
afterAll(() => {
  kill_child();
});

describe('C++/JS Pipe', () => {
  test('should echo back JSON data correctly', async () => {
    // This tests simple round-tripping of JSON data through the C++ process,
    // which validates that the C++ code can read and write JSON correctly.
    const tests = [
      { id: 'echo', input: { val: 2147483647 } },
      { id: 'echo', input: { status: 'ACTIVE' } }, // Testing your custom enums
      { id: 'echo', input: { a: { b: { c: 42 } } } },
      { id: 'echo', input: { items: [] } },
      { id: 'echo', input: { msg: 'Testing \n \t " 💩' } },
    ];

    for (const test of tests) {
      const result = await send(test);
      expect(result).toEqual({ id: 'echo', output: test.input });
    }
  });
  test('C++ roundtripping some IDL types', async () => {
    const tests = [
      { id: 'MyI8', input: -122 },
      { id: 'MyI16', input: -16384 },
      { id: 'MyI32', input: -2097152 },
      { id: 'MyI64', input: -12345678901234567890n },
      { id: 'MyU8', input: 255 },
      { id: 'MyU16', input: 65535 },
      { id: 'MyU32', input: 4294967295 },
      { id: 'MyU64', input: 98765432109876543210n },
      { id: 'MyFloat', input: 3.14 },
      { id: 'MyString', input: 'Hello, World!' },
      { id: 'MyBoolean', input: true },
      { id: 'MyChar', input: 'A' },
      { id: 'Int8Array', input: [-128, 0, 127] },
      { id: 'Int16Set', input: [1, 2, 3] },
      { id: 'CharFastSet', input: ['x', 'y', 'z'] },
      { id: 'Int32toStrMap', input: { 1: 'one', 2: 'two' } },
      { id: 'StrToU16FastMap', input: { a: 1, b: 2 } },
      { id: 'MyObj', input: { a: 'test', b: 42, c: true, d: 'optional' } },
      {
        id: 'MySub',
        input: { a: 'subtest', b: 24, c: false, x: 'extra', y: 99 },
      },
      { id: 'MyTup', input: ['tuple', 123, false] },
      { id: 'MyOpt', input: { a: 'opt', b: 7, c: true, x: 'subopt', y: 88 } },
      { id: 'MyOpt', input: null },
      { id: 'MyEnum', input: MyEnum.a },
      { id: 'MyNEnum', input: MyNEnum.c },
      { id: 'MySEnum', input: MySEnum.b },
      {
        id: 'Aggregate',
        input: { le: MyEnum.a, ne: MyNEnum.b, se: MySEnum.c },
      },
      {
        id: 'Aggregate2',
        input: {
          tup: ['agg2', 456, true],
          opt: { a: 'opt2', b: 8, c: false, x: 'subopt2', y: 77 },
        },
      },
      { id: 'Aggregate2', input: { tup: ['agg2-noopt', 789, false] } },
      {
        id: 'Aggregate3',
        input: [
          {
            tup: ['agg3-1', 111, true],
            opt: { a: 'opt3-1', b: 9, c: true, x: 'subopt3-1', y: 66 },
          },
          { tup: ['agg3-2', 222, false] },
        ],
      }, //,      { id: 'MyDouble', input: 3.141592653589793 },
    ];
    for (const test of tests) {
      const result = await send(test);
      expect(result).toEqual({ id: test.id, output: test.input });
    }
  });
});
