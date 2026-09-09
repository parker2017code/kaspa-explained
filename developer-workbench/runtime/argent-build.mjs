import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

async function digest(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}

export async function verifyArgentBuild(manifestPath, binaryPath, revision) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.revision !== revision || manifest.sha256 !== await digest(binaryPath)) {
    throw Error('Installed Argent compiler does not match the reviewed build.');
  }
}

// The build stage writes this after checking the exact source checkout and compiling.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [binary, revision, output] = process.argv.slice(2);
  if (!/^[a-f0-9]{40}$/.test(revision || '')) throw Error('Exact Argent revision required.');
  await writeFile(output, JSON.stringify({revision, sha256: await digest(binary)}) + '\n');
}
