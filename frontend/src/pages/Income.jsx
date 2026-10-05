
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
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [editAmount, setEditAmount] = useState("");
  const [editSource, setEditSource] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const fetchIncome = async () => {
    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE}/income/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        clearAuth();
        navigate("/login");
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to fetch income.");
      }

      setIncome(Array.isArray(data) ? data : []);
    } catch (error) {
      showMessage(error.message || "Unable to load income.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
      return;
    }

    fetchIncome();
  }, []);

  // ADD INCOME
  const handleAddIncome = async (e) => {
    e.preventDefault();

    if (!amount || !source.trim() || !date) {
      showMessage("Please fill all required fields.", "error");
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      showMessage("Amount must be greater than zero.", "error");
      return;
    }

    setAdding(true);
    setMessage("");

    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE}/income/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to add income.");
      }

      setAmount("");
      setSource("");
      setDate(new Date().toISOString().split("T")[0]);
      setDescription("");

      showMessage("Income added successfully.");
      await fetchIncome();
    } catch (error) {
      showMessage(error.message || "Unable to add income.", "error");
    } finally {
      setAdding(false);
    }
  };

  // START INLINE EDIT
  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditAmount(String(item.amount ?? ""));
    setEditSource(item.source || "");
    setEditDate(
      item.date
        ? String(item.date).slice(0, 10)
        : new Date().toISOString().split("T")[0]
    );
    setEditDescription(item.description || "");
    setMessage("");
  };

  // CANCEL EDIT
  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount("");
    setEditSource("");
    setEditDate("");
    setEditDescription("");
  };

  // UPDATE INCOME
  const handleUpdateIncome = async (incomeId) => {
    if (!editAmount || !editSource.trim() || !editDate) {
      showMessage("Please fill all required fields.", "error");
      return;
    }

    if (
      !Number.isFinite(Number(editAmount)) ||
      Number(editAmount) <= 0
    ) {
      showMessage("Amount must be greater than zero.", "error");
      return;
    }

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/income/${incomeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: Number(editAmount),
            source: editSource.trim(),
            date: editDate,
            description: editDescription.trim(),
          }),
        }
      );

      if (response.status === 401) {
        clearAuth();
        navigate("/login");
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const detail = Array.isArray(data?.detail)
          ? data.detail.map((item) => item.msg).join(", ")
          : data?.detail;

        throw new Error(detail || "Failed to update income.");
      }

      cancelEdit();
      showMessage("Income updated successfully.");
      await fetchIncome();
    } catch (error) {
      showMessage(error.message || "Unable to update income.", "error");
    } finally {
      setSaving(false);
    }
  };

  // DELETE INCOME
  const handleDelete = async (incomeId) => {
    if (!window.confirm("Are you sure you want to delete this income?")) {
      return;
    }

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setDeletingId(incomeId);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/income/${incomeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        clearAuth();
        navigate("/login");
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to delete income.");
      }

      if (editingId === incomeId) {
        cancelEdit();
      }

      showMessage("Income deleted successfully.");
      await fetchIncome();
    } catch (error) {
      showMessage(error.message || "Unable to delete income.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const totalIncome = income.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  const sortedIncome = [...income].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="income-page">

      {/* NAVBAR */}
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

          <button
  className="nav-item"
  onClick={() => navigate("/savings-goals")}
>
  Savings
</button>

          <button
            className="income-nav-item"
            onClick={() => navigate("/analytics")}
          >
            Analytics
          </button>

          <button
            className="income-nav-item"
            onClick={() => navigate("/notifications")}
          >
            Notifications
          </button>

          <button
            className="income-nav-item"
            onClick={() => navigate("/reports")}
          >
            Reports
          </button>
        </nav>

        <div className="income-nav-right">
          <button
            className="income-avatar"
            onClick={() => navigate("/profile")}
            title="Open Profile"
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
            <strong>
              ₹{totalIncome.toLocaleString("en-IN")}
            </strong>
          </div>
        </section>

        {message && (
          <div
            className={`income-message ${
              messageType === "error" ? "error" : "success"
            }`}
            role="status"
          >
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
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Source *</label>
                <input
                  type="text"
                  placeholder="Salary, Freelance, etc."
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
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

              <button
                type="submit"
                className="add-income-btn"
                disabled={adding}
              >
                {adding ? "Adding..." : "Add Income"}
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
              <div className="income-empty">Loading income...</div>
            ) : sortedIncome.length === 0 ? (
              <div className="income-empty">
                <h3>No income records yet</h3>
                <p>Add your first income using the form.</p>
              </div>
            ) : (
              <div className="income-list">
                {sortedIncome.map((item) => (
                  <div className="income-item" key={item.id}>
                    <div className="income-item-left">
                      <div className="income-item-icon">₹</div>

                      {editingId === item.id ? (
                        <div className="income-edit-fields">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            aria-label="Edit amount"
                            placeholder="Amount"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                          />

                          <input
                            type="text"
                            aria-label="Edit source"
                            placeholder="Source"
                            value={editSource}
                            onChange={(e) => setEditSource(e.target.value)}
                          />

                          <input
                            type="date"
                            aria-label="Edit date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                          />

                          <textarea
                            aria-label="Edit description"
                            placeholder="Description (optional)"
                            value={editDescription}
                            onChange={(e) =>
                              setEditDescription(e.target.value)
                            }
                            rows="2"
                          />

                          <div className="income-edit-actions">
                            <button
                              type="button"
                              className="income-save-btn"
                              onClick={() => handleUpdateIncome(item.id)}
                              disabled={saving}
                            >
                              {saving ? "Saving..." : "Save"}
                            </button>

                            <button
                              type="button"
                              className="income-cancel-btn"
                              onClick={cancelEdit}
                              disabled={saving}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="income-item-details">
                          <h3>{item.source}</h3>
                          <p>{item.description || "No description"}</p>
                          <span>{item.date}</span>
                        </div>
                      )}
                    </div>

                    {editingId !== item.id && (
                      <div className="income-item-right">
                        <strong>
                          +₹{Number(item.amount || 0).toLocaleString("en-IN")}
                        </strong>

                        <div className="income-item-actions">
                          <button
                            type="button"
                            className="edit-income-btn"
                            onClick={() => handleEdit(item)}
                            disabled={
                              saving || adding || deletingId !== null
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-income-btn"
                            onClick={() => handleDelete(item.id)}
                            disabled={
                              saving || adding || deletingId !== null
                            }
                          >
                            {deletingId === item.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    )}
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