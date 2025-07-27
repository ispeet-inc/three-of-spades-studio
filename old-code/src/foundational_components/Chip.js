import React from "react";
import PropTypes from "prop-types";
import "./css/Chip.css";

function Chip({ label, color, icon, size, className, ...rest }) {
  const classes = ["chip", `chip--${color}`, `chip--${size}`, className || ""]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...rest}>
      {icon && <span className="chip__icon">{icon}</span>}
      <span className="chip__label">{label}</span>
    </span>
  );
}

Chip.propTypes = {
  label: PropTypes.node.isRequired,
  color: PropTypes.oneOf(["gold", "blue", "red", "green", "gray"]),
  icon: PropTypes.node,
  size: PropTypes.oneOf(["small", "medium"]),
  className: PropTypes.string,
};

Chip.defaultProps = {
  color: "gray",
  icon: null,
  size: "medium",
  className: "",
};

export default Chip;
