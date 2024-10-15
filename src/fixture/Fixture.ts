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
    /**
     * Replace with something like
     * this.whenCreated(() => {
     *   this.b2Fixture.SetDensity(density);
     * });
     */
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

  public async create(b2Body: Box2D.b2Body, world: PhysicsWorld) {
    const {b2FixtureDef} = await world.box2D();
    const fixtureDef = new b2FixtureDef();
    fixtureDef.set_density(this._density);
    fixtureDef.set_isSensor(this.sensor);
    if(this.friction) {
      fixtureDef.set_friction(this.friction);
    }
    if(this.restitution) {
      fixtureDef.set_restitution(this.restitution);
    }
    if(this.restitutionThreshold) {
      fixtureDef.set_restitutionThreshold(this.restitutionThreshold);
    }
    if(this.filter) {
      fixtureDef.set_filter(this.filter.b2Filter)
    }
    fixtureDef.set_shape(await this.shape.create(world));
    this.b2Fixture = b2Body.CreateFixture(fixtureDef);
  }
}