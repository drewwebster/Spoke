import React from "react";
import styles from "./SnackBar.scss";
import errorIcon from "../assets/error-icon.svg";
import warningIcon from "../assets/warning-icon.svg";
import PropTypes from "prop-types";
import Button from "./Button";
import classNames from "classnames";

export default function SnackBar({ conflictType }) {
  const conflictTypes = {
    missing: {
      img: errorIcon,
      content: "Missing nodes in your gltf models.",
      helpURL: "https://github.com/MozillaReality/spoke/wiki/Conflict-Resolution#missing-node-in-the-inherited-file"
    },
    duplicate: {
      img: warningIcon,
      content: "Duplicate node names in your gltf models.",
      helpURL:
        "https://github.com/MozillaReality/spoke/wiki/Conflict-Resolution#duplicate-node-names-in-the-inherited-file"
    }
  };

  return (
    <div className={styles.bar}>
      <div className={styles.icon}>
        <img src={conflictTypes[conflictType].img} />
      </div>
      <div
        className={classNames(styles.content, {
          error: conflictType === "missing",
          warning: conflictType === "duplicate"
        })}
      >
        {conflictTypes[conflictType].content}
      </div>
      <div className={styles.options}>
        <Button onClick={() => window.open(conflictTypes[conflictType].helpURL)}>Help</Button>
      </div>
    </div>
  );
}

SnackBar.propTypes = {
  conflictType: PropTypes.string
};
