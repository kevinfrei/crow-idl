import { hasField, Pickle, Unpickle } from '@freik/typechk';
import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { spawn } from 'child_process';
import * as readline from 'readline';
import {
  chkAggregate,
  chkAggregate2,
  chkAggregate3,
  chkCharFastSet,
  chkInt16Set,
  chkInt32toStrMap,
  chkInt8Array,
  chkMyBoolean,
  chkMyChar,
  chkMyEnum,
  chkMyEnum2,
  chkMyFloat,
  chkMyI16,
  chkMyI32,
  chkMyI64,
  chkMyI8,
  chkMyNEnum,
  chkMyNEnum2,
  chkMyObj,
  chkMySEnum,
  chkMyString,
  chkMySub,
  chkMyTup,
  chkMyU16,
  chkMyU32,
  chkMyU64,
  chkMyU8,
  chkStrToU16FastMap,
  MyEnum,
  MyEnum2,
  MyNEnum,
  MyNEnum2,
  MySEnum,
} from '../../../cpptests/gen.ts';

const BINARY_PATH_MODULE = './cpptests/build/Debug/tests/js_cpp_xproc_module';

let kill_child: () => void;
let send: (data: unknown) => Promise<unknown>;

beforeAll(() => {
  const child = spawn(BINARY_PATH_MODULE);
  kill_child = () => child.kill();
  const rl = readline.createInterface({ input: child.stdout });

  send = (data: unknown): Promise<unknown> => {
    return new Promise((resolve) => {
      rl.once('line', (line) => {
        // console.log('Received line from C++ process:', line);
        resolve(Unpickle(line));
      });
      const theString = Pickle(data);
      child!.stdin!.write(theString + '\n');
      // console.log('Sending the string:', theString);
    });
  };
});
afterAll(() => {
  kill_child();
});

describe('C++Module/JS Pipe', () => {
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
    // This stuff is reflected in the xproc_test.cpp file, as well.
    const tests = [
      { id: 'MyI8', chk: chkMyI8, input: -122 },
      { id: 'MyI16', chk: chkMyI16, input: -16384 },
      { id: 'MyI32', chk: chkMyI32, input: -2097152 },
      { id: 'MyI64', chk: chkMyI64, input: -123456789012345n },
      { id: 'MyU8', chk: chkMyU8, input: 255 },
      { id: 'MyU16', chk: chkMyU16, input: 65535 },
      { id: 'MyU32', chk: chkMyU32, input: 4294967295 },
      { id: 'MyU64', chk: chkMyU64, input: 9876543210987654n },
      { id: 'MyFloat', chk: chkMyFloat, input: 3.14 },
      { id: 'MyString', chk: chkMyString, input: 'Hello, World!' },
      { id: 'MyBoolean', chk: chkMyBoolean, input: true },
      { id: 'MyChar', chk: chkMyChar, input: 'A' },
      { id: 'Int8Array', chk: chkInt8Array, input: [-128, 0, 127] },
      { id: 'Int16Set', chk: chkInt16Set, input: new Set([1, 2, 3]) },
      {
        id: 'CharFastSet',
        chk: chkCharFastSet,
        input: new Set(['x', 'y', 'z']),
      },
      {
        id: 'Int32toStrMap',
        chk: chkInt32toStrMap,
        input: new Map([
          [1, 'one'],
          [2, 'two'],
        ]),
      },
      {
        id: 'StrToU16FastMap',
        chk: chkStrToU16FastMap,
        input: new Map([
          ['a', 1],
          ['b', 2],
        ]),
      },
      {
        id: 'MyObj',
        chk: chkMyObj,
        input: { a: 'test', b: 42, c: true, d: 'o' },
      },
      {
        id: 'MySub',
        chk: chkMySub,
        input: { a: 'subtest', b: 24, c: false, x: 'extra', y: 99 },
      },
      { id: 'MyTup', chk: chkMyTup, input: ['tuple', 123, false] },
      // You cannot have an optional top-level type
      // { id: 'MyOpt',  chk: chkMyOpt,
      //   input: { a: 'opt', b: 7, c: true, x: 'subopt', y: 88 } },
      // { id: 'MyOpt 2', chk: chkMyOpt, input: undefined },
      { id: 'MyEnum', chk: chkMyEnum, input: MyEnum.a },
      { id: 'MyEnum2', chk: chkMyEnum2, input: MyEnum2.b },
      { id: 'MyNEnum', chk: chkMyNEnum, input: MyNEnum.c },
      { id: 'MyNEnum2', chk: chkMyNEnum2, input: MyNEnum2.b },
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
      {
        id: 'Aggregate2_2',
        chk: chkAggregate2,
        input: { tup: ['agg2-noopt', 789, false] },
      },
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
      // console.log(test.input);
      expect(result).toEqual({ id: test.id, output: test.input });
      if (!hasField(result, 'output')) {
        console.error(
          `Missing 'output' field in response for ${test.id}:`,
          result,
        );
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
