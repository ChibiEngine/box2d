// types-only
import PhysicsWorld from "../world/PhysicsWorld";

export default interface Shape {
  create(world: PhysicsWorld): Promise<Box2D.b2Shape>;
}