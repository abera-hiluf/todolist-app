import React, { useState } from "react";
import { loginUser, registerUser } from "../api/api";
import styles from "./AuthForm.module.css";

function AuthForm({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginUser({ email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.user.username);
        onAuthSuccess(res.data.token, res.data.user.username);
      } else {
        const res = await registerUser({ username, email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.user.username);
        onAuthSuccess(res.data.token, res.data.user.username);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred. Please verify your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setUsername("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>{isLogin ? "Sign In" : "Create Account"}</h2>
        <p className={styles.subtitle}>
          {isLogin
            ? "Welcome back! Access your personal productivity hub."
            : "Join us and start tracking your focus sessions today."}
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username"
                required
                minLength={3}
                maxLength={50}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className={styles.toggleFooter}>
          <span>
            {isLogin ? "New to Focus Tracker? " : "Already have an account? "}
          </span>
          <button onClick={toggleMode} className={styles.toggleBtn}>
            {isLogin ? "Create an account" : "Sign in instead"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
