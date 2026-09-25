function assetRequest(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, request);
}

async function fetchAsset(request, env, pathname) {
  const response = await env.ASSETS.fetch(assetRequest(request, pathname));
  // Preserve the production asset set when releasing this link separately.
  // A later full build already includes the link, so leave that HTML alone.
  if (pathname !== '/moose.html' || request.method !== 'GET' || response.status !== 200) return response;
  const html = await response.clone().text();
  if (html.includes('https://youtu.be/3FTKZxLEfTo')) return response;
  const companion = '<a class="button" href="/satoshis-engine-companion.pdf" hreflang="en">Read the companion (PDF)</a>';
  if (!html.includes(companion)) return response;
  const updated = html.replace(companion, companion + '\n        <a class="button" href="https://youtu.be/3FTKZxLEfTo">Listen to the audiobook (YouTube)</a>')
    .replace(/(<meta name="dateModified" content=")[^"]+(">)/, '$12026-09-25$2');
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
