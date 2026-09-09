// PID 1 stays responsive while the separate server group runs native tools.
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export function leaseRemaining(env = process.env, now = Date.now()) {
  const deadline = Number(env.WORKBENCH_LEASE_EXPIRES_AT);
  const remaining = deadline - now;
  if (!Number.isSafeInteger(deadline) || remaining <= 0 || remaining > 300000) {
    throw Error('A prepaid Studio lease deadline within five minutes is required.');
  }
  if (env.WORKBENCH_PUBLIC_ORIGIN !== 'https://kaspaexplained.com') {
    throw Error('The exact public Studio origin https://kaspaexplained.com is required.');
  }
  return remaining;
}

export function supervise({env = process.env, command = process.execPath,
  args = [fileURLToPath(new URL('../server.mjs', import.meta.url))]} = {}) {
  leaseRemaining(env);
  const child = spawn(command, args, {stdio: 'inherit', detached: true, env});
  let stopped = false;
  const stop = code => {
    if (stopped) return;
    stopped = true;
    if (child.pid) {
      try { process.kill(-child.pid, 'SIGKILL'); }
      catch (error) {
        if (error.code !== 'ESRCH') {
          console.error('Studio process-group shutdown failed:', error.code);
          code = 1;
        }
      }
    }
    process.exit(code);
  };
  // Startup consumes the same prepaid lease.
  const timer = setTimeout(() => stop(0), Math.max(0, Number(env.WORKBENCH_LEASE_EXPIRES_AT) - Date.now()));
  for (const signal of ['SIGTERM', 'SIGINT', 'SIGHUP']) process.on(signal, () => stop(0));
  child.on('error', () => stop(1));
  child.on('exit', (code, signal) => { clearTimeout(timer); stop(signal ? 1 : code ?? 1); });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) supervise();
