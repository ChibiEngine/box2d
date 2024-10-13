import "../Box2D";

import {Component, Container, FixedUpdatable, IVec2, VariableUpdatable} from "chibiengine";
import b2World = Box2D.b2World;
import b2Vec2 = Box2D.b2Vec2;
import e_shapeBit = Box2D.b2Draw.e_shapeBit;
import {getPIXIDebugDraw} from "../debug/DebugDraw";
import {Graphics} from "pixi.js";
import PhysicsBody from "../body/PhysicsBody";

interface PhysicsWorldOptions {
  gravity?: number;
  updateRate?: number;
  debugDraw?: boolean;
}

export default class PhysicsWorld extends Component<"world", Container> implements FixedUpdatable {
  immediateApply = true;

  public static readonly PIXELS_PER_METER = 32;

  public readonly componentName = "world" as const;

  private b2World: b2World;

  public target: Container;

  private b2DebugDraw: any;

  private debugGraphics: Graphics;

  private bodies: PhysicsBody[] = [];

  private readonly gravity: number;
  public readonly updateRate: number;
  private readonly debugDraw: boolean;

  public constructor(options: PhysicsWorldOptions = { gravity: 9.8, updateRate: 50, debugDraw: false }) {
    super();
    this.gravity = options.gravity || 9.8;
    this.updateRate = options.updateRate || 50;
    this.debugDraw = options.debugDraw || false;
  }

  public async apply(target: Container): Promise<void> {
    this.target = target;
    console.trace("PhysicsWorld apply");

    const gravity = new b2Vec2(0, this.gravity);
    this.b2World = new b2World(gravity);

    if(this.debugDraw) {
      this.debugGraphics = new Graphics();
      this.debugGraphics.zIndex = 1000;
      target.pixi.sortableChildren = true;
      target.pixi.addChild(this.debugGraphics);

      this.b2DebugDraw = getPIXIDebugDraw(this.debugGraphics, PhysicsWorld.PIXELS_PER_METER);
      this.b2DebugDraw.SetFlags(e_shapeBit);
      this.b2DebugDraw.enable = true;

      this.b2World.SetDebugDraw(this.b2DebugDraw);
    }
  }

  public get box2D() {
    return this.b2World;
  }

  public update() {
    this.b2World.Step(1 / this.updateRate, 8, 3);
    for (const body of this.bodies) {
      body.syncPosition();
    }
    if(this.debugDraw) {
      this.debugGraphics.clear();
      this.b2World.DebugDraw();
    }
  }

  public createBody(body: PhysicsBody, bodyDef: Box2D.b2BodyDef) {
    this.bodies.push(body);
    return this.b2World.CreateBody(bodyDef);
  }

  public pixelsToMeters(pixels: number) {
    return pixels / PhysicsWorld.PIXELS_PER_METER;
  }

  public metersToPixels(meters: number) {
    return meters * PhysicsWorld.PIXELS_PER_METER;
  }

  /**
   * @param vec Vector in pixels
   * @returns Vector in Box2D meters
   */
  public vec2ToBox2D(vec: IVec2) {
    return new b2Vec2(this.pixelsToMeters(vec.x), this.pixelsToMeters(vec.y));
  }
}