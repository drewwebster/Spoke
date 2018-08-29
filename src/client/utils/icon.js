import { Components } from "../editor/components/index";

const ICON_PREFIX = "icon-";

export function getIconClassByName(name) {
  const result = Components.find(component => {
    return component.componentName === name;
  });
  if (!result) return null;
  return ICON_PREFIX + name;
}
