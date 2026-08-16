import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function Register({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      setSuccess("Account created successfully! You can now sign in.");

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        onRegister();
      }, 1200);

    } catch (error) {
      console.error("Registration error:", error);
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

        <div className="login-brand">

          <div className="brand-icon">🤖</div>

          <h1>
            AI Investment
            <span>Platform</span>
          </h1>

          <p>
            Create your account and start managing
            your investment portfolio intelligently.
          </p>

          <div className="feature-list">

            <div className="feature">
              <span>📊</span>
              <div>
                <strong>Portfolio Analytics</strong>
                <small>Track investments and returns.</small>
              </div>
            </div>

            <div className="feature">
              <span>🤖</span>
              <div>
                <strong>AI Investment Assistant</strong>
                <small>Get insights from your portfolio.</small>
              </div>
            </div>

            <div className="feature">
              <span>🔐</span>
              <div>
                <strong>Secure Accounts</strong>
                <small>Your portfolio remains private.</small>
              </div>
            </div>

          </div>

        </div>

        <div className="login-card">

          <div className="login-card-header">
            <h2>Create Account</h2>

            <p>
              Start managing your investments today.
            </p>
          </div>

          <form onSubmit={handleRegister}>

            <div className="login-group">
              <label>Full Name</label>

              <div className="input-wrapper">
                <span>👤</span>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a password"
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

            {success && (
              <div className="register-success">
                ✅ {success}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>

          </form>

          <div className="login-footer">
            <button
              type="button"
              className="switch-button"
              onClick={onRegister}
            >
              Already have an account? Sign In
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;