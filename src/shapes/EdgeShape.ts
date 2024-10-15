import {IVec2} from "chibiengine";
import Shape from "./Shape";
import PhysicsWorld from "../world/PhysicsWorld";


export default class EdgeShape implements Shape {
  private shape: Box2D.b2EdgeShape;

  public constructor(private readonly v1: IVec2, private readonly v2: IVec2, private readonly v0?: IVec2, private readonly v3?: IVec2) {

  }

  public async create(world: PhysicsWorld): Promise<Box2D.b2EdgeShape> {
    const {b2EdgeShape} = await world.box2D();
    this.shape = new b2EdgeShape();
    if(this.v0 && this.v3) {
      this.shape.SetOneSided(world.vec2ToBox2D(this.v0), world.vec2ToBox2D(this.v1), world.vec2ToBox2D(this.v2), world.vec2ToBox2D(this.v3));
    } else {
      this.shape.SetTwoSided(world.vec2ToBox2D(this.v1), world.vec2ToBox2D(this.v2));
    }
    return this.shape;
  }
}