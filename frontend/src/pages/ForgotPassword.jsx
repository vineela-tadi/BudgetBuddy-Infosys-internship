
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Unable to process request"
        );
        setLoading(false);
        return;
      }

      // Save reset token for local testing
      if (data.reset_token) {
        localStorage.setItem(
          "reset_token",
          data.reset_token
        );

        // Go to Reset Password page
        navigate("/reset-password");
      } else {
        setMessage(
          data.message ||
            "Password reset request successful!"
        );
      }

    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to connect to the server"
      );
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">

      {/* BACKGROUND */}
      <div className="auth-grid"></div>

      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      {/* BRAND */}
      <div className="auth-brand">

        <div className="auth-brand-icon">
          ₹
        </div>

        <div>
          <h2>
            Budget<span>Buddy</span>
          </h2>

          <p>
            PLAN • TRACK • GROW
          </p>
        </div>

      </div>

      {/* CARD */}
      <div className="auth-card">

        <div className="auth-card-icon">
          ₹
        </div>

        <div className="auth-small-title">
          PASSWORD RECOVERY
        </div>

        <h1>
          Forgot Password
        </h1>

        <p className="auth-subtitle">
          Enter your email to reset your password
        </p>

        <form onSubmit={handleForgotPassword}>

          {/* EMAIL */}
          <div className="auth-field">

            <div className="auth-input">

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

          </div>

          {/* CONTINUE BUTTON */}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Continue"}

            {!loading && <span>→</span>}
          </button>

        </form>

        {/* MESSAGE */}
        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        {/* BACK TO LOGIN */}
        <div className="auth-switch">

          <span>
            Remember your password?
          </span>

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
          >
            Back to Login
          </button>

        </div>

      </div>

      {/* FOOTER */}
      <p className="auth-footer">
        Smart planning • Better spending • Brighter future
      </p>

    </div>
  );
}

export default ForgotPassword;