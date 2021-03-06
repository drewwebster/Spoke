import React, { Component } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "../../vendor/react-select/index.scss";
import styles from "./PropertiesPanelContainer.scss";
import PropertyGroup from "../PropertyGroup";
import InputGroup from "../InputGroup";
import StringInput from "../inputs/StringInput";
import componentTypeMappings from "../../componentTypeMappings";
import { withEditor } from "../contexts/EditorContext";
import { withDialog } from "../contexts/DialogContext";
import FileDialog from "../dialogs/FileDialog";
import ErrorDialog from "../dialogs/ErrorDialog";
import ProgressDialog, { PROGRESS_DIALOG_DELAY } from "../dialogs/ProgressDialog";
import AddComponentDropdown from "../AddComponentDropdown";
import { getDisplayName } from "../../utils/get-display-name";
import SetNameCommand from "../../editor/commands/SetNameCommand";

class PropertiesPanelContainer extends Component {
  static propTypes = {
    editor: PropTypes.object,
    showDialog: PropTypes.func.isRequired,
    hideDialog: PropTypes.func.isRequired,
    uiMode: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      object: null,
      name: null
    };
  }

  componentDidMount() {
    this.props.editor.signals.objectSelected.add(this.onObjectSelected);
    this.props.editor.signals.transformChanged.add(this.onObjectChanged);
    this.props.editor.signals.objectChanged.add(this.onObjectChanged);
  }

  componentWillUnmount() {
    this.props.editor.signals.objectSelected.remove(this.onObjectSelected);
    this.props.editor.signals.transformChanged.remove(this.onObjectChanged);
    this.props.editor.signals.objectChanged.remove(this.onObjectChanged);
  }

  onObjectSelected = object => {
    this.setState({
      object,
      name: object && object.name
    });
  };

  onObjectChanged = object => {
    if (this.state.object === object) {
      this.setState({
        object,
        name: object.name
      });
    }
  };

  onUpdateName = name => {
    this.setState({ name });
  };

  onBlurName = () => {
    if (this.state.object.name !== this.state.name) {
      this.props.editor.execute(new SetNameCommand(this.state.object, this.state.name));
    }
  };

  onKeyUpName = e => {
    if (e.key === "Enter") {
      this.props.editor.execute(new SetNameCommand(this.state.object, this.state.name));
    }
  };

  onUpdateStatic = ({ value }) => {
    if (!value) return;
    const object = this.state.object;
    this.props.editor.setStaticMode(object, value);
  };

  onAddComponent = ({ value }) => {
    this.props.editor.addComponent(this.state.object, value);
  };

  onChangeComponent = (component, propertyName, value) => {
    this.props.editor.setComponentProperty(this.state.object, component.name, propertyName, value);
  };

  onRemoveComponent = componentName => {
    this.props.editor.removeComponent(this.state.object, componentName);
  };

  getInitialComponentPath(component) {
    const sceneURI = this.props.editor.sceneInfo.uri;

    if (component.src) {
      return component.src;
    } else if (sceneURI) {
      return this.props.editor.sceneInfo.uri;
    }

    return null;
  }

  onSaveComponent = async (component, saveAs) => {
    if (saveAs || !component.src) {
      const initialPath = this.getInitialComponentPath(component);

      this.props.showDialog(FileDialog, {
        filters: [component.fileExtension],
        extension: component.fileExtension,
        title: "Save material as...",
        confirmButtonLabel: "Save",
        initialPath,
        onConfirm: async src => {
          let saved = false;

          try {
            setTimeout(() => {
              if (saved) return;
              this.props.showDialog(ProgressDialog, {
                title: "Saving Material",
                message: "Saving material..."
              });
            }, PROGRESS_DIALOG_DELAY);

            await this.props.editor.saveComponentAs(this.state.object, component.name, src);

            this.props.hideDialog();
          } catch (e) {
            this.props.showDialog(ErrorDialog, {
              title: "Error saving material",
              message: e.message || "There was an error when saving the material."
            });
          } finally {
            saved = true;
          }
        }
      });
    } else {
      try {
        await this.props.editor.saveComponent(this.state.object, component.name);
      } catch (e) {
        console.error(e);
        this.props.showDialog(ErrorDialog, {
          title: "Error Saving Material",
          message: e.message || "There was an error when saving the material."
        });
      }
    }
  };

  onLoadComponent = component => {
    const initialPath = this.getInitialComponentPath(component);

    this.props.showDialog(FileDialog, {
      filters: [component.fileExtension],
      title: "Load material...",
      confirmButtonLabel: "Load",
      initialPath,
      defaultFileName: null,
      onConfirm: async src => {
        let loaded = false;

        try {
          setTimeout(() => {
            if (loaded) return;
            this.props.showDialog(ProgressDialog, {
              title: "Loading Material",
              message: "Loading material..."
            });
          }, PROGRESS_DIALOG_DELAY);

          await this.props.editor.loadComponent(this.state.object, component.name, src);

          this.props.hideDialog();
        } catch (e) {
          console.error(e);
          this.props.showDialog(ErrorDialog, {
            title: "Error Loading Material",
            message: e.message || "There was an error when loading the material."
          });
        } finally {
          loaded = true;
        }
      }
    });
  };

  _renderObjectComponent = (component, className, headerClassName, contentClassName, useDefault = true) => {
    if (!component) return null;
    const componentDefinition = this.props.editor.components.get(component.name);

    if (componentDefinition === undefined) {
      return <PropertyGroup name={getDisplayName(component.name)} key={component.name} />;
    }

    const saveable = component.isSaveable;
    return (
      <PropertyGroup
        name={getDisplayName(component.name)}
        description={componentDefinition.componentDescription}
        key={component.name}
        canRemove={componentDefinition.canRemove}
        removeHandler={this.onRemoveComponent.bind(this, component.name)}
        src={component.src}
        srcIsValid={component.srcIsValid}
        saveable={saveable}
        modified={component.modified}
        saveHandler={this.onSaveComponent.bind(this, component, false)}
        saveAsHandler={this.onSaveComponent.bind(this, component, true)}
        loadHandler={this.onLoadComponent.bind(this, component)}
        className={className}
        headerClassName={headerClassName}
        contentClassName={contentClassName}
        useDefault={useDefault}
      >
        {componentDefinition.showProps &&
          componentDefinition.schema.filter(prop => !prop.hidden).map(prop => (
            <InputGroup name={getDisplayName(prop.name)} key={prop.name} disabled={saveable && !component.src}>
              {componentTypeMappings.get(prop.type)(
                component,
                prop,
                component.props[prop.name],
                component.propValidation[prop.name],
                this.onChangeComponent.bind(null, component, prop.name)
              )}
            </InputGroup>
          ))}
      </PropertyGroup>
    );
  };

  render() {
    const object = this.state.object;
    const StaticModes = this.props.editor.StaticModes;

    if (!object) {
      return (
        <div className={styles.propertiesPanelContainer}>
          <div className={styles.noNodeSelected}>No node selected</div>
        </div>
      );
    }

    const objectComponents = object.userData._components
      ? object.userData._components.filter(x => x.name !== "transform")
      : [];
    const objectTransform = object.userData._components
      ? object.userData._components.find(x => x.name === "transform")
      : null;

    const componentOptions = [];

    for (const [name, componentClass] of this.props.editor.components) {
      if (componentClass.canAdd !== false && !objectComponents.find(c => c.name === name)) {
        componentOptions.push({
          value: name,
          label: getDisplayName(name),
          iconClassName: componentClass.iconClassName
        });
      }
    }

    const staticMode = this.props.editor.getStaticMode(object) || StaticModes.Inherits;
    const parentComputedStaticMode = this.props.editor.computeStaticMode(object.parent);
    const staticModeOptions = [
      {
        value: StaticModes.Dynamic,
        label: "Dynamic"
      },
      {
        value: StaticModes.Static,
        label: "Static"
      },
      {
        value: StaticModes.Inherits,
        label: `Inherits (${parentComputedStaticMode})`
      }
    ];
    const staticModeLabel = staticModeOptions.filter(option => option.value === staticMode)[0].label;

    const staticStyle = {
      control: base => ({
        ...base,
        backgroundColor: "black",
        minHeight: "24px",
        border: "1px solid #5D646C",
        cursor: "pointer"
      }),
      input: base => ({
        ...base,
        margin: "0px",
        color: "white"
      }),
      dropdownIndicator: base => ({
        ...base,
        padding: "0 4px 0 0"
      }),
      placeholder: base => ({
        ...base,
        color: "white"
      }),
      menu: base => ({
        ...base,
        borderRadius: "4px",
        border: "1px solid black",
        backgroundColor: "black",
        outline: "none",
        padding: "0",
        position: "absolute",
        top: "20px"
      }),
      menuList: base => ({
        ...base,
        padding: "0"
      }),
      option: base => ({
        ...base,
        backgroundColor: "black",
        cursor: "pointer"
      }),
      singleValue: base => ({
        ...base,
        color: "white"
      })
    };

    return (
      <div className={styles.propertiesPanelContainer}>
        <PropertyGroup
          className={styles.propertiesHeader}
          headerClassName={styles.propertiesHeaderTitle}
          contentClassName={styles.propertiesHeaderContent}
          canRemove={false}
        >
          <div className={styles.propertiesPanelTopBar}>
            <InputGroup className={styles.topBarName} name="Name">
              <StringInput
                value={this.state.name}
                onChange={this.onUpdateName}
                onBlur={this.onBlurName}
                onKeyUp={this.onKeyUpName}
              />
            </InputGroup>
            {this.props.uiMode === "advanced" && (
              <InputGroup className={styles.topBarStatic} name="Static">
                <Select
                  className={styles.staticSelect}
                  classNamePrefix={"static-select"}
                  styles={staticStyle}
                  value={
                    staticMode
                      ? {
                          value: staticMode,
                          label: staticModeLabel
                        }
                      : null
                  }
                  components={{ IndicatorSeparator: () => null }}
                  options={staticModeOptions}
                  isClearable={false}
                  onChange={this.onUpdateStatic}
                />
              </InputGroup>
            )}
          </div>
          {this._renderObjectComponent(
            objectTransform,
            styles.propertiesHeader,
            styles.propertiesHeader,
            styles.propertiesHeaderContent,
            false
          )}
          {componentOptions.length > 0 && (
            <div className={styles.addComponentContainer}>
              <AddComponentDropdown options={componentOptions} onChange={this.onAddComponent} />
            </div>
          )}
        </PropertyGroup>
        {objectComponents.map(component => {
          // Generate property groups for each component and property editors for each property.
          return this._renderObjectComponent(component);
        })}
      </div>
    );
  }
}

export default withEditor(withDialog(PropertiesPanelContainer));
