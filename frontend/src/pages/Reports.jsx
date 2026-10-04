import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./Reports.css";

const API_URL = "http://127.0.0.1:8000";

function Reports() {
const navigate = useNavigate();

const [report, setReport] = useState(null);
const [month, setMonth] = useState(new Date().getMonth() + 1);
const [year, setYear] = useState(new Date().getFullYear());
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const fetchReport = useCallback(async () => {
const token =
localStorage.getItem("token") ||
localStorage.getItem("access_token") ||
localStorage.getItem("authToken");


if (!token) {
  setReport(null);
  setError("Please login again to view your report.");
  return;
}

if (
  !Number.isInteger(month) ||
  month < 1 ||
  month > 12 ||
  !Number.isInteger(year) ||
  year < 2000 ||
  year > 2100
) {
  setReport(null);
  setError("Please select a valid month and year.");
  return;
}

setLoading(true);
setError("");

try {
  const response = await fetch(
    `${API_URL}/reports/monthly?month=${month}&year=${year}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  if (response.status === 401) {
    setReport(null);
    setError("Session expired. Please login again.");
    return;
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to load report.");
  }

  const data = await response.json();
  setReport(data);
} catch (err) {
  console.error("Report error:", err);
  setReport(null);
  setError(
    err.message?.toLowerCase().includes("fetch")
      ? "Cannot connect to the backend. Check whether the server is running."
      : err.message || "Failed to load report."
  );
} finally {
  setLoading(false);
}


}, [month, year]);

useEffect(() => {
fetchReport();
}, [fetchReport]);

const formatCurrency = (amount) =>
`₹${Number(amount ?? 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

const monthName = new Date(2000, month - 1).toLocaleString("en-US", {
month: "long",
});

const income = Number(report?.total_income ?? 0);
const expenses = Number(report?.total_expenses ?? 0);
const balance = Number(
report?.remaining_balance ?? income - expenses
);

const maximum = Math.max(income, expenses);
const incomeWidth = maximum > 0 ? (income / maximum) * 100 : 0;
const expenseWidth = maximum > 0 ? (expenses / maximum) * 100 : 0;

const handleLogout = () => {
localStorage.removeItem("token");
localStorage.removeItem("access_token");
localStorage.removeItem("authToken");
navigate("/login");
};

return ( <div className="dashboard-page reports-page">
{/* Same navbar structure as Dashboard.jsx */} <header className="dashboard-navbar"> <div className="brand-area">
<div
className="brand-logo"
onClick={() => navigate("/dashboard")}
role="button"
tabIndex={0}
onKeyDown={(e) => {
if (e.key === "Enter") navigate("/dashboard");
}}
>
BB </div>


      <div>
        <div className="brand-name">BudgetBuddy</div>
        <div className="brand-tagline">Money, made simple.</div>
      </div>
    </div>

    <nav className="dashboard-nav">
      <button
        className="nav-item"
        onClick={() => navigate("/dashboard")}
      >
        Overview
      </button>

      <button
        className="nav-item"
        onClick={() => navigate("/income")}
      >
        Income
      </button>

      <button
        className="nav-item"
        onClick={() => navigate("/expenses")}
      >
        Expenses
      </button>

      <button
        className="nav-item"
        onClick={() => navigate("/budget")}
      >
        Budgets
      </button>

      <button
        className="nav-item"
        onClick={() => navigate("/analytics")}
      >
        Analytics
      </button>

      <button
        className="nav-item"
        onClick={() => navigate("/notifications")}
      >
        Notifications
      </button>

      <button
        className="nav-item active"
        aria-current="page"
        onClick={() => navigate("/reports")}
      >
        Reports
      </button>
    </nav>

    <div className="nav-right">
      <button
        className="profile-circle"
        onClick={() => navigate("/profile")}
        title="Open Profile"
        aria-label="Open Profile"
      >
        BB
      </button>

      <button className="logout-link" onClick={handleLogout}>
        Logout
      </button>
    </div>
  </header>

  {/* Reports content */}
  <main className="reports-main">
    <section className="reports-heading">
      <div>
        <span className="reports-eyebrow">FINANCIAL OVERVIEW</span>
        <h1>Monthly Reports</h1>
        <p>
          A clear view of your monthly income, expenses and savings.
        </p>
      </div>

      <div className="reports-heading-icon">▤</div>
    </section>

    {/* Filters */}
    <section className="reports-filter-card">
      <div>
        <h2>Generate your report</h2>
        <p>Select a month and year to view your financial summary.</p>
      </div>

      <div className="reports-filter-controls">
        <label className="reports-field">
          <span>Month</span>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString("en-US", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </label>

        <label className="reports-field">
          <span>Year</span>
          <input
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) =>
              setYear(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
          />
        </label>

        <button
          className="reports-generate-btn"
          onClick={fetchReport}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Report →"}
        </button>
      </div>
    </section>

    {loading && (
      <div className="reports-message" role="status">
        <span className="reports-spinner" />
        Loading your monthly report...
      </div>
    )}

    {!loading && error && (
      <div className="reports-error" role="alert">
        <h3>Unable to load report</h3>
        <p>{error}</p>

        {error.toLowerCase().includes("login") ||
        error.toLowerCase().includes("session") ? (
          <button onClick={() => navigate("/login")}>
            Go to Login
          </button>
        ) : (
          <button onClick={fetchReport}>Try Again</button>
        )}
      </div>
    )}

    {!loading && !error && report && (
      <>
        <section className="reports-result-heading">
          <div>
            <span className="reports-eyebrow">YOUR SUMMARY</span>
            <h2>
              {monthName} {year}
            </h2>
            <p>Your financial snapshot for the selected month.</p>
          </div>

          <span className="reports-period-badge">
            {monthName} {year}
          </span>
        </section>

        <section className="reports-summary-grid">
          <article className="reports-summary-card income-card">
            <div className="reports-card-top">
              <span>Total Income</span>
              <span className="reports-card-icon">↑</span>
            </div>
            <h3>{formatCurrency(income)}</h3>
            <p>Money received this month</p>
            <div className="reports-card-accent" />
          </article>

          <article className="reports-summary-card expense-card">
            <div className="reports-card-top">
              <span>Total Expenses</span>
              <span className="reports-card-icon">↓</span>
            </div>
            <h3>{formatCurrency(expenses)}</h3>
            <p>Money spent this month</p>
            <div className="reports-card-accent" />
          </article>

          <article className="reports-summary-card balance-card">
            <div className="reports-card-top">
              <span>Remaining Balance</span>
              <span className="reports-card-icon">₹</span>
            </div>
            <h3>{formatCurrency(balance)}</h3>
            <p>
              {balance < 0
                ? "Expenses exceed income"
                : "Income minus expenses"}
            </p>
            <div className="reports-card-accent" />
          </article>
        </section>

        <section className="reports-breakdown-card">
          <div className="reports-breakdown-heading">
            <div>
              <span className="reports-eyebrow">SPENDING ANALYSIS</span>
              <h2>Income vs Expenses</h2>
              <p>Compare your income and spending for this month.</p>
            </div>
          </div>

          <div className="reports-bar-row">
            <div className="reports-bar-label">
              <span>
                <i className="reports-dot income-dot" />
                Income
              </span>
              <strong>{formatCurrency(income)}</strong>
            </div>
            <div className="reports-bar-track">
              <div
                className="reports-bar income-bar"
                style={{ width: `${incomeWidth}%` }}
              />
            </div>
          </div>

          <div className="reports-bar-row">
            <div className="reports-bar-label">
              <span>
                <i className="reports-dot expense-dot" />
                Expenses
              </span>
              <strong>{formatCurrency(expenses)}</strong>
            </div>
            <div className="reports-bar-track">
              <div
                className="reports-bar expense-bar"
                style={{ width: `${expenseWidth}%` }}
              />
            </div>
          </div>

          <div className="reports-balance-note">
            <span>Monthly balance</span>
            <strong className={balance < 0 ? "negative-balance" : ""}>
              {formatCurrency(balance)}
            </strong>
          </div>
        </section>
      </>
    )}

    {!loading && !error && !report && (
      <div className="reports-empty">
        <div className="reports-empty-icon">▤</div>
        <h2>Your report will appear here</h2>
        <p>Select a month and year, then generate your report.</p>
      </div>
    )}

    <footer className="reports-footer">
      BudgetBuddy · Money, made simple.
    </footer>
  </main>
</div>


);
}

export default Reports;
