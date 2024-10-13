import Box2DFactory from "box2d-wasm";

const box2D = await Box2DFactory() as typeof Box2D & EmscriptenModule;

globalThis.Box2D = box2D;

export default box2D as typeof Box2D & EmscriptenModule;

export const _malloc = box2D._malloc;
export const _free = box2D._free;
export const HEAPF32 = box2D.HEAPF32;
export const HEAPU8 = box2D.HEAPU8;
export const HEAPU32 = box2D.HEAPU32;

export const wrapPointer = box2D.wrapPointer;

/**
 *
 * @param vertices
 * @returns pointer to vertices array
 */
export function allocVertices(vertices: Box2D.b2Vec2[]): Box2D.b2Vec2 {
  const buffer = _malloc(vertices.length * 8);
  let offset = 0;
  for (let i = 0; i < vertices.length; i++) {
    HEAPF32[buffer + offset >> 2] = vertices[i].get_x();
    HEAPF32[buffer + (offset + 4) >> 2] = vertices[i].get_y();
    offset += 8;
  }
  return wrapPointer(buffer, box2D.b2Vec2);
}