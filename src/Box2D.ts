import Box2DFactory from "box2d-wasm";

export type Box2DModule = typeof Box2D & EmscriptenModule & {
  allocVertices(vertices: Box2D.b2Vec2[]): Box2D.b2Vec2;
}

export async function instantiateBox2D() {
  const box2D = await Box2DFactory() as typeof Box2D & EmscriptenModule;

  const extensions = {
    allocVertices(vertices: Box2D.b2Vec2[]): Box2D.b2Vec2 {
      const buffer = box2D._malloc(vertices.length * 8);
      let offset = 0;
      for (let i = 0; i < vertices.length; i++) {
        box2D.HEAPF32[buffer + offset >> 2] = vertices[i].get_x();
        box2D.HEAPF32[buffer + (offset + 4) >> 2] = vertices[i].get_y();
        offset += 8;
      }
      return box2D.wrapPointer(buffer, box2D.b2Vec2);
    }
  }

  Object.assign(box2D, extensions);

  return box2D as Box2DModule;
}