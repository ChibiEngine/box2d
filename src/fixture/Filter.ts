import "../Box2D";
import b2Filter = Box2D.b2Filter;

export default class Filter {
  private readonly _b2Filter: b2Filter;

  public constructor(categoryBits: number = 0x0001, maskBits: number = 0xFFFF, groupIndex: number = 0) {
    this._b2Filter = new Box2D.b2Filter();
    this._b2Filter.set_categoryBits(categoryBits);
    this._b2Filter.set_maskBits(maskBits);
    this._b2Filter.set_groupIndex(groupIndex);
  }

  public get b2Filter() {
    return this._b2Filter;
  }

  public setCategory(categoryBits: number) {
    this._b2Filter.set_categoryBits(categoryBits);
    return this;
  }

  public setMask(maskBits: number) {
    this._b2Filter.set_maskBits(maskBits);
    return this;
  }

  public setGroup(groupIndex: number) {
    this._b2Filter.set_groupIndex(groupIndex);
    return this;
  }

  public get categoryBits() {
    return this._b2Filter.get_categoryBits();
  }

  public set categoryBits(value: number) {
    this._b2Filter.set_categoryBits(value);
  }

  public get maskBits() {
    return this._b2Filter.get_maskBits();
  }

  public set maskBits(value: number) {
    this._b2Filter.set_maskBits(value);
  }

  public get groupIndex() {
    return this._b2Filter.get_groupIndex();
  }

  public set groupIndex(value: number) {
    this._b2Filter.set_groupIndex(value);
  }
}