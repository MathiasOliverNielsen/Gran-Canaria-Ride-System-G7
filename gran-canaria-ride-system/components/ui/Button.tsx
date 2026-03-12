"use client";
import React from "react";
import styles from "./Button.module.scss";

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "link";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  icon?: React.ReactNode;
  iconOnly?: boolean;
}

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  icon,
  iconOnly = false,
}: ButtonProps) {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const buttonClasses = [styles.button, styles[variant], styles[size], fullWidth ? styles.fullWidth : "", iconOnly ? styles.iconOnly : "", className].filter(Boolean).join(" ");

  return (
    <button type={type} onClick={handleClick} disabled={disabled || loading} className={buttonClasses}>
      {loading && <span className={styles.spinner}></span>}
      {icon && <span className={styles.icon}>{icon}</span>}
      {children && !iconOnly && <span>{children}</span>}
    </button>
  );
}
