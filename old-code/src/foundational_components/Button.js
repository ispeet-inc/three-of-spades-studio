import React from "react";
import PropTypes from "prop-types";
import "./css/Button.css";

function Button({
  children,
  variant,
  size,
  icon,
  fullWidth,
  disabled,
  onClick,
  ...rest
}) {
  const classNames = [
    "button",
    `button--${variant}`,
    `button--${size}`,
    fullWidth ? "button--fullWidth" : "",
    disabled ? "button--disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Example: If you ever need to use dynamic inline styles based on COLORS
  // const palette = COLORS[variant] || COLORS.gold;
  // const style = { background: palette, ... }

  return (
    <button
      className={classNames}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      {...rest}
    >
      {icon && <span className="button__icon">{icon}</span>}
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "danger"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  icon: PropTypes.node,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

Button.defaultProps = {
  variant: "primary",
  size: "medium",
  icon: null,
  fullWidth: false,
  disabled: false,
  onClick: undefined,
};

export default Button;
