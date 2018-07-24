import BaseComponent from "./BaseComponent";

export default class MeshComponent extends BaseComponent {
  static componentName = "mesh";

  static dontExportProps = true;

  static removable = false;

  // Currently only indicates that an object has a mesh so there are no properties.
  static schema = [];
}
