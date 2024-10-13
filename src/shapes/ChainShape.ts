import box2D, {allocVertices} from "../Box2D";
import b2ChainShape = Box2D.b2ChainShape;

import Shape from "./Shape";
import PhysicsWorld from "../world/PhysicsWorld";
import {IVec2} from "chibiengine";

export default class ChainShape implements Shape {
  public constructor(public vertices: IVec2[], private prevVertex?: IVec2, private nextVertex?: IVec2) { }

  public create(world: PhysicsWorld): any {
    // create chain shape
    const b2Vertices = this.vertices.map((v) => world.vec2ToBox2D(v));
    let verticesPtr = allocVertices(b2Vertices);
    const shape = new b2ChainShape();
    if(this.prevVertex && this.nextVertex) {
      shape.CreateChain(verticesPtr, this.vertices.length, world.vec2ToBox2D(this.prevVertex), world.vec2ToBox2D(this.nextVertex));
    } else {
      shape.CreateChain(verticesPtr, this.vertices.length, b2Vertices[0], b2Vertices[this.vertices.length - 1]); // TODO not sure about the last two arguments
    }
    return shape;
  }
}