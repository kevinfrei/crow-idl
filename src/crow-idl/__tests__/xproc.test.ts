import { hasField, Pickle, Unpickle } from '@freik/typechk';
import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { spawn } from 'child_process';
import * as readline from 'readline';
import { chkAggregate, chkAggregate2, chkAggregate3, chkCharFastSet, chkInt16Set, chkInt32toStrMap, chkInt8Array, chkMyBoolean, chkMyChar, chkMyEnum, chkMyFloat, chkMyI16, chkMyI32, chkMyI64, chkMyI8, chkMyNEnum, chkMyObj, chkMyOpt, chkMySEnum, chkMyString, chkMySub, chkMyTup, chkMyU16, chkMyU32, chkMyU64, chkMyU8, chkStrToU16FastMap, MyEnum, MyNEnum, MySEnum } from '../../../cpptests/gen.ts';
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
      { id: 'MyI8', chk: chkMyI8, input: -122 },
      { id: 'MyI16', chk: chkMyI16, input: -16384 },
      { id: 'MyI32', chk: chkMyI32, input: -2097152 },
      { id: 'MyI64', chk: chkMyI64, input: -123456789012345n },
      { id: 'MyU8', chk: chkMyU8, input: 255 },
      { id: 'MyU16', chk: chkMyU16, input: 65535 },
      { id: 'MyU32', chk: chkMyU32 , input: 4294967295 },
      { id: 'MyU64', chk: chkMyU64, input: 9876543210987654n },
      { id: 'MyFloat', chk: chkMyFloat, input: 3.14 },
      { id: 'MyString', chk: chkMyString, input: 'Hello, World!' },
      { id: 'MyBoolean', chk: chkMyBoolean, input: true },
      { id: 'MyChar', chk: chkMyChar, input: 'A' },
      { id: 'Int8Array', chk: chkInt8Array, input: [-128, 0, 127] },
      { id: 'Int16Set', chk: chkInt16Set, input: new Set([1, 2, 3]) },
      { id: 'CharFastSet', chk: chkCharFastSet, input: new Set(['x', 'y', 'z']) },
      { id: 'Int32toStrMap', chk: chkInt32toStrMap, input: new Map([[ 1, 'one' ], [ 2, 'two' ]]) },
      { id: 'StrToU16FastMap', chk: chkStrToU16FastMap, input: new Map([['a', 1], ['b', 2]]) },
      { id: 'MyObj', chk: chkMyObj, input: { a: 'test', b: 42, c: true, d: 'o' } },
      {
        id: 'MySub',
        chk: chkMySub,
        input: { a: 'subtest', b: 24, c: false, x: 'extra', y: 99 },
      },
      { id: 'MyTup', chk: chkMyTup, input: ['tuple', 123, false] },
      { id: 'MyOpt', chk: chkMyOpt, input: { a: 'opt', b: 7, c: true, x: 'subopt', y: 88 } },
      // You cannot have an optional top-level type
      // { id: 'MyOpt 2', chk: chkMyOpt, input: undefined },
      { id: 'MyEnum', chk: chkMyEnum, input: MyEnum.a },
      { id: 'MyNEnum', chk: chkMyNEnum, input: MyNEnum.c },
      { id: 'MySEnum', chk: chkMySEnum, input: MySEnum.b },
      {
        id: 'Aggregate',
        chk: chkAggregate,
        input: { le: MyEnum.a, ne: MyNEnum.b, se: MySEnum.c },
      },
      {
        id: 'Aggregate2',
        chk: chkAggregate2,
        input: {
          tup: ['agg2', 456, true],
          opt: { a: 'opt2', b: 8, c: false, x: 'subopt2', y: 77 },
        },
      },
      { id: 'Aggregate2', chk: chkAggregate2, input: { tup: ['agg2-noopt', 789, false] } },
      {
        id: 'Aggregate3',
        chk: chkAggregate3,
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
      const result = await send({ id: test.id, input: test.input });
      expect(result).toEqual({ id: test.id, output: test.input });
      if (!hasField(result, 'output')) {
        console.error(`Missing 'output' field in response for ${test.id}:`, result);
        expect(result).toHaveProperty('output');
        continue;
      }
      const isType = test.chk(result.output);
      if (!isType) {
        console.error(`Type check failed for ${test.id}:`, result);
      }
      expect(test.chk(result.output)).toEqual(true);
    }
  });
});
