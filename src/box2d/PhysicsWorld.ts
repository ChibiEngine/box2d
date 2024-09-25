import {Component, Container} from "chibiengine";

export default class PhysicsWorld extends Component<"world", Container> {
  public readonly componentName = "world" as const;

}