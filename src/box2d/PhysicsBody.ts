import box2D from "./Box2D";
const Box2D = box2D;

import {Component, GameObject} from "chibiengine";
import PhysicsWorld from "./PhysicsWorld";
import RectShape from "./shapes/RectShape";

import b2Body = Box2D.b2Body;
import b2_dynamicBody = Box2D.b2_dynamicBody;

export default class PhysicsBody extends Component<"body", GameObject> {
  public readonly componentName = "body" as const;

  private shape: RectShape;

  public b2Body: b2Body;

  public get box2D() {
    return this.b2Body;
  }


  constructor(shape: RectShape) {
    super();
    this.shape = shape;
  }

  private getParentWorld(go: GameObject): PhysicsWorld | null {
    let parent = go.parent;
    while (parent) {
      const world = parent.getComponent(PhysicsWorld);
      if (world) {
        return world
      }
      parent = parent.parent;
    }
    return null;
  }

  public apply(target: GameObject) {
    console.log("PhysicsBody apply");

    const world = this.getParentWorld(target);
    if (!world) {
      throw new Error("PhysicsBody must be attached to a Container with a PhysicsWorld.");
    }

    const bodyDef = new Box2D.b2BodyDef();
    bodyDef.set_type(b2_dynamicBody);
    bodyDef.set_position(new Box2D.b2Vec2(0, 0));

    this.b2Body = world.createBody(this, bodyDef);
    this.b2Body.CreateFixture(this.shape.box2D, 1);
    this.b2Body.SetTransform(new Box2D.b2Vec2(0, 0), 0);
    this.b2Body.SetLinearVelocity(new Box2D.b2Vec2(0, 0));
    this.b2Body.SetAwake(true);
    this.b2Body.SetEnabled(true);
  }

  public setShape(shape: RectShape) {
    this.shape = shape;
  }
}