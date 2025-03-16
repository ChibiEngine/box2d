import Fixture from "../fixture/Fixture";

export default class Contact {
  public constructor(
      public readonly b2Contact: Box2D.b2Contact,
      public readonly fixtureA: Fixture,
      public readonly fixtureB: Fixture
  ) { }


}