import box2D from "../Box2D";
const Box2D = box2D;

import b2PolygonShape = Box2D.b2PolygonShape;
import b2Shape = Box2D.b2Shape;
import PhysicsWorld from "../PhysicsWorld";


export default class RectShape {
  public constructor(public width: number, public height: number) {}

  public get box2D(): b2Shape {
    const shape = new b2PolygonShape();
    shape.SetAsBox(PhysicsWorld.pixelsToMeters(this.width / 2), PhysicsWorld.pixelsToMeters(this.height / 2));
    return shape;
  }
}