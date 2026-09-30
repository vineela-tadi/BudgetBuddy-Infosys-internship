
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function EyeIcon({ visible }) {
  return visible ? (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ) : (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2A9.9 9.9 0 0 1 12 6c6.5 0 10 6 10 6s-3.5 6-10 6S2 12 2 12Z" />
      <path d="M6.2 6.7C3.5 8.5 2 12 2 12s3.5 6 10 6c1.3 0 2.5-.2 3.5-.7" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setMessage("");

    // Get token automatically from localStorage
    const token = localStorage.getItem("reset_token");

    if (!token) {
      setMessage(
        "Reset token is missing. Please request a new reset link."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Password reset failed"
        );

        setLoading(false);
        return;
      }

      setMessage(
        data.message ||
          "Password reset successfully!"
      );

      // Remove token after successful reset
      localStorage.removeItem("reset_token");

      // Go back to Login
      setTimeout(() => {
        navigate("/login");
      }, 1500);

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

      {/* RESET PASSWORD CARD */}
      <div className="auth-card">

        <div className="auth-card-icon">
          ₹
        </div>

        <div className="auth-small-title">
          PASSWORD RESET
        </div>

        <h1>
          Reset Password
        </h1>

        <p className="auth-subtitle">
          Create a new password for your account
        </p>

        <form onSubmit={handleResetPassword}>

          {/* NEW PASSWORD */}
          <div className="auth-field">

            <div className="auth-input">

              <input
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                required
              />

              <button
                type="button"
                className="auth-eye"
                onClick={() =>
                  setShowNewPassword(
                    !showNewPassword
                  )
                }
                aria-label={
                  showNewPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <EyeIcon
                  visible={showNewPassword}
                />
              </button>

            </div>

          </div>

          {/* CONFIRM PASSWORD */}
          <div className="auth-field">

            <div className="auth-input">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
              />

              <button
                type="button"
                className="auth-eye"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <EyeIcon
                  visible={showConfirmPassword}
                />
              </button>

            </div>

          </div>

          {/* RESET BUTTON */}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}

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

export default ResetPassword;