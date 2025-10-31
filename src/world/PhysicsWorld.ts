import {ChibiEvent, CompletablePromise, Component, Container, FixedUpdatable, IVec2} from "chibiengine";
import {Graphics} from "pixi.js";
import {getPIXIDebugDraw} from "../debug/DebugDraw";
import PhysicsBody from "../body/PhysicsBody";
import {Box2DModule, instantiateBox2D} from "../Box2D";
import Fixture from "../fixture/Fixture";
import Contact from "../contact/Contact";
import Manifold from "../contact/Manifold";
import ContactImpulse from "../contact/ContactImpulse";


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

  public b2World: Box2D.b2World;

  public target: Container;

  private b2DebugDraw: any;

  private debugGraphics: Graphics;

  public readonly bodies: PhysicsBody[] = [];

  private readonly gravity: number;
  public readonly updateRate: number;
  private readonly debugDraw: boolean;

  public onBeginContact = new ChibiEvent<[Contact]>();
  public onEndContact = new ChibiEvent<[Contact]>();
  public onPreSolve = new ChibiEvent<[Contact, Manifold]>();
  public onPostSolve = new ChibiEvent<[Contact, ContactImpulse]>();


  public constructor(options: PhysicsWorldOptions = {gravity: 9.8, updateRate: 50, debugDraw: false}) {
    super();
    this.gravity = options.gravity || 9.8;
    this.updateRate = options.updateRate || 50;
    this.debugDraw = options.debugDraw || false;
  }

  public async initialize(target: Container): Promise<void> {
    console.trace("PhysicsWorld initialize")
    this._box2D = await instantiateBox2D();
    const {b2Vec2, b2World} = this._box2D;

    this.target = target;

    const gravity = new b2Vec2(0, this.gravity);
    this.b2World = new b2World(gravity);

    this._box2DPromise.complete(this._box2D);
    console.log("PhysicsWorld initialize end")
  }

  public async preApply(target: Container) {
    const {b2Draw, JSContactListener} = this._box2D;

    if (this.debugDraw) {
      this.debugGraphics = new Graphics(); // TODO: Make it non pixi dependent
      this.debugGraphics.zIndex = 1000;
      target.pixi.sortableChildren = true;
      target.pixi.addChild(this.debugGraphics as any);

      this.b2DebugDraw = getPIXIDebugDraw(this._box2D, this.debugGraphics, PhysicsWorld.PIXELS_PER_METER);
      this.b2DebugDraw.SetFlags(b2Draw.e_shapeBit);
      this.b2DebugDraw.enable = true;

      this.b2World.SetDebugDraw(this.b2DebugDraw);

      // TODO : lazily assign these listeners?
      const contactListener = new JSContactListener();
      contactListener.BeginContact = this.BeginContact.bind(this);
      contactListener.EndContact = this.EndContact.bind(this);
      contactListener.PreSolve = this.PreSolve.bind(this);
      contactListener.PostSolve = this.PostSolve.bind(this);

      this.b2World.SetContactListener(contactListener);
    }
  }

  public BeginContact(b2Contact: Box2D.b2Contact | number) {
    b2Contact = this._box2D.wrapPointer(b2Contact as number, this._box2D.b2Contact);

    const fixtureA = Fixture.getFixture(b2Contact.GetFixtureA());
    const fixtureB = Fixture.getFixture(b2Contact.GetFixtureB());

    const contact = new Contact(b2Contact, fixtureA, fixtureB);

    this.onBeginContact.trigger(contact);
  }

  public EndContact(b2Contact: Box2D.b2Contact | number) {
    b2Contact = this._box2D.wrapPointer(b2Contact as number, this._box2D.b2Contact);

    const fixtureA = Fixture.getFixture(b2Contact.GetFixtureA());
    const fixtureB = Fixture.getFixture(b2Contact.GetFixtureB());

    const contact = new Contact(b2Contact, fixtureA, fixtureB);

    this.onEndContact.trigger(contact);
  }

  public PreSolve(b2Contact: Box2D.b2Contact | number, b2OldManifold: Box2D.b2Manifold | number) {
    b2Contact = this._box2D.wrapPointer(b2Contact as number, this._box2D.b2Contact);
    b2OldManifold = this._box2D.wrapPointer(b2OldManifold as number, this._box2D.b2Manifold);

    const fixtureA = Fixture.getFixture(b2Contact.GetFixtureA());
    const fixtureB = Fixture.getFixture(b2Contact.GetFixtureB());

    const contact = new Contact(b2Contact, fixtureA, fixtureB);
    const manifold = new Manifold(b2OldManifold);

    this.onPreSolve.trigger(contact, manifold);
  }

  public PostSolve(b2Contact: Box2D.b2Contact | number, b2Impulse: Box2D.b2ContactImpulse | number) {
    b2Contact = this._box2D.wrapPointer(b2Contact as number, this._box2D.b2Contact);
    b2Impulse = this._box2D.wrapPointer(b2Impulse as number, this._box2D.b2ContactImpulse);

    const fixtureA = Fixture.getFixture(b2Contact.GetFixtureA());
    const fixtureB = Fixture.getFixture(b2Contact.GetFixtureB());

    const contact = new Contact(b2Contact, fixtureA, fixtureB);
    const impulse = new ContactImpulse(b2Impulse);

    this.onPostSolve.trigger(contact, impulse);
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
    if (this.debugDraw) {
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
    if (!this._box2D) throw new Error("Box2D not initialized. Wait until PhysicsWorld is created.");
    return new this._box2D.b2Vec2(this.pixelsToMeters(vec.x), this.pixelsToMeters(vec.y));
  }
}