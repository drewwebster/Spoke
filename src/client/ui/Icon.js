import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./Icon.scss";
import StringInput from "./inputs/StringInput";
import ReactTooltip from "react-tooltip";

export default class Icon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTextOverflown: false
    };
    this.textRef = null;
  }

  componentDidMount() {
    this.checkTextOverflown();
  }

  checkTextOverflown = () => {
    if (!this.textRef) return;
    this.setState({ isTextOverflown: this.textRef.clientWidth < this.textRef.scrollWidth });
  };

  render() {
    const { name, selected, rename, onClick, onChange, onCancel, onSubmit, className } = this.props;
    const fullClassName = classNames(styles.icon, className, {
      [styles.selected]: selected
    });
    const [fileName, fileExt] = name.split(".");

    return (
      <div className={fullClassName} onMouseDown={onClick} data-tip data-for={name}>
        {rename ? (
          <StringInput
            autoFocus={rename}
            className={styles.name}
            value={name}
            onChange={onChange}
            onBlur={onCancel}
            onKeyUp={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmit(name);
              } else if (e.key === "Escape") {
                e.preventDefault();
                onCancel();
              }
            }}
          />
        ) : (
          <div>
            <div
              className={styles.name}
              title={fileName}
              ref={element => {
                this.textRef = element;
              }}
            >
              {fileName}
            </div>
            <div className={styles.type}>{fileExt}</div>
          </div>
        )}
        {this.state.isTextOverflown && (
          <ReactTooltip id={name} place="bottom" effect="solid" className="regularTooltip">
            <span>{fileName}</span>
          </ReactTooltip>
        )}
      </div>
    );
  }
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  rename: PropTypes.bool,
  onClick: PropTypes.func,
  onChange: PropTypes.func,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  className: PropTypes.string
};
