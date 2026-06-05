import { main } from '../src/crow-idl';

main('./cpptests/test-input.ts', '-c:cpptests/gen.hpp', '-t:cpptests/gen.ts')
  .catch(console.error)
  .then(() => console.log('Header Files generated'));
main(
  './cpptests/test-input.ts',
  '--mod:cpptests/tests/gen.cppm,cpptests/tests/common.cppm',
  '-t:cpptests/gen.ts',
)
  .catch(console.error)
  .then(() => console.log('Module Files generated'));
