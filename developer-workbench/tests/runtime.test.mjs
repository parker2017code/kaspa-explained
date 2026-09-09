import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn, execFile} from 'node:child_process';
import {once} from 'node:events';
import {mkdtemp, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {promisify} from 'node:util';
import {setTimeout as delay} from 'node:timers/promises';
import {createHash} from 'node:crypto';
import {leaseRemaining} from '../runtime/start.mjs';
import {verifyArgentBuild} from '../runtime/argent-build.mjs';

const origin = 'https://kaspaexplained.com';
const run = promisify(execFile);

test('lease rejects missing, malformed, expired, overlong deadlines and wrong public origins', () => {
  const now = 1800000000000;
  const env = {WORKBENCH_PUBLIC_ORIGIN: origin};
  for (const deadline of [undefined, '', 'NaN', now, now - 1, now + 300001, now + 0.5]) {
    assert.throws(() => leaseRemaining({...env, WORKBENCH_LEASE_EXPIRES_AT: deadline}, now), /prepaid/);
  }
  assert.equal(leaseRemaining({...env, WORKBENCH_LEASE_EXPIRES_AT: now + 300000}, now), 300000);
  for (const publicOrigin of [undefined, 'https://evil.invalid', `${origin}/`, 'http://kaspaexplained.com']) {
    assert.throws(() => leaseRemaining({WORKBENCH_PUBLIC_ORIGIN: publicOrigin, WORKBENCH_LEASE_EXPIRES_AT: now + 1000}, now), /exact public/);
  }
});

async function alive(pid) {
  // An orphan zombie is already dead; PID 1 reaps it in the deployed container.
  try { return !/^\s*Z/.test((await run('ps', ['-o', 'stat=', '-p', String(pid)])).stdout); }
  catch { return false; }
}

for (const mode of ['deadline', 'SIGTERM']) test(`supervisor ${mode} kills blocked server and its native child`, {timeout: 10000}, async () => {
  const temp = await mkdtemp(join(tmpdir(), 'studio-supervisor-'));
  let supervisor, pids = [];
  try {
    const pidFile = join(temp, 'pids.json');
    const childFile = join(temp, 'blocked.mjs');
    await writeFile(childFile, `import {spawn} from 'node:child_process';import {writeFileSync} from 'node:fs';
const native=spawn(process.execPath,['-e','while(true){}'],{stdio:'ignore'});
writeFileSync(${JSON.stringify(pidFile)},JSON.stringify([process.pid,native.pid]));while(true){}
`);
    const entry = `import {supervise} from ${JSON.stringify(new URL('../runtime/start.mjs', import.meta.url).href)};supervise({args:[${JSON.stringify(childFile)}]});`;
    const started = Date.now();
    supervisor = spawn(process.execPath, ['--input-type=module', '-e', entry], {env: {...process.env, WORKBENCH_PUBLIC_ORIGIN: origin, WORKBENCH_LEASE_EXPIRES_AT: String(started + 1800)}, stdio: 'pipe'});
    const exited = once(supervisor, 'exit');
    for (let attempt = 0; attempt < 60 && !pids.length; attempt++) {
      try { pids = JSON.parse(await readFile(pidFile)); } catch { await delay(20); }
    }
    assert.equal(pids.length, 2, 'Fixture server and native child started');
    if (mode === 'SIGTERM') supervisor.kill('SIGTERM');
    const [code] = await exited;
    assert.equal(code, 0);
    assert.ok(Date.now() - started < 5000, 'Independent deadline was not blocked');
    for (const pid of pids) {
      for (let i = 0; i < 40 && await alive(pid); i++) await delay(25);
      assert.equal(await alive(pid), false, `Process ${pid} must be dead`);
    }
  } finally {
    supervisor?.kill('SIGKILL');
    for (const pid of pids) try { process.kill(pid, 'SIGKILL'); } catch {}
    await rm(temp, {recursive: true, force: true});
  }
});

test('runtime compiler provenance rejects changed binary or source revision without Git', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'studio-provenance-'));
  try {
    const binary = join(temp, 'compiler'), manifest = join(temp, 'manifest.json'), revision = 'a'.repeat(40);
    await writeFile(binary, 'reviewed binary');
    await writeFile(manifest, JSON.stringify({revision, sha256: createHash('sha256').update('reviewed binary').digest('hex')}));
    await verifyArgentBuild(manifest, binary, revision);
    await assert.rejects(verifyArgentBuild(manifest, binary, 'b'.repeat(40)), /reviewed build/);
    await writeFile(binary, 'changed binary');
    await assert.rejects(verifyArgentBuild(manifest, binary, revision), /reviewed build/);
  } finally { await rm(temp, {recursive: true, force: true}); }
});
