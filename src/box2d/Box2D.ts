import Box2DFactory from "box2d-wasm";

const box2D = await Box2DFactory() as typeof Box2D & EmscriptenModule;

export default box2D as typeof Box2D & EmscriptenModule;