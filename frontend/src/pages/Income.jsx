import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Income.css";

const API_BASE = "http://127.0.0.1:8000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken")
  );
}

function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("authToken");
}

export default function Income() {
  const navigate = useNavigate();

  const [income, setIncome] = useState([]);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    try {
      const authToken = getToken();

      const response = await fetch(`${API_BASE}/income/`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 401) {
        clearAuth();
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch income");
      }

      const data = await response.json();
      setIncome(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage("Unable to load income.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();

    if (!amount || !source || !date) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      const authToken = getToken();

      const response = await fetch(`${API_BASE}/income/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          source: source.trim(),
          date,
          description: description.trim(),
        }),
      });

      if (response.status === 401) {
        clearAuth();
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to add income");
      }

      setAmount("");
      setSource("");
      setDate("");
      setDescription("");
      setMessage("Income added successfully.");

      fetchIncome();
    } catch (error) {
      setMessage("Unable to add income.");
    }
  };

  const handleDelete = async (incomeId) => {
    try {
      const authToken = getToken();

      const response = await fetch(`${API_BASE}/income/${incomeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 401) {
        clearAuth();
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete income");
      }

      setMessage("Income deleted successfully.");
      fetchIncome();
    } catch (error) {
      setMessage("Unable to delete income.");
    }
  };

  const totalIncome = income.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  const sortedIncome = [...income].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="income-page">

      {/* SAME HEADER AS BUDGET */}
      <header className="income-nav">
        <div
          className="income-brand"
          onClick={() => navigate("/dashboard")}
        >
          <div className="income-logo">BB</div>

          <div>
            <div className="income-brand-name">BudgetBuddy</div>
            <div className="income-brand-tagline">
              Money, made simple.
            </div>
          </div>
        </div>

        <nav className="income-menu">
          <button
            className="income-nav-item"
            onClick={() => navigate("/dashboard")}
          >
            Overview
          </button>

          <button className="income-nav-item active">
            Income
          </button>

          <button
            className="income-nav-item"
            onClick={() => navigate("/expenses")}
          >
            Expenses
          </button>

          <button
            className="income-nav-item"
            onClick={() => navigate("/budget")}
          >
            Budgets
          </button>
        </nav>

        <div className="income-nav-right">
          <button
            className="income-avatar"
            onClick={() => navigate("/profile")}
          >
            BB
          </button>

          <button
            className="income-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="income-main">

        <section className="income-heading">
          <div>
            <p className="income-eyebrow">FINANCIAL TRACKING</p>
            <h1>Income</h1>
            <p className="income-subtitle">
              Track your income and keep your finances organized.
            </p>
          </div>

          <div className="income-total">
            <span>Total Income</span>
            <strong>₹{totalIncome.toLocaleString("en-IN")}</strong>
          </div>
        </section>

        {message && (
          <div className="income-message">
            {message}
          </div>
        )}

        <section className="income-grid">

          {/* ADD INCOME */}
          <div className="income-form-section">
            <div className="section-title">
              <h2>Add Income</h2>
              <p>Enter your income details below.</p>
            </div>

            <form onSubmit={handleAddIncome} className="income-form">

              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Source *</label>
                <input
                  type="text"
                  placeholder="Salary, Freelance, etc."
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Optional description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                />
              </div>

              <button type="submit" className="add-income-btn">
                Add Income
              </button>
            </form>
          </div>

          {/* INCOME HISTORY */}
          <div className="income-history-section">
            <div className="section-title">
              <h2>Income History</h2>
              <p>Your recent income records.</p>
            </div>

            {loading ? (
              <div className="income-empty">
                Loading income...
              </div>
            ) : sortedIncome.length === 0 ? (
              <div className="income-empty">
                <h3>No income records yet</h3>
                <p>Add your first income using the form.</p>
              </div>
            ) : (
              <div className="income-list">
                {sortedIncome.map((item) => (
                  <div
                    className="income-item"
                    key={item.id}
                  >
                    <div className="income-item-left">
                      <div className="income-item-icon">
                        ₹
                      </div>

                      <div>
                        <h3>{item.source}</h3>

                        <p>
                          {item.description || "No description"}
                        </p>

                        <span>
                          {item.date}
                        </span>
                      </div>
                    </div>

                    <div className="income-item-right">
                      <strong>
                        +₹{Number(item.amount).toLocaleString("en-IN")}
                      </strong>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="delete-income-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

        <section className="income-footer-card">
          <div>
            <p className="income-eyebrow">KEEP GOING</p>
            <h2>Small tracking habits make a big difference.</h2>
            <p>
              Keep adding your income and expenses to understand
              your spending better.
            </p>
          </div>

          <button onClick={() => navigate("/expenses")}>
            Track Expenses
          </button>
        </section>

      </main>
    </div>
  );
}