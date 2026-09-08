import {Container} from '@cloudflare/containers';
import worker, {createV6ContainerClass} from './worker.mjs';

export const V6Container = createV6ContainerClass(Container);
// V5 and V6 were withdrawn at the owner's request on 8 September 2026.
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (/^\/covenants(?:\/v[56]|-v[56])(?:\.html)?\/?$/.test(path)) {
      return new Response(null, {status: 302, headers: {Location: '/covenants', 'Cache-Control': 'no-store'}});
    }
    if (/^\/api\/v[56](?:\/|$)/.test(path)) {
      return Response.json({error: 'This version has been withdrawn.'}, {status: 410, headers: {'Cache-Control': 'no-store'}});
    }
    return worker.fetch(request, env);
  }
};
