import React from "react";
import PropTypes from "prop-types";
import "./css/Avatar.css";

function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ name, image, icon, size, highlight, className, ...rest }) {
  const classes = [
    "avatar",
    `avatar--${size}`,
    highlight ? "avatar--highlight" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  let content = null;
  if (image) {
    content = (
      <img src={image} alt={name || "avatar"} className="avatar__img" />
    );
  } else if (icon) {
    content = <span className="avatar__icon">{icon}</span>;
  } else {
    content = <span className="avatar__initials">{getInitials(name)}</span>;
  }

  return (
    <span className={classes} aria-label={name} {...rest}>
      {content}
    </span>
  );
}

Avatar.propTypes = {
  name: PropTypes.string,
  image: PropTypes.string,
  icon: PropTypes.node,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  highlight: PropTypes.bool,
  className: PropTypes.string,
};

Avatar.defaultProps = {
  name: "",
  image: null,
  icon: null,
  size: "medium",
  highlight: false,
  className: "",
};

export default Avatar;
