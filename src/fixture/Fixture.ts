import "../Box2D";
import b2Body = Box2D.b2Body;

import Shape from "../shapes/Shape";
import PhysicsWorld from "../world/PhysicsWorld";
import Filter from "./Filter";

export default class Fixture {

  private b2Fixture: Box2D.b2Fixture;

  private _density: number = 1;
  private friction: number;
  private restitution: number;
  private restitutionThreshold: number;
  private filter: Filter;
  private sensor: boolean = false;


  public constructor(private readonly shape: Shape) {

  }

  public setDensity(density: number) {
    this._density = density;
    if(this.b2Fixture) {
      this.b2Fixture.SetDensity(density);
    }
    return this;
  }

  public setFriction(friction: number) {
    this.friction = friction;
    if(this.b2Fixture) {
      this.b2Fixture.SetFriction(friction);
    }
    return this;
  }

  public setRestitution(restitution: number) {
    this.restitution = restitution;
    if(this.b2Fixture) {
      this.b2Fixture.SetRestitution(restitution);
    }
    return this;
  }

  public setRestitutionThreshold(restitutionThreshold: number) {
    this.restitutionThreshold = restitutionThreshold;
    if(this.b2Fixture) {
      this.b2Fixture.SetRestitutionThreshold(restitutionThreshold);
    }
    return this;
  }

  public setFilter(filter: Filter) {
    this.filter = filter;
    if(this.b2Fixture) {
      this.b2Fixture.SetFilterData(filter.b2Filter);
    }
    return this;
  }

  public setSensor(sensor: boolean) {
    this.sensor = sensor;
    if(this.b2Fixture) {
      this.b2Fixture.SetSensor(sensor);
    }
    return this;
  }

  public create(b2Body: b2Body, world: PhysicsWorld) {
    const b2FixtureDef = new Box2D.b2FixtureDef();
    b2FixtureDef.set_density(this._density);
    b2FixtureDef.set_isSensor(this.sensor);
    if(this.friction) {
      b2FixtureDef.set_friction(this.friction);
    }
    if(this.restitution) {
      b2FixtureDef.set_restitution(this.restitution);
    }
    if(this.restitutionThreshold) {
      b2FixtureDef.set_restitutionThreshold(this.restitutionThreshold);
    }
    if(this.filter) {
      b2FixtureDef.set_filter(this.filter.b2Filter)
    }
    b2FixtureDef.set_shape(this.shape.create(world));
    this.b2Fixture = b2Body.CreateFixture(b2FixtureDef);
  }
}