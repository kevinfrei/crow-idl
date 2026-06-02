#!/usr/bin/env bun
import { chkRecordOf, isString, isUndefined } from '@freik/typechk';
import { pathToFileURL } from 'node:url';
import { GetCppGenerator } from './crow-idl/emitters/cpp';
import { GetTypescriptGenerator } from './crow-idl/emitters/typescript';
import { isTypes } from './crow-idl/typechecks';

function err(message: string): void {
  console.error(`Error: ${message}`);
  console.error(`Usage:
  bun scripts/gen.ts <definitions.ts> <output specifiers>
    
    * "definitions.ts" must contain a SymbolList export called TypesToGenerate.

    * You can only emit one of the C++ output types. Emitting both a module
      interface and a cpp header is not supported.

    * output specifiers:
        --mod:<cppmodule.cppm,shared_module.cppm>
            (or -m:<cppmodule.cppm,shared_module.cppm>)
          The names of the C++ module interface files to generate.
          If the shared_module.cppm files is not specified, it will not be
          generated, but will still be imported under the module import usage
          "import <TODO:pickling_support_module_name>;".
        --cpp:<cppheader.h> (or -c:<cppheader.h>)
        --ts:<tsoutput.ts> (or -t:<tsoutput.ts>)
      OPTIONAL (with -cpp/-c):
        --hpp:<commonheader.hpp> (or -h:<commonheader.hpp>)
          This specifies where to emit the common header necessary to
          interoperate with the generated C++ *header* code. If not specified,
          the common header will be emitted directly into the generated cpp
          header file. If you specify a separate common header, it will be
          emitted there instead, and the generated cpp header will #include
          it.
`);
}

function getModuleSpecifier(arg: string, val: string | undefined): [string] | [string, string] {
  if (isUndefined(val)) {
    err(`Expected module output specifier after ${arg}, but got undefined`);
    process.exit(1);
  }
  const maybeModFiles = val.split(',');
  if (maybeModFiles.length < 1 || maybeModFiles.length > 2 || maybeModFiles.some(f => !f)) {
    err(`Invalid module output specifier: ${val}`);
    process.exit(1);
  }
  return maybeModFiles as [string] | [string, string];
}

// The first argument is the definition file
// (which must export a "TypesToGenerate" SymbolList)
// The remaining arguments are the output files:
// --cpp:<file> or -c: (or --cpp/-c <file>)
// --ts:<file>  of -t: (or --ts/t <file>)
// --hpp:<file> or -h: (or --hpp/-h <file>)
// --mod:<file.cppm,shared_module.cppm> or -m (or --mod <file1,file2>)
export async function main(input: string, ...args: string[]): Promise<void> {
  const theFile = pathToFileURL(input).toString();
  console.log('Importing definitions from', theFile);
  const defsFile = await import(theFile);
  for (const i in defsFile) {
    console.log(`Loaded ${i}`);
  }
  const ttg = defsFile['TypesToGenerate'];
  if (!chkRecordOf(isString, isTypes)(ttg)) {
    err(`Input file ${input} must export a "TypesToGenerate" SymbolList.`);
    process.exit(1);
  }
  // A script to generate C++ code from the SharedConstants.ts file
  let cppFile: string | undefined;
  let tsFile: string | undefined;
  let hppFile: string | undefined;
  let modFiles: [string] | [string, string] | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!isString(arg)) {
      throw new Error(`Argument ${i} is not a string: ${arg}`);
    }
    if (arg.startsWith('--cpp:')) {
      cppFile = arg.substring(6);
    } else if (arg.startsWith('--ts:')) {
      tsFile = arg.substring(5);
    } else if (arg.startsWith('-c:')) {
      cppFile = arg.substring(3);
    } else if (arg.startsWith('-t:')) {
      tsFile = arg.substring(3);
    } else if (arg.startsWith('--hpp:')) {
      hppFile = arg.substring(6);
    } else if (arg.startsWith('-h:')) {
      hppFile = arg.substring(3);
    } else if (arg.startsWith('--mod:')) {
      modFiles = getModuleSpecifier('--mod:', arg.substring(6));
    } else if (arg.startsWith('--mod:')) {
      modFiles = getModuleSpecifier('-m:', arg.substring(3));
    } else if (i + 1 < args.length) {
      if (arg === '--cpp' || arg === '-c') {
        cppFile = args[++i];
      } else if (arg === '--ts' || arg === '-t') {
        tsFile = args[++i];
      } else if (arg === '--hpp' || arg === '-h') {
        hppFile = args[++i];
      } else if (arg === '--mod' || arg === '-m') {
        modFiles = getModuleSpecifier(arg, args[++i]);
      }
    } else {
      err(`Unknown argument: ${arg}`);
      process.exit(1);
    }
  }
  if (!cppFile || !tsFile) {
    err('Missing an output file');
    process.exit(1);
  }
  if (cppFile) {
    // Generate C++ code
    const CppGen = GetCppGenerator(hppFile ? { header: hppFile } : undefined);
    await CppGen.file(input, cppFile, ttg);
  }
  if (tsFile) {
    // Generate TypeScript code
    const TypescriptGen = GetTypescriptGenerator();
    await TypescriptGen.file(input, tsFile, ttg);
  }
}

if (import.meta.main) {
  // We're executing directly:
  if (process.argv.length < 4) {
    err('Invalid command line');
    process.exit(1);
  }
  const args = process.argv.slice(3);
  console.log(`Generating code from ${process.argv[2]} (${args.join(' ')})`);
  main(process.argv[2]!, ...args).catch((err) => {
    console.error('Error generating interface code:', err);
    process.exit(2);
  });
}
