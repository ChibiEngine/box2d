// types-only
import "../Box2D";
import b2Shape = Box2D.b2Shape;

import PhysicsWorld from "../world/PhysicsWorld";

export default interface Shape {
  create(world: PhysicsWorld): b2Shape;
}