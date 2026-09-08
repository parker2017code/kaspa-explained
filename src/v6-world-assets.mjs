const base = new URL(import.meta.url.includes('/src/') ? './assets/v6/' : './v6/', import.meta.url);
export async function loadV6Assets() {
  const THREE = await import(new URL('vendor/three.module.min.js', base));
  const { GLTFLoader } = await import(new URL('vendor/GLTFLoader.mjs', base));
  const gltf = await new GLTFLoader().loadAsync(new URL('models/harbor.glb', base).href);
  const prototypes = new Map();
  gltf.scene.children.forEach(object => prototypes.set(object.name, object));
  return { THREE, animations: gltf.animations, clone(name) { const source = prototypes.get(name); if (!source) throw new Error(`Missing V6 asset: ${name}`); return source.clone(true); } };
}
