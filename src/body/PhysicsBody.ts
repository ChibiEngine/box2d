import {Component, GameObject, Vec2, IVec2} from "chibiengine";

import PhysicsWorld from "../world/PhysicsWorld";
import RectShape from "../shapes/RectShape";
import Shape from "../shapes/Shape";
import Fixture from "../fixture/Fixture";
import EdgeShape from "../shapes/EdgeShape";
import PolygonShape from "../shapes/PolygonShape";
import CircleShape from "../shapes/CircleShape";
import ChainShape from "../shapes/ChainShape";
import Filter from "../fixture/Filter";

export type BodyType = "static" | "dynamic" | "kinematic";

interface PhysicsBodyOptions {
  // shape: RectShape;
  type?: BodyType;
  offset?: IVec2;
}

export default class PhysicsBody extends Component<"body", GameObject> {
  // immediateApply = true;
  public readonly componentName = "body" as const;
  private target: GameObject;

  public b2Body: Box2D.b2Body;

  private offset: IVec2;

  private world: PhysicsWorld;

  private fixtures: Fixture[] = [];

  private type: BodyType = "dynamic";

  // fixtures
  // center
  // mass
  // enableRotation
  // static, dynamic, kinematic
  // filter (groupIndex, categoryBits, maskBits)
  // onBeginContact, onEndContact, onPreSolve, onPostSolve
  // awake
  // applyForce, applyImpulse, applyTorque, applyLinearImpulse
  // 


  public get box2D() {
    return this.b2Body;
  }

  // TODO PhysicsBody position anchor
  constructor(shape?: Shape, options: PhysicsBodyOptions = {type: "dynamic", offset: Vec2.ZERO}) {
    super();
    if(shape) {
      this.createFixture(shape);
    }
    this.type = options.type || "dynamic";
    this.offset = options.offset || Vec2.ZERO;
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

  public async apply(target: GameObject) {
    const world = this.getParentWorld(target);
    this.world = world;

    if (!world) {
      throw new Error("PhysicsBody must be attached to a Container with a PhysicsWorld.");
    }

    const {b2Vec2, b2BodyDef, b2_dynamicBody, b2_staticBody, b2_kinematicBody} = await world.box2D();
    console.log("box2d", await world.box2D());

    this.target = target;

    const bodyX = world.pixelsToMeters(target.position.x) + world.pixelsToMeters(this.offset.x);
    const bodyY = world.pixelsToMeters(target.position.y) + world.pixelsToMeters(this.offset.y);

    const bodyDef = new b2BodyDef();
    switch (this.type) {
      case "dynamic":
        bodyDef.set_type(b2_dynamicBody);
        break;
      case "static":
        bodyDef.set_type(b2_staticBody);
        break;
      case "kinematic":
        bodyDef.set_type(b2_kinematicBody);
        break
    }
    bodyDef.set_position(new b2Vec2(0, 0));

    this.b2Body = world.createBody(this, bodyDef);

    await Promise.all(this.fixtures.map((fx) => fx.create(this.b2Body, world)));

    this.b2Body.SetTransform(new b2Vec2(bodyX, bodyY), 0);
    this.b2Body.SetLinearVelocity(new b2Vec2(0, 0));
    this.b2Body.SetAwake(true);
    this.b2Body.SetEnabled(true);
  }

  public syncPosition() {
    const bodyPosition = this.b2Body.GetPosition();
    const x = this.world.metersToPixels(bodyPosition.get_x()) - this.offset.x;
    const y = this.world.metersToPixels(bodyPosition.get_y()) - this.offset.y;
    this.target.position.set(x, y);
  }

  public createFixture(shape: Shape, modifier: (fx: Fixture) => void): this
  public createFixture(shape: Shape): Fixture
  public createFixture(shape: Shape, modifier?: (fx: Fixture) => void): Fixture | this {
    const fixture = new Fixture(shape);
    this.fixtures.push(fixture);
    if(modifier) {
      modifier(fixture);
    }
    if(this.b2Body) {
      fixture.create(this.b2Body, this.world);
    }
    return modifier ? this : fixture;
  }

  public createCircle(center: IVec2, radius: number) {
    const shape = new CircleShape(center, radius);
    return this.createFixture(shape);
  }

  public createEdge(v1: IVec2, v2: IVec2, ghostv0?: IVec2, ghostv3?: IVec2) {
    const shape = new EdgeShape(v1, v2, ghostv0, ghostv3);
    return this.createFixture(shape);
  }

  public createChain(vertices: IVec2[], prevVertex?: IVec2, nextVertex?: IVec2) {
    const shape = new ChainShape(vertices, prevVertex, nextVertex);
    return this.createFixture(shape);
  }

  public createBox(width: number, height: number, center?: IVec2) {
    const shape = new RectShape(width, height, center);
    return this.createFixture(shape);
  }

  public createPolygon(vertices: IVec2[]) {
    const shape = new PolygonShape(vertices);
    return this.createFixture(shape);
  }

  public setType(type: BodyType) {
    this.type = type;
    if (this.b2Body) {
      const {b2_dynamicBody, b2_staticBody, b2_kinematicBody} = this.world.instantiatedBox2D;
      switch (type) {
        case "dynamic":
          this.b2Body.SetType(b2_dynamicBody);
          break;
        case "static":
          this.b2Body.SetType(b2_staticBody);
          break;
        case "kinematic":
          this.b2Body.SetType(b2_kinematicBody);
          break
      }
    }
    return this;
  }

  public setDensity(density: number) {
    this.fixtures.forEach((fx) => fx.setDensity(density));
    return this;
  }

  public setFriction(friction: number) {
    this.fixtures.forEach((fx) => fx.setFriction(friction));
    return this;
  }

  public setRestitution(restitution: number) {
    this.fixtures.forEach((fx) => fx.setRestitution(restitution));
    return this;
  }

  public setRestitutionThreshold(restitutionThreshold: number) {
    this.fixtures.forEach((fx) => fx.setRestitutionThreshold(restitutionThreshold));
    return this;
  }

  public setFilter(filter: Filter) {
    this.fixtures.forEach((fx) => fx.setFilter(filter));
    return this;
  }

  public setAwake(awake: boolean) {
    this.b2Body.SetAwake(awake);
    return this;
  }
}