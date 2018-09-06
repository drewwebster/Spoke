import React, { Component } from "react";
import PropTypes from "prop-types";
import ToolButton from "./ToolButton";
import ToolToggle from "./ToolToggle";
import { showMenu, ContextMenu, MenuItem } from "react-contextmenu";
import styles from "./ToolBar.scss";
import SnappingDropdown from "./SnappingDropdown";
import ToolSubMenu from "./ToolSubMenu";

export default class ToolBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toolButtons: [
        {
          name: "menu",
          type: "fa-bars",
          onClick: e => this.onMenuSelected(e),
          submenu: true
        },
        {
          name: "translate",
          type: "fa-arrows-alt",
          onClick: () => this.onMoveSelected()
        },
        {
          name: "rotate",
          type: "fa-sync-alt",
          onClick: () => this.onRotateSelected()
        },
        {
          name: "scale",
          type: "fa-arrows-alt-v",
          onClick: () => this.onScaleSelected()
        }
      ],
      spaceToggle: {
        name: "coordination",
        type: "toggle",
        text: ["Global", "Local"],
        isSwitch: true,
        isChecked: false,
        icons: {
          checked: "fa-cube",
          unchecked: "fa-globe"
        },
        action: () => this.onCoordinationChanged()
      },
      snapToggle: {
        name: "snap",
        type: "toggle",
        text: ["Snapping", "Snapping"],
        children: <SnappingDropdown />,
        isSwitch: false,
        isChecked: false,
        icons: {
          checked: "fa-magnet",
          unchecked: "fa-magnet"
        },
        action: () => this.onSnappingChanged()
      },
      toolButtonSelected: "translate"
    };
    props.editor.signals.transformModeChanged.add(mode => {
      this._updateToolBarStatus(mode);
    });

    props.editor.signals.spaceChanged.add(() => {
      this._updateToggle(this.state.spaceToggle);
    });

    props.editor.signals.snapToggled.add(() => {
      this._updateToggle(this.state.snapToggle);
    });
  }

  _updateToggle = toggle => {
    const current = toggle;
    current.isChecked = !current.isChecked;
    this.setState({ current });
  };

  _updateToolBarStatus = selectedBtnName => {
    this.setState({
      toolButtonSelected: selectedBtnName
    });
  };

  onMenuSelected = e => {
    const x = 0;
    const y = e.currentTarget.offsetHeight;
    showMenu({
      position: { x, y },
      target: e.currentTarget,
      id: "menu"
    });

    this._updateToolBarStatus("menu");
  };

  onSelectionSelected = () => {
    this.props.editor.deselect();
    this._updateToolBarStatus("select");
  };

  onMoveSelected = () => {
    this.props.editor.signals.transformModeChanged.dispatch("translate");
  };

  onRotateSelected = () => {
    this.props.editor.signals.transformModeChanged.dispatch("rotate");
  };

  onScaleSelected = () => {
    this.props.editor.signals.transformModeChanged.dispatch("scale");
  };

  onCoordinationChanged = () => {
    this.props.editor.signals.spaceChanged.dispatch();
  };

  onSnappingChanged = () => {
    this.props.editor.signals.snapToggled.dispatch();
  };

  renderToolButtons = buttons => {
    return buttons.map(btn => {
      const { onClick, name, type } = btn;
      const selected = btn.name === this.state.toolButtonSelected;
      return (
        <li key={type} className={styles.toolbtns} role="menuitem">
          <ToolButton toolType={type} onClick={onClick} selected={selected} id={name} />
          {btn.submenu && (
            <ContextMenu id="menu">
              {this.props.menus.map(menu => {
                return this.renderMenus(menu);
              })}
            </ContextMenu>
          )}
        </li>
      );
    });
  };

  renderMenus = menu => {
    if (!menu.items || menu.items.length === 0) {
      return (
        <MenuItem key={menu.name} onClick={menu.action} role="menuitem" tabIndex="-1">
          {this.renderItemContent(menu)}
        </MenuItem>
      );
    } else {
      return (
        <ToolSubMenu key={menu.name} title={menu.name} role="menu" hoverDelay={100}>
          {menu.items.map(item => {
            return this.renderMenus(item);
          })}
        </ToolSubMenu>
      );
    }
  };

  renderItemContent = menu => {
    const { name, hotkeys } = menu;
    const layout = {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between"
    };
    return (
      <div style={layout}>
        <div>{name}</div>
        {hotkeys && <div>{hotkeys}</div>}
      </div>
    );
  };

  render() {
    const { toolButtons, spaceToggle, snapToggle } = this.state;
    return (
      <nav className={styles.toolbar}>
        <ul role="menubar" className={styles.toolbar}>
          {this.renderToolButtons(toolButtons)}
          <li className={styles.tooltoggles} role="menuitem">
            <ToolToggle
              text={spaceToggle.text}
              key={spaceToggle.name}
              name={spaceToggle.name}
              action={spaceToggle.action}
              icons={spaceToggle.icons}
              isSwitch={spaceToggle.isSwitch}
              isChecked={spaceToggle.isChecked}
              editor={this.props.editor}
            >
              {spaceToggle.children}
            </ToolToggle>
          </li>
          <li className={styles.tooltoggles} role="menuitem">
            <ToolToggle
              text={snapToggle.text}
              key={snapToggle.name}
              name={snapToggle.name}
              action={snapToggle.action}
              icons={snapToggle.icons}
              isSwitch={snapToggle.isSwitch}
              isChecked={snapToggle.isChecked}
              editor={this.props.editor}
            >
              {snapToggle.children}
            </ToolToggle>
          </li>
        </ul>
      </nav>
    );
  }
}

ToolBar.propTypes = {
  menus: PropTypes.array,
  editor: PropTypes.object
};
