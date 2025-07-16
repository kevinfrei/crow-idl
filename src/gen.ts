import { chkRecordOf, isString } from '@freik/typechk';
import { isTypes } from './IDL';
import { GetCppGenerator } from './emitters/cpp';
import { GetTypescriptGenerator } from './emitters/typescript';

function err(message: string): void {
  console.error(`Error: ${message}`);
  console.error(`Usage:
  bun scripts/gen.ts <definitions.ts> <output specifiers>
    "definitions.ts" must contain a SymbolList export called TypesToGenerate
    output specifiers:
      --cpp:<cppheader.h> (or -c:<cppheader.h>)
      --ts:<tsoutput.ts> (or -t:<tsoutput.ts>)\n`);
}

// The first argument is the definition file
// (which must export a "TypesToGenerate" SymbolList)
// The remaining arguments are the output files:
// --cpp:<file> or -c: (or --cpp/-c <file>)
// --ts:<file>  of -t: (or --ts/t <file>)
async function main(input: string, ...args: string[]): Promise<void> {
  const defsFile = await import(input);
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
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!isString(arg)) {
      err(`Argument ${i} is not a string: ${arg}`);
      process.exit(1);
    }
    if (arg.startsWith('--cpp:')) {
      cppFile = arg.substring(6);
    } else if (arg.startsWith('--ts:')) {
      tsFile = arg.substring(5);
    } else if (arg.startsWith('-c:')) {
      cppFile = arg.substring(3);
    } else if (arg.startsWith('-t:')) {
      tsFile = arg.substring(3);
    } else if (i + 1 < args.length) {
      if (arg === '--cpp' || arg === '-c') {
        cppFile = args[++i];
      } else if (arg === '--ts' || arg === '-t') {
        tsFile = args[++i];
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
    const CppGen = GetCppGenerator();
    await CppGen(input, cppFile, ttg);
  }
  if (tsFile) {
    // Generate TypeScript code
    const TypescriptGen = GetTypescriptGenerator();
    await TypescriptGen(input, tsFile, ttg);
  }
}

const args = process.argv.slice(3);
console.log(`Generating code from ${process.argv[2]} (${args.join(' ')})`);
main(process.argv[2]!, ...args).catch((err) => {
  console.error('Error generating interface code:', err);
  process.exit(2);
});
