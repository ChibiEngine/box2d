import box2D from "./Box2D";
const Box2D = box2D;

import {Component, Container, FixedUpdatable, VariableUpdatable} from "chibiengine";
import b2World = Box2D.b2World;
import b2Vec2 = Box2D.b2Vec2;
import {getPIXIDebugDraw} from "./DebugDraw";
import {Graphics} from "pixi.js";
import e_shapeBit = Box2D.b2Draw.e_shapeBit;
import PhysicsBody from "./PhysicsBody";

export default class PhysicsWorld extends Component<"world", Container> implements FixedUpdatable, VariableUpdatable {
  immediateApply = true;

  public static readonly PIXELS_PER_METER = 32;

  public readonly componentName = "world" as const;

  private b2World: b2World;

  public target: Container;

  private debugDraw: any;

  private debugGraphics: Graphics;

  private bodies: PhysicsBody[] = [];

  public constructor(public readonly gravity: number = 9.8, public readonly updateRate = 50) {
    super();
  }

  public async apply(target: Container): Promise<void> {
    this.target = target;
    console.trace("PhysicsWorld apply");

    const gravity = new b2Vec2(0, this.gravity);
    this.b2World = new b2World(gravity);

    this.debugGraphics = new Graphics();
    target.pixi.addChild(this.debugGraphics);
    this.debugDraw = getPIXIDebugDraw(this.debugGraphics, PhysicsWorld.PIXELS_PER_METER);
    this.debugDraw.SetFlags(e_shapeBit);
    this.debugDraw.enable = true;

    this.b2World.SetDebugDraw(this.debugDraw);
  }

  public get box2D() {
    return this.b2World;
  }

  public update() {
    this.b2World.Step(1 / this.updateRate, 8, 3);
    for (const body of this.bodies) {
      const position = body.b2Body.GetPosition();
      console.log("position", PhysicsWorld.metersToPixels(position.get_x()), PhysicsWorld.metersToPixels(position.get_y()));
    }
  }

  public variableUpdate(dt: number) {
    this.debugGraphics.clear();
    this.b2World.DebugDraw();
  }

  public createBody(body: PhysicsBody, bodyDef: Box2D.b2BodyDef) {
    this.bodies.push(body);
    return this.b2World.CreateBody(bodyDef);
  }

  public static pixelsToMeters(pixels: number) {
    return pixels / PhysicsWorld.PIXELS_PER_METER;
  }

  public static metersToPixels(meters: number) {
    return meters * PhysicsWorld.PIXELS_PER_METER;
  }
}