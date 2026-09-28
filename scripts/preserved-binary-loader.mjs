// Node's test loader for Cloudflare Data modules in a prepared release bundle.
import { readFile } from 'node:fs/promises';

export async function load(url, context, nextLoad) {
  if (!url.endsWith('.bin')) return nextLoad(url, context);
  const bytes = await readFile(new URL(url));
  const encoded = bytes.toString('base64');
  return {
    format: 'module',
    shortCircuit: true,
    source: `export default Uint8Array.from(Buffer.from(${JSON.stringify(encoded)}, 'base64')).buffer;`,
  };
}
