import React, { useEffect } from "react";
import styles from "./Toast.module.css";

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  const getToastClass = () => {
    switch (type) {
      case "error":
        return styles.error;
      case "info":
        return styles.info;
      case "success":
      default:
        return styles.success;
    }
  };

  return (
    <div className={`${styles.toast} ${getToastClass()}`}>
      <div className={styles.content}>
        <span className={styles.icon}>
          {type === "success" && "✓"}
          {type === "error" && "⚠"}
          {type === "info" && "ℹ"}
        </span>
        <span className={styles.message}>{message}</span>
      </div>
      <button onClick={onClose} className={styles.closeBtn}>
        &times;
      </button>
    </div>
  );
}

export default Toast;
