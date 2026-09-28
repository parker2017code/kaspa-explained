import { overrides } from './release-overrides.mjs';

function assetRequest(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, request);
}

async function fetchAsset(request, env, pathname) {
  const override = overrides[pathname];
  if (override) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    const headers = new Headers({
      'Content-Type': override.contentType,
      'Content-Length': String(override.body.byteLength),
    });
    if (override.contentDisposition) headers.set('Content-Disposition', override.contentDisposition);
    if (override.cacheControl) headers.set('Cache-Control', override.cacheControl);
    return new Response(request.method === 'HEAD' ? null : override.body, { headers });
  }
  return env.ASSETS.fetch(assetRequest(request, pathname));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/carnot-local-brownian-global.pdf') {
      return Response.redirect(new URL('/satoshis-engine.pdf', url), 301);
    }

    if (path.endsWith('.html') && path !== '/index.html') {
      const cleanPath = path.slice(0, -'.html'.length) || '/';
      return Response.redirect(new URL(cleanPath, url), 307);
    }

    if (path === '/') return fetchAsset(request, env, '/index.html');
    if (path.endsWith('/')) return fetchAsset(request, env, `${path}index.html`);

    const clean = await fetchAsset(request, env, path);
    if (clean.status !== 404) return clean;

    const directory = await fetchAsset(request, env, `${path}/index.html`);
    if (directory.status !== 404) return directory;

    const page = await fetchAsset(request, env, `${path}.html`);
    return page.status === 404 ? clean : page;
  },
};
