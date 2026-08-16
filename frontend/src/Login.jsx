import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);

    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">

      <div className="login-background">
        <div className="glow glow-one"></div>
        <div className="glow glow-two"></div>
      </div>

      <div className="login-layout">

        {/* LEFT SIDE */}
        <div className="login-brand">

          <div className="brand-icon">🤖</div>

          <h1>
            AI Investment
            <span>Platform</span>
          </h1>

          <p>
            Smarter portfolio management powered by
            intelligent investment insights.
          </p>

          <div className="feature-list">

            <div className="feature">
              <span>📊</span>
              <div>
                <strong>Portfolio Analytics</strong>
                <small>Track your investments and returns.</small>
              </div>
            </div>

            <div className="feature">
              <span>🤖</span>
              <div>
                <strong>AI Investment Assistant</strong>
                <small>Ask questions about your portfolio.</small>
              </div>
            </div>

            <div className="feature">
              <span>🔐</span>
              <div>
                <strong>Secure Accounts</strong>
                <small>Your portfolio data stays separated.</small>
              </div>
            </div>

          </div>

        </div>

        {/* LOGIN CARD */}
        <div className="login-card">

          <div className="login-card-header">
            <h2>Welcome Back</h2>

            <p>
              Sign in to access your investment portfolio.
            </p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="login-group">

              <label>Email Address</label>

              <div className="input-wrapper">
                <span>✉️</span>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

            </div>

            <div className="login-group">

              <label>Password</label>

              <div className="input-wrapper">
                <span>🔒</span>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

            </div>

            {error && (
              <div className="login-error">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>

          </form>
          <div className="login-footer">
  <button
    type="button"
    className="switch-button"
    onClick={onRegister}
  >
    Don't have an account? Create Account
  </button>
</div>

          <div className="login-footer">
            <span>🔒 Secure authentication</span>
            <span>•</span>
            <span>AI-powered portfolio insights</span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;