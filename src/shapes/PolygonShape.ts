import {IVec2} from "chibiengine";
import PhysicsWorld from "../world/PhysicsWorld";
import Shape from "./Shape";


export default class PolygonShape implements Shape {
  public constructor(public vertices: IVec2[]) { }

  public async create(world: PhysicsWorld): Promise<Box2D.b2PolygonShape> {
    const {allocVertices, b2PolygonShape} = await world.box2D();

    const vertices: Box2D.b2Vec2[] = this.vertices.map((vertex) => world.vec2ToBox2D(vertex));
    const shape = new b2PolygonShape();
    const verticesPointer = allocVertices(vertices);
    shape.Set(verticesPointer, vertices.length);
    return shape;
  }
}