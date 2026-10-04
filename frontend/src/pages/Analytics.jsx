
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./Analytics.css";

const API_URL = "http://127.0.0.1:8000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken")
  );
}

function Analytics() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };

        const endpoints = [
          `${API_URL}/analytics/summary`,
          `${API_URL}/analytics/categories`,
          `${API_URL}/analytics/monthly-trend`,
        ];

        const responses = await Promise.all(
          endpoints.map((url) =>
            fetch(url, { headers })
          )
        );

        if (responses.some((response) => response.status === 401)) {
          [
            "token",
            "access_token",
            "authToken",
          ].forEach((key) => localStorage.removeItem(key));

          navigate("/login");
          return;
        }

        if (responses.some((response) => !response.ok)) {
          throw new Error("Unable to load analytics data.");
        }

        const [summaryData, categoryData, trendData] =
          await Promise.all(
            responses.map((response) => response.json())
          );

        if (!cancelled) {
          setSummary(summaryData);
          setCategories(categoryData);
          setTrend(trendData);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load analytics.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = () => {
    [
      "token",
      "access_token",
      "authToken",
    ].forEach((key) => localStorage.removeItem(key));

    navigate("/login");
  };

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const income = Number(summary?.total_income || 0);
  const expenses = Number(summary?.total_expenses || 0);
  const balance = Number(summary?.balance ?? income - expenses);
  const savingsRate = Number(summary?.savings_rate || 0);
  const expenseRatio = Number(summary?.expense_ratio || 0);

  const topCategory = categories[0];
  const maxCategory = Math.max(
    1,
    ...categories.map((item) => Number(item.total || 0))
  );
  const maxTrend = Math.max(
    1,
    ...trend.map((item) => Number(item.total || 0))
  );

  return (
    <div className="analytics-page">
      <header className="dashboard-navbar">
        <div className="brand-area">
          <div
            className="brand-logo"
            role="button"
            tabIndex={0}
            onClick={() => navigate("/dashboard")}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate("/dashboard");
            }}
          >
            BB
          </div>

          <div>
            <div className="brand-name">BudgetBuddy</div>
            <div className="brand-tagline">
              Money, made simple.
            </div>
          </div>
        </div>

        <nav className="dashboard-nav">
          {[
            ["Overview", "/dashboard"],
            ["Income", "/income"],
            ["Expenses", "/expenses"],
            ["Budgets", "/budget"],
            ["Analytics", "/analytics"],
            ["Notifications", "/notifications"],
            ["Reports", "/reports"],
          ].map(([label, path]) => (
            <button
              key={path}
              className={`nav-item ${
                path === "/analytics" ? "active" : ""
              }`}
              aria-current={
                path === "/analytics" ? "page" : undefined
              }
              onClick={() => navigate(path)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="nav-right">
          <button
            className="profile-circle"
            onClick={() => navigate("/profile")}
            aria-label="Open Profile"
          >
            BB
          </button>
          <button
            className="logout-link"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="analytics-main">
        <section className="analytics-heading">
          <p className="analytics-eyebrow">FINANCIAL INSIGHTS</p>
          <h1>
            Understand your <span>money.</span>
          </h1>
          <p>
            Explore your spending patterns and savings at a glance.
          </p>
        </section>

        {loading ? (
          <div className="analytics-status">
            Loading your financial insights...
          </div>
        ) : error ? (
          <div className="analytics-error" role="alert">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <section className="analytics-cards">
              <article className="analytics-card income-card">
                <div className="analytics-card-icon">↑</div>
                <p>Total Income</p>
                <h2>{money(income)}</h2>
                <span>All recorded earnings</span>
              </article>

              <article className="analytics-card expense-card">
                <div className="analytics-card-icon">↓</div>
                <p>Total Expenses</p>
                <h2>{money(expenses)}</h2>
                <span>All recorded spending</span>
              </article>

              <article className="analytics-card balance-card">
                <div className="analytics-card-icon">₹</div>
                <p>Remaining Balance</p>
                <h2>{money(balance)}</h2>
                <span>Income minus expenses</span>
              </article>
            </section>

            <section className="analytics-insight-grid">
              <article className="analytics-insight-card">
                <span className="analytics-eyebrow">
                  SAVINGS RATE
                </span>
                <h2>{income > 0 ? `${savingsRate}%` : "N/A"}</h2>
                <p>Share of income remaining after expenses.</p>
              </article>

              <article className="analytics-insight-card">
                <span className="analytics-eyebrow">
                  EXPENSE RATIO
                </span>
                <h2>{income > 0 ? `${expenseRatio}%` : "N/A"}</h2>
                <p>Share of income spent.</p>
              </article>

              <article className="analytics-insight-card">
                <span className="analytics-eyebrow">
                  TOP CATEGORY
                </span>
                <h2 className="analytics-category-title">
                  {topCategory?.category || "No data"}
                </h2>
                <p>
                  {topCategory
                    ? `${money(topCategory.total)} spent`
                    : "Add expenses to see your top category."}
                </p>
              </article>
            </section>

            <section className="analytics-breakdown">
              <p className="analytics-eyebrow">SPENDING ANALYSIS</p>
              <h2>Expenses by Category</h2>
              <p className="analytics-section-description">
                See which categories account for your spending.
              </p>

              {categories.length === 0 ? (
                <p>No expense records available yet.</p>
              ) : (
                categories.map((item) => (
                  <div
                    className="analytics-bar-row"
                    key={item.category}
                  >
                    <div className="analytics-bar-label">
                      <span>{item.category}</span>
                      <strong>{money(item.total)}</strong>
                    </div>
                    <div className="analytics-bar-track">
                      <div
                        className="analytics-bar expense-bar"
                        style={{
                          width: `${
                            (Number(item.total || 0) / maxCategory) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="analytics-breakdown">
              <p className="analytics-eyebrow">MONTHLY TRENDS</p>
              <h2>Last 6 Months of Spending</h2>
              <p className="analytics-section-description">
                Compare your recorded expenses month by month.
              </p>

              <div className="analytics-trend-list">
                {trend.map((item) => {
                  const amount = Number(item.total || 0);
                  const width = (amount / maxTrend) * 100;

                  return (
                    <div
                      className="analytics-trend-row"
                      key={item.month}
                    >
                      <span className="analytics-trend-month">
                        {item.month}
                      </span>
                      <div className="analytics-trend-track">
                        <div
                          className="analytics-trend-bar"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <strong>{money(amount)}</strong>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        <button
          className="analytics-action"
          onClick={() => navigate("/reports")}
        >
          View Monthly Reports →
        </button>
      </main>
    </div>
  );
}

export default Analytics;