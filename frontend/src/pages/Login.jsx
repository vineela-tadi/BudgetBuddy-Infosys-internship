import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
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
      <path d="M10.6 6.2A9.9 9.9 0 0 1 12 6c6.5 0 10 6 10 6a17.5 17.5 0 0 1-3.2 3.8" />
      <path d="M6.2 6.7C3.5 8.5 2 12 2 12s3.5 6 10 6c1.3 0 2.5-.2 3.5-.7" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.26Z"
      />
      <path
        fill="#34A853"
        d="M12 21.98c2.63 0 4.84-.87 6.45-2.49l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.98Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.93A5.86 5.86 0 0 1 6.23 12c0-.67.11-1.32.31-1.93V7.54H3.3A9.99 9.99 0 0 0 2 12c0 1.61.39 3.13 1.3 4.46l3.24-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.04c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.05 14.63 2.02 12 2.02a9.75 9.75 0 0 0-8.7 5.52l3.24 2.53C6.85 7.76 9 6.04 9 6.04Z"
      />
    </svg>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // NORMAL LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Login failed");
        return;
      }

      localStorage.setItem(
        "token",
        data.access_token
      );

      setMessage("Login successful!");

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to the server"
      );
    }
  };

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleGoogleSuccess = async (
    credentialResponse
  ) => {
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/google-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential:
              credentialResponse.credential,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail ||
            "Google login failed"
        );
        return;
      }

      localStorage.setItem(
        "token",
        data.access_token
      );

      setMessage(
        "Google login successful!"
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to the server"
      );
    }
  };

  // =====================================================
  // GOOGLE LOGIN ERROR
  // =====================================================

  const handleGoogleError = () => {
    setMessage(
      "Google login failed. Please try again."
    );
  };

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const handleForgotPassword = () => {
    navigate("/forgot-password");
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


      {/* LOGIN CARD */}

      <div className="auth-card">

        {/* CARD ICON */}

        <div className="auth-card-icon">
          ₹
        </div>


        {/* SMALL TITLE */}

        <div className="auth-small-title">
          WELCOME BACK
        </div>


        {/* MAIN TITLE */}

        <h1>
          Login
        </h1>


        <p className="auth-subtitle">
          Sign in to continue managing your finances
        </p>


        {/* LOGIN FORM */}

        <form onSubmit={handleLogin}>

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
                placeholder="Enter your password"
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
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <EyeIcon
                  visible={showPassword}
                />
              </button>

            </div>

          </div>


          {/* OPTIONS */}

          <div className="auth-options">

            <label className="remember">

              <input
                type="checkbox"
              />

              <span>
                Remember me
              </span>

            </label>


            <button
              type="button"
              className="forgot"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="auth-submit"
          >
            Login

            <span>
              →
            </span>

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


        {/* GOOGLE LOGIN */}

        <div className="google-login">

          {/* CUSTOM THEMED BUTTON */}

          <button
            type="button"
            className="google-theme-button"
          >
            <GoogleIcon />

            <span>
              Sign in with Google
            </span>

          </button>


          {/* REAL GOOGLE LOGIN */}

          <div className="google-login-overlay">

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              shape="rectangular"
              text="signin_with"
              width="100%"
            />

          </div>

        </div>


        {/* REGISTER */}

        <div className="auth-switch">

          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={() =>
              navigate("/register")
            }
          >
            Create Account
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

export default Login;