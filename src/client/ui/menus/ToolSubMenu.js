import { SubMenu } from "react-contextmenu";

export default class ToolSubMenu extends SubMenu {
  constructor(props) {
    super(props);
    this.prevHandleMouseEnter = this.handleMouseEnter;
    this.handleMouseEnter = this.handleMouseEntered;
    this.handleMouseLeave = this.handleMouseLeft;
  }

  handleMouseEntered = () => {
    this.prevHandleMouseEnter();
    this.onFocusAcquired();
  };

  handleMouseLeft = () => {
    if (this.opentimer) clearTimeout(this.opentimer);
    if (!this.state.visible) return;
    this.onFocusLeave();
  };

  hideTheMenu = () => {
    this.setState({
      selectedItem: null,
      visible: false
    });
  };

  onFocusLeave = () => {
    window.addEventListener("focusAcquired", this.hideTheMenu);
  };

  onFocusAcquired = () => {
    window.removeEventListener("focusAcquired", this.hideTheMenu);
    window.dispatchEvent(new Event("focusAcquired"));
  };
}
