import React from "react";
import PropTypes from "prop-types";
import "./css/Modal.css";

function Modal({ open, title, children, actions, onClose, size, showClose }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal--${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {showClose && (
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        )}
        {title && (
          <div className="modal__title" id="modal-title">
            {title}
          </div>
        )}
        <div className="modal__content">{children}</div>
        {actions && <div className="modal__actions">{actions}</div>}
      </div>
    </div>
  );
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  onClose: PropTypes.func,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  showClose: PropTypes.bool,
};

Modal.defaultProps = {
  title: null,
  actions: null,
  onClose: undefined,
  size: "medium",
  showClose: true,
};

export default Modal;
