import { main } from '../src/crow-idl';

async function gen() {
  await main(
    './cpptests/test-input.ts',
    '-c:cpptests/gen.hpp',
    '-t:cpptests/gen.ts',
  );
  console.log('Header Files generated');
  await main(
    './cpptests/test-input.ts',
    '--mod:cpptests/tests/gen.cppm,cpptests/tests/common.cppm',
  );
  console.log('Module Files generated');
}

gen().catch(console.error);
