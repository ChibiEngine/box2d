import "../Box2D";
import b2PolygonShape = Box2D.b2PolygonShape;
import b2Shape = Box2D.b2Shape;

import {IVec2, Vec2} from "chibiengine";
import PhysicsWorld from "../world/PhysicsWorld";
import Shape from "./Shape";



export default class RectShape implements Shape {
  public constructor(public width: number, public height: number, private center: IVec2 = Vec2.ZERO) {}

  public create(world: PhysicsWorld): b2Shape {
    const shape = new b2PolygonShape();
    shape.SetAsBox(world.pixelsToMeters(this.width / 2), world.pixelsToMeters(this.height / 2), world.vec2ToBox2D(this.center), 0);
    return shape;
  }
}