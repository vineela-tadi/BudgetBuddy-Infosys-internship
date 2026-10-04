
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const navItems = [
  { label: "Overview", path: "/dashboard" },
  { label: "Income", path: "/income" },
  { label: "Expenses", path: "/expenses" },
  { label: "Budgets", path: "/budget" },
  { label: "Analytics", path: "/analytics" },
  { label: "Notifications", path: "/notifications" },
  { label: "Reports", path: "/reports" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <header className="bb-navbar">
      <div
        className="bb-brand"
        onClick={() => navigate("/dashboard")}
      >
        <div className="bb-logo">BB</div>
        <div>
          <strong>BudgetBuddy</strong>
          <small>MONEY, MADE SIMPLE.</small>
        </div>
      </div>

      <nav className="bb-nav-links">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={
              location.pathname === item.path
                ? "bb-nav-link active"
                : "bb-nav-link"
            }
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="bb-nav-right">
        <button
          className="bb-avatar"
          onClick={() => navigate("/profile")}
        >
          BB
        </button>
        <button className="bb-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
