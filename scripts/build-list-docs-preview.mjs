import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dumiCli = path.join(projectRoot, 'node_modules', 'dumi', 'bin', 'dumi.js');

const exitCode = await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [dumiCli, 'build'], {
    cwd: projectRoot,
    env: { ...process.env, DUMI_ENV: 'list-preview' },
    stdio: 'inherit',
  });

  child.once('error', reject);
  child.once('exit', (code, signal) => {
    if (signal) {
      reject(new Error(`Dumi 构建被信号 ${signal} 终止`));
      return;
    }
    resolve(code ?? 1);
  });
});

process.exitCode = exitCode;
