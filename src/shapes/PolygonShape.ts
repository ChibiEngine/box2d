import {allocVertices} from "../Box2D";
import b2PolygonShape = Box2D.b2PolygonShape;
import b2Shape = Box2D.b2Shape;
import b2Vec2 = Box2D.b2Vec2;

import {IVec2} from "chibiengine";
import PhysicsWorld from "../world/PhysicsWorld";
import Shape from "./Shape";



export default class PolygonShape implements Shape {
  public constructor(public vertices: IVec2[]) { }

  public create(world: PhysicsWorld): b2Shape {
    const vertices: b2Vec2[] = this.vertices.map((vertex) => world.vec2ToBox2D(vertex));
    const shape = new b2PolygonShape();
    const verticesPointer = allocVertices(vertices);
    shape.Set(verticesPointer, vertices.length);
    return shape;
  }
}