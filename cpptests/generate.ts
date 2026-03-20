import { main } from '../src/crow-idl';

main('../cpptests/test-input.ts', '-c:cpptests/gen.hpp', '-t:cpptests/gen.ts')
  .catch(console.error)
  .then(() => console.log('Files generated'));
