
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:8000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken")
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentDate] = useState(new Date());

  const monthName = currentDate.toLocaleString("en-US", {
    month: "short",
  });

  const monthYear = `${monthName} ${currentDate.getFullYear()}`;

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [incomeRes, expenseRes, budgetRes] = await Promise.all([
          fetch(`${API_URL}/income/`, { headers }),
          fetch(`${API_URL}/expenses/`, { headers }),
          fetch(`${API_URL}/budget/`, { headers }),
        ]);

        if (
          incomeRes.status === 401 ||
          expenseRes.status === 401 ||
          budgetRes.status === 401
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("access_token");
          localStorage.removeItem("authToken");
          navigate("/login");
          return;
        }

        if (!incomeRes.ok || !expenseRes.ok || !budgetRes.ok) {
          throw new Error("Dashboard data load avvaledu.");
        }

        const incomeData = await incomeRes.json();
        const expenseData = await expenseRes.json();
        const budgetData = await budgetRes.json();

        setIncome(Array.isArray(incomeData) ? incomeData : []);
        setExpenses(Array.isArray(expenseData) ? expenseData : []);
        setBudgets(Array.isArray(budgetData) ? budgetData : []);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const totalIncome = useMemo(
    () =>
      income.reduce(
        (sum, item) =>
          sum + Number(item.amount ?? item.allocated_amount ?? 0),
        0
      ),
    [income]
  );

  const totalExpenses = useMemo(
    () =>
      expenses.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      ),
    [expenses]
  );

  const totalBudget = useMemo(
    () =>
      budgets.reduce(
        (sum, item) => sum + Number(item.allocated_amount || 0),
        0
      ),
    [budgets]
  );

  const balance = totalIncome - totalExpenses;

  const expenseByCategory = useMemo(() => {
    const grouped = {};

    expenses.forEach((expense) => {
      const category = expense.category || "Other";
      grouped[category] =
        (grouped[category] || 0) + Number(expense.amount || 0);
    });

    return Object.entries(grouped)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenses]);

  const recentTransactions = useMemo(() => {
    const incomeTransactions = income.map((item) => ({
      id: `income-${item.id}`,
      type: "income",
      title: item.source || "Income",
      amount: Number(item.amount ?? item.allocated_amount ?? 0),
      date: item.date,
    }));

    const expenseTransactions = expenses.map((item) => ({
      id: `expense-${item.id}`,
      type: "expense",
      title: item.category || item.title || "Expense",
      amount: Number(item.amount || 0),
      date: item.date,
    }));

    return [...incomeTransactions, ...expenseTransactions]
      .sort(
        (a, b) =>
          new Date(b.date || 0).getTime() -
          new Date(a.date || 0).getTime()
      )
      .slice(0, 6);
  }, [income, expenses]);

  const spendingPercentage =
    totalBudget > 0
      ? Math.min((totalExpenses / totalBudget) * 100, 100)
      : 0;

  const donutPercentage = Math.round(spendingPercentage);

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const formatDate = (date) => {
    if (!date) return "--";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toISOString().slice(0, 10);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-card">
          <div className="loading-logo">BB</div>
          <p>Loading your money dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-navbar">
        <div className="brand-area">
          <div className="brand-logo">BB</div>
          <div>
            <div className="brand-name">BudgetBuddy</div>
            <div className="brand-tagline">Money, made simple.</div>
          </div>
        </div>

        <nav className="dashboard-nav">
          <button
            className="nav-item active"
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
            className="nav-item"
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
          >
            BB
          </button>

          <button className="logout-link" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-intro">
          <div>
            <h1>
              Your money,
              <br />
              <span>your direction.</span>
            </h1>
            <p>A clear view of what you earn, spend and save.</p>
          </div>

          <div className="month-pill">
            <span>●</span>
            {monthYear}
          </div>
        </section>

        <section className="balance-card">
          <div className="balance-main">
            <div className="balance-label">AVAILABLE BALANCE</div>
            <div className="balance-amount">
              {formatCurrency(balance)}
            </div>
            <p className="balance-description">
              Your current spending power after expenses.
            </p>

            <div className="balance-actions">
              <button
                className="primary-action"
                onClick={() => navigate("/income")}
              >
                + Add income
              </button>

              <button
                className="secondary-action"
                onClick={() => navigate("/expenses")}
              >
                + Add expense
              </button>
            </div>
          </div>

          <div className="balance-stats">
            <div className="balance-stat">
              <div className="stat-icon income-icon">↑</div>
              <div>
                <span>Income</span>
                <strong>{formatCurrency(totalIncome)}</strong>
              </div>
            </div>

            <div className="balance-stat">
              <div className="stat-icon expense-icon">↓</div>
              <div>
                <span>Spent</span>
                <strong>{formatCurrency(totalExpenses)}</strong>
              </div>
            </div>

            <div className="balance-stat">
              <div className="stat-icon budget-icon">○</div>
              <div>
                <span>Budget</span>
                <strong>{formatCurrency(totalBudget)}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="analytics-grid">
          <div className="dashboard-card money-card">
            <div className="card-heading">
              <div>
                <span className="section-label">ANALYTICS</span>
                <h2>Where your money goes</h2>
              </div>
              <span className="small-pill">This month</span>
            </div>

            <div className="money-content">
              <div
                className="donut-chart"
                style={{
                  background: `conic-gradient(
                    #172743 ${donutPercentage}%,
                    #e8eee9 ${donutPercentage}% 100%
                  )`,
                }}
              >
                <div className="donut-inner">
                  <strong>{donutPercentage}%</strong>
                  <span>spent</span>
                </div>
              </div>

              <div className="category-list">
                {expenseByCategory.length > 0 ? (
                  expenseByCategory.map((item, index) => {
                    const percentage =
                      totalExpenses > 0
                        ? Math.round(
                            (item.amount / totalExpenses) * 100
                          )
                        : 0;

                    return (
                      <div className="category-row" key={item.category}>
                        <div className="category-name">
                          <span
                            className={`category-dot dot-${index}`}
                          />
                          <span>{item.category}</span>
                        </div>

                        <div className="category-value">
                          <strong>{formatCurrency(item.amount)}</strong>
                          <small>{percentage}%</small>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-small">No expenses yet.</div>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-card budget-health-card">
            <div className="card-heading">
              <div>
                <span className="section-label">PLANNING</span>
                <h2>Budget health</h2>
              </div>

              <button
                className="manage-button"
                onClick={() => navigate("/budget")}
              >
                Manage →
              </button>
            </div>

            <div className="budget-health-content">
              <div className="budget-total">
                {formatCurrency(totalBudget)}
              </div>
              <div className="budget-subtitle">Total planned</div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${spendingPercentage}%` }}
                />
              </div>

              <div className="progress-info">
                <span>{formatCurrency(totalExpenses)} spent</span>
                <strong>
                  {totalBudget > 0
                    ? Math.round((totalExpenses / totalBudget) * 100)
                    : 0}
                  %
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-card transactions-card">
          <div className="card-heading transactions-heading">
            <div>
              <span className="section-label">ACTIVITY</span>
              <h2>Recent transactions</h2>
            </div>

            <div className="transaction-actions">
              <button onClick={() => navigate("/income")}>Income</button>
              <button onClick={() => navigate("/expenses")}>Expenses</button>
            </div>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="transactions-list">
              {recentTransactions.map((transaction) => (
                <div className="transaction-row" key={transaction.id}>
                  <div
                    className={`transaction-icon ${
                      transaction.type === "income"
                        ? "transaction-income"
                        : "transaction-expense"
                    }`}
                  >
                    {transaction.type === "income" ? "↑" : "↓"}
                  </div>

                  <div className="transaction-name">
                    <strong>{transaction.title}</strong>
                    <span>{formatDate(transaction.date)}</span>
                  </div>

                  <div
                    className={`transaction-amount ${
                      transaction.type === "income"
                        ? "amount-income"
                        : "amount-expense"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-transactions">
              <div className="empty-icon">＋</div>
              <h3>No transactions yet</h3>
              <p>Add your first income or expense to see it here.</p>

              <div className="empty-actions">
                <button onClick={() => navigate("/income")}>
                  Add income
                </button>
                <button onClick={() => navigate("/expenses")}>
                  Add expense
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="planning-cta">
          <div>
            <span className="section-label">READY TO PLAN?</span>
            <h2>Give every rupee a direction.</h2>
            <p>
              Set category budgets and keep your spending intentional.
            </p>
          </div>

          <button onClick={() => navigate("/budget")}>
            View budgets →
          </button>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
