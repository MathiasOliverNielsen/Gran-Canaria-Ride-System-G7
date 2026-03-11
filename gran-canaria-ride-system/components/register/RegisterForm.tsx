"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./RegisterForm.module.scss";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  });
  const router = useRouter();

  // Security-aware validation functions
  const validateName = (name: string) => {
    if (!name) return "Name is required";
    if (name.length > 100) return "Name too long";

    // Security check - block dangerous patterns
    const dangerousPatterns = [/<script/i, /javascript:/i, /on\w+=/i, /<\/?\w+/i, /\$\{/, /<%/, /\{\{/];

    if (dangerousPatterns.some((pattern) => pattern.test(name))) {
      return "Invalid characters detected";
    }

    return "";
  };

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (email.length > 100) return "Email too long";

    // Basic format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }

    // Security check - block dangerous patterns
    const dangerousPatterns = [/<script/i, /javascript:/i, /on\w+=/i, /<\/?\w+/i, /\$\{/, /<%/, /\{\{/];

    if (dangerousPatterns.some((pattern) => pattern.test(email))) {
      return "Invalid characters detected";
    }

    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password.length > 128) return "Password too long";

    // Security check for obvious injection attempts
    const dangerousPatterns = [/<script/i, /javascript:/i, /<\/?\w+/i, /union.*select/i, /drop.*table/i];

    if (dangerousPatterns.some((pattern) => pattern.test(password))) {
      return "Invalid characters detected";
    }

    return "";
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({ name: "", email: "", password: "", confirmPassword: "", general: "" });

    // Validate form
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword, password);

    if (nameError || emailError || passwordError || confirmPasswordError) {
      setErrors({
        name: nameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
        general: "",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim(), email: email.toLowerCase().trim(), password }),
      });

      const data = await response.json();

      if (data.success) {
        // Registration successful - redirect to login
        router.push("/login?message=Account created successfully! Please log in.");
      } else {
        // Set specific error based on server response
        if (data.error.includes("already exists")) {
          setErrors({ name: "", email: "An account with this email already exists", password: "", confirmPassword: "", general: "" });
        } else if (data.error.includes("Too many attempts")) {
          setErrors({ name: "", email: "", password: "", confirmPassword: "", general: "Too many attempts. Please try again later." });
        } else {
          setErrors({ name: "", email: "", password: "", confirmPassword: "", general: data.error || "Registration failed" });
        }
      }
    } catch (error) {
      setErrors({ name: "", email: "", password: "", confirmPassword: "", general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Create your
            <br />
            <span className={styles.brand}>Move</span>Wise account
          </h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              disabled={loading}
              autoComplete="name"
              placeholder="Enter your name"
            />
            {errors.name && <div className={styles.fieldError}>{errors.name}</div>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              disabled={loading}
              autoComplete="email"
              inputMode="email"
              placeholder="Enter your email"
            />
            {errors.email && <div className={styles.fieldError}>{errors.email}</div>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
              disabled={loading}
              autoComplete="new-password"
              placeholder="Choose a password"
            />
            {errors.password && <div className={styles.fieldError}>{errors.password}</div>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
              disabled={loading}
              autoComplete="new-password"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <div className={styles.fieldError}>{errors.confirmPassword}</div>}
          </div>

          {errors.general && <div className={styles.error}>{errors.general}</div>}

          <button type="submit" disabled={loading} className={`${styles.button} ${styles.loginButton}`}>
            {loading ? "Creating account..." : "Create"}
          </button>
        </form>

        <div className={styles.loginPrompt}>
          Already have an account?{" "}
          <button onClick={handleLoginRedirect} className={styles.linkButton} disabled={loading}>
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
