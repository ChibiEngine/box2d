import {Component, Container, FixedUpdatable, IVec2, CompletablePromise} from "chibiengine";
import {Graphics} from "pixi.js";
import {getPIXIDebugDraw} from "../debug/DebugDraw";
import PhysicsBody from "../body/PhysicsBody";
import {Box2DModule, instantiateBox2D} from "../Box2D";

interface PhysicsWorldOptions {
  gravity?: number;
  updateRate?: number;
  debugDraw?: boolean;
}

export default class PhysicsWorld extends Component<"world", Container> implements FixedUpdatable {
  public readonly componentName = "world" as const;
  public static readonly PIXELS_PER_METER = 32;

  immediateApply = false;

  private _box2D: Box2DModule;
  private _box2DPromise: CompletablePromise<Box2DModule> = new CompletablePromise();

  private b2World: Box2D.b2World;

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
    console.log("PhysicsWorld apply")
    this._box2D = await instantiateBox2D();
    const { b2Vec2, b2World, b2Draw } = this._box2D;

    this.target = target;

    const gravity = new b2Vec2(0, this.gravity);
    this.b2World = new b2World(gravity);

    if(this.debugDraw) {
      this.debugGraphics = new Graphics();
      this.debugGraphics.zIndex = 1000;
      console.log("PhysicsWorld apply debugDraw", target.pixi)
      target.pixi.sortableChildren = true;
      target.pixi.addChild(this.debugGraphics);

      this.b2DebugDraw = getPIXIDebugDraw(this._box2D, this.debugGraphics, PhysicsWorld.PIXELS_PER_METER);
      this.b2DebugDraw.SetFlags(b2Draw.e_shapeBit);
      this.b2DebugDraw.enable = true;

      this.b2World.SetDebugDraw(this.b2DebugDraw);
    }
    this._box2DPromise.complete(this._box2D);
    console.log("PhysicsWorld apply end")
  }

  public async box2D(): Promise<Box2DModule> {
    return this._box2DPromise.promise;
  }

  public get instantiatedBox2D(): Box2DModule {
    return this._box2D;
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
    if(!this._box2D) throw new Error("Box2D not initialized. Wait until PhysicsWorld is created.");
    return new this._box2D.b2Vec2(this.pixelsToMeters(vec.x), this.pixelsToMeters(vec.y));
  }
}