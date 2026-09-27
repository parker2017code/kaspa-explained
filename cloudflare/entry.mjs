import satoshisEngineEpub from '../satoshis-engine.epub';

function assetRequest(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, request);
}

async function fetchAsset(request, env, pathname) {
  const response = await env.ASSETS.fetch(assetRequest(request, pathname));
  // Preserve production-only pages while adding the requested book formats.
  // A later reconciled full build already includes these links.
  if (pathname !== '/moose.html' || request.method !== 'GET' || response.status !== 200) return response;
  const html = await response.clone().text();
  let updated = html;
  const companion = '<a class="button" href="/satoshis-engine-companion.pdf" hreflang="en">Read the companion (PDF)</a>';
  if (!updated.includes('https://youtu.be/3FTKZxLEfTo')) {
    updated = updated.replace(companion, companion + '\n        <a class="button" href="https://youtu.be/3FTKZxLEfTo">Listen to the audiobook (YouTube)</a>');
  }
  const englishPdf = '<a class="button primary" href="/satoshis-engine.pdf" hreflang="en">Read in English (PDF)</a>';
  if (!updated.includes('href="/satoshis-engine.epub"')) {
    updated = updated.replace(englishPdf, englishPdf + '\n        <a class="button" href="/satoshis-engine.epub" type="application/epub+zip" hreflang="en" download="Satoshis_Engine.epub">Download EPUB</a>');
  }
  if (updated === html) return response;
  updated = updated.replace(/(<meta name="dateModified" content=")[^"]+(">)/, (_, before, after) => before + '2026-09-27' + after);
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('etag');
  headers.delete('last-modified');
  return new Response(updated, { status: response.status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/satoshis-engine.epub') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      }
      return new Response(request.method === 'HEAD' ? null : satoshisEngineEpub, {
        headers: {
          'Content-Type': 'application/epub+zip',
          'Content-Disposition': 'attachment; filename="Satoshis_Engine.epub"',
          'Content-Length': String(satoshisEngineEpub.byteLength),
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

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
