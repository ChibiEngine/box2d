import {Vec2} from "chibiengine";
import PhysicsWorld from "../world/PhysicsWorld";
import Shape from "./Shape";


export default class CircleShape implements Shape {
  public constructor(public center: Vec2, public radius: number) {}

  public async create(world: PhysicsWorld): Promise<Box2D.b2Shape> {
    const {b2CircleShape} = await world.box2D();
    const shape = new b2CircleShape();
    shape.set_m_p(world.vec2ToBox2D(this.center));
    shape.set_m_radius(world.pixelsToMeters(this.radius));
    return shape;
  }
}