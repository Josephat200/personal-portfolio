const { spawn } = require('node:child_process');
const path = require('node:path');

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['tsx', 'server/src/index.ts'],
  {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    shell: false
  }
);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
