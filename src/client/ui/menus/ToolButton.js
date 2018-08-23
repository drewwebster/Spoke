import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import styles from "./ToolButton.scss";
import ReactTooltip from "react-tooltip";

export default function ToolButton({ toolType, onClick, selected, tooltipContent }) {
  const btnColor = selected ? styles.selected : styles.unselected;
  return (
    <div data-tip data-for={toolType}>
      <button className={classNames(styles.toolbtn, btnColor)} onClick={onClick}>
        <i className={classNames("fas", toolType)} />
      </button>
      {tooltipContent && (
        <ReactTooltip className="regularTooltip" place="bottom" effect="solid" id={toolType}>
          <span>{tooltipContent}</span>
        </ReactTooltip>
      )}
    </div>
  );
}

ToolButton.propTypes = {
  toolType: PropTypes.string,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  tooltipContent: PropTypes.string
};
