import { $, BuildOutput } from 'bun';

export async function WebBuild(): Promise<BuildOutput> {
  const isDebug = false;
  try {
    await $`rm -r build/**/*.js`;
  } catch {}
  const bunBuild = await Bun.build({
    entrypoints: ['./index.ts', './IDL.ts', './src/crow-idl.ts'],
    external: ['typescript', 'prettier', '@freik/typechk'],
    outdir: 'build',
    minify: !isDebug,
    sourcemap: isDebug ? 'inline' : 'none',
    target: 'bun',
    env: 'BUN_PUBLIC_*',
    splitting: true,
  });
  return bunBuild;
}
if (import.meta.main) {
  WebBuild()
    .then((buildOutput: BuildOutput) => {
      // Handle the build output
      if (!buildOutput.success) {
        console.error(buildOutput.logs.map((rmBm) => rmBm.message).join('\n'));
      }
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
