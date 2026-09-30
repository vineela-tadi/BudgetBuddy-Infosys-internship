import { useNavigate } from "react-router-dom";
import "./Welcome.css";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">

      {/* BACKGROUND */}
      <div className="welcome-grid"></div>

      <div className="welcome-glow welcome-glow-one"></div>
      <div className="welcome-glow welcome-glow-two"></div>

      {/* NAVBAR */}
      <nav className="welcome-nav">

        <div className="welcome-brand">
          <div className="welcome-brand-icon">
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

        <div className="welcome-nav-actions">
          <button
            className="welcome-login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="welcome-register-btn"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
        </div>

      </nav>


      {/* HERO SECTION */}
      <main className="welcome-content">

        <div className="welcome-badge">
          SMART PERSONAL FINANCE
        </div>

        <h1>
          Take Control of
          <br />
          Your <span>Money</span>
        </h1>

        <p className="welcome-description">
          BudgetBuddy helps you track your income,
          manage expenses, plan budgets, and build
          better financial habits — all in one place.
        </p>

        <div className="welcome-actions">

          <button
            className="welcome-primary-btn"
            onClick={() => navigate("/register")}
          >
            Start Managing Money
            <span>→</span>
          </button>

          <button
            className="welcome-secondary-btn"
            onClick={() => navigate("/login")}
          >
            Already have an account?
          </button>

        </div>


        {/* FEATURES */}
        <div className="welcome-features">

          <div className="welcome-feature">
            <div className="feature-icon">
              ₹
            </div>

            <div>
              <h3>Track Expenses</h3>
              <p>
                Know where your money goes.
              </p>
            </div>
          </div>


          <div className="welcome-feature">
            <div className="feature-icon">
              ◈
            </div>

            <div>
              <h3>Plan Your Budget</h3>
              <p>
                Set smarter spending limits.
              </p>
            </div>
          </div>


          <div className="welcome-feature">
            <div className="feature-icon">
              ↗
            </div>

            <div>
              <h3>Grow Your Savings</h3>
              <p>
                Work towards your financial goals.
              </p>
            </div>
          </div>

        </div>

      </main>


      {/* FOOTER */}
      <footer className="welcome-footer">
        Smart planning • Better spending • Brighter future
      </footer>

    </div>
  );
}

export default Welcome;