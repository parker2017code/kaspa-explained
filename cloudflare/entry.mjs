function assetRequest(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, request);
}

async function fetchAsset(request, env, pathname) {
  return env.ASSETS.fetch(assetRequest(request, pathname));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

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
