import * as platform from "platform";

export const keyMap = {
  translateTool: "w",
  rotateTool: "e",
  scaleTool: "r",
  spaceTool: "x",
  snapTool: "t",
  delete: ["del", "backspace"],
  duplicate: ["ctrl+d", "command+d"],
  save: ["ctrl+s", "command+s"],
  saveAs: ["ctrl+shift+s", "command+shift+s"],
  undo: ["ctrl+z", "command+z"],
  redo: ["ctrl+shift+z", "command+shift+z"]
};

const keyStringToDisplayString = k => {
  switch (k) {
    case "command":
      return String.fromCharCode(0x2318);
    case "ctrl":
      return "Ctrl + ";
    case "shift":
      return String.fromCharCode(0x21e7);
    default:
      return k.toUpperCase();
  }
};

export const getKeysByOS = combinations => {
  const { os } = platform;
  let combination = null;
  if (os.toString().includes("OS X")) {
    combination = combinations.filter(k => k.includes("command"));
  } else {
    combination = combinations.filter(k => !k.includes("command"));
  }
  if (!combination || combination.length !== 1) return null;
  const keys = combination.toString().split("+");
  return keys.reduce((r, k) => r + keyStringToDisplayString(k), "");
};
