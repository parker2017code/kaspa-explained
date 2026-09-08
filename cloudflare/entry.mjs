import {Container} from '@cloudflare/containers';
import worker, {createV6ContainerClass} from './worker.mjs';

export const V6Container = createV6ContainerClass(Container);
export default worker;
