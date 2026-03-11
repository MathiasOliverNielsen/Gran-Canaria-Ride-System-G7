"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./LoginForm.module.scss";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const router = useRouter();

  // Validation functions
  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({ email: "", password: "", general: "" });

    // Validate form
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
        general: "",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Cookie is automatically set by the server
        router.push("/dashboard");
        router.refresh(); // Refresh to update auth state
      } else {
        // Set specific error based on server response
        if (data.error.includes("email") || data.error.includes("user")) {
          setErrors({ email: "Email not found", password: "", general: "" });
        } else if (data.error.includes("password")) {
          setErrors({ email: "", password: "Incorrect password", general: "" });
        } else {
          setErrors({ email: "", password: "", general: data.error || "Login failed" });
        }
      }
    } catch (error) {
      setErrors({ email: "", password: "", general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google login
    console.log("Google login not implemented yet");
  };

  const handleCreateAccount = () => {
    router.push("/register");
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
    console.log("Forgot password not implemented yet");
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Welcome to
            <br />
            <span className={styles.brand}>Move</span>Wise !
          </h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              required
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
              required
              disabled={loading}
              autoComplete="current-password"
              placeholder="Enter your password"
            />
            {errors.password && <div className={styles.fieldError}>{errors.password}</div>}
          </div>

          {errors.general && <div className={styles.error}>{errors.general}</div>}

          <button type="submit" disabled={loading} className={`${styles.button} ${styles.loginButton}`}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <button onClick={handleForgotPassword} className={styles.linkButton} disabled={loading}>
          Forget the password
        </button>

        <button onClick={handleGoogleLogin} disabled={loading} className={`${styles.button} ${styles.googleButton}`}>
          <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Log in with Google
        </button>

        <button onClick={handleCreateAccount} disabled={loading} className={`${styles.button} ${styles.createAccountButton}`}>
          Create account
        </button>
      </div>
    </div>
  );
}
