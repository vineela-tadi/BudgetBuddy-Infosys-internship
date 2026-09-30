import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function EyeIcon({ open }) {
  return open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6 0 9.5 7 9.5 7a17.4 17.4 0 0 1-3.1 3.9" />
      <path d="M6.2 6.2C3.9 7.7 2.5 12 2.5 12s3.5 7 9.5 7c1.3 0 2.5-.3 3.5-.8" />
    </svg>
  );
}

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Registration failed");
        setLoading(false);
        return;
      }

      setMessage("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to the server");
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
            PLAN · TRACK · GROW
          </p>
        </div>

      </div>

      {/* REGISTER CARD */}
      <div className="auth-card register-card">

        {/* CARD ICON */}
        <div className="auth-card-icon">
          ₹
        </div>

        {/* TITLE */}
        <div className="auth-small-title">
          GET STARTED
        </div>

        <h1>
          Create Account
        </h1>

        <p className="auth-subtitle">
          Start your journey towards smarter money management
        </p>

        {/* FORM */}
        <form onSubmit={handleRegister}>

          {/* FULL NAME */}
          <div className="auth-field">

            <div className="auth-input">

              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />

            </div>

          </div>

          {/* EMAIL */}
          <div className="auth-field">

            <div className="auth-input">

              <input
                id="email"
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

          {/* PASSWORD */}
          <div className="auth-field">

            <div className="auth-input">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <button
                type="button"
                className="auth-eye"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <EyeIcon
                  open={showPassword}
                />
              </button>

            </div>

          </div>

          {/* CONFIRM PASSWORD */}
          <div className="auth-field">

            <div className="auth-input">

              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
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
                  open={showConfirmPassword}
                />
              </button>

            </div>

          </div>

          {/* CREATE ACCOUNT BUTTON */}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >

            {loading
              ? "Creating Account..."
              : "Create Account"}

            {!loading && (
              <span>→</span>
            )}

          </button>

        </form>

        {/* MESSAGE */}
        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        {/* DIVIDER */}
        <div className="auth-divider">

          <span></span>

          <small>
            OR
          </small>

          <span></span>

        </div>

        {/* LOGIN */}
        <div className="auth-switch">

          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
          >
            Login
          </button>

        </div>

      </div>

      {/* FOOTER */}
      <p className="auth-footer">
        Smart planning · Better spending · Brighter future
      </p>

    </div>
  );
}

export default Register;