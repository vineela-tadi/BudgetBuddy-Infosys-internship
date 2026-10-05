
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Profile from "./Profile";
import "./Expenses.css";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:8000";

function Expenses() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDate, setEditDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken");

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("authToken");
  };

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  // FETCH EXPENSES
  const fetchExpenses = async () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/expenses/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        clearAuth();
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load expenses."
        );
      }

      setExpenses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showMessage(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // RESET ADD FORM
  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  // START INLINE EDITING
  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setEditTitle(expense.title || "");
    setEditAmount(String(expense.amount ?? ""));
    setEditCategory(expense.category || "");
    setEditDate(
      expense.date
        ? String(expense.date).slice(0, 10)
        : new Date().toISOString().split("T")[0]
    );
    setMessage("");
  };

  // CANCEL INLINE EDITING
  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditAmount("");
    setEditCategory("");
    setEditDate("");
  };

  // ADD NEW EXPENSE
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!title.trim() || !category.trim() || !date) {
      showMessage("Please fill in all fields.", "error");
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      showMessage("Amount must be greater than 0.", "error");
      return;
    }

    setAdding(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/expenses/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          amount: Number(amount),
          category: category.trim(),
          date,
        }),
      });

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

        throw new Error(detail || "Failed to add expense.");
      }

      resetForm();
      showMessage("Expense added successfully!", "success");
      await fetchExpenses();
    } catch (error) {
      console.error(error);
      showMessage(error.message, "error");
    } finally {
      setAdding(false);
    }
  };

  // UPDATE EXPENSE
  const handleUpdateExpense = async (expenseId) => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!editTitle.trim() || !editCategory.trim() || !editDate) {
      showMessage("Please fill in all fields.", "error");
      return;
    }

    if (
      !Number.isFinite(Number(editAmount)) ||
      Number(editAmount) <= 0
    ) {
      showMessage("Amount must be greater than 0.", "error");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/expenses/${expenseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            amount: Number(editAmount),
            category: editCategory.trim(),
            date: editDate,
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

        throw new Error(detail || "Failed to update expense.");
      }

      cancelInlineEdit();
      showMessage("Expense updated successfully!", "success");
      await fetchExpenses();
    } catch (error) {
      console.error(error);
      showMessage(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // DELETE EXPENSE
  const handleDelete = async (expenseId) => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (
      !window.confirm("Are you sure you want to delete this expense?")
    ) {
      return;
    }

    setDeletingId(expenseId);

    try {
      const response = await fetch(
        `${API_URL}/expenses/${expenseId}`,
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
        throw new Error(
          data?.detail || "Failed to delete expense."
        );
      }

      if (editingId === expenseId) {
        cancelInlineEdit();
      }

      showMessage("Expense deleted successfully!", "success");
      await fetchExpenses();
    } catch (error) {
      console.error(error);
      showMessage(error.message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  // TOTAL EXPENSES
  const totalExpenses = useMemo(
    () =>
      expenses.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      ),
    [expenses]
  );

  // CATEGORY TOTALS
  const categoryTotals = useMemo(() => {
    const result = {};

    expenses.forEach((item) => {
      const name = item.category || "Other";
      result[name] =
        (result[name] || 0) + Number(item.amount || 0);
    });

    return Object.entries(result)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [expenses]);

  return (
    <div className="expenses-page">
      {/* DASHBOARD-STYLE NAVBAR */}
      <header className="dashboard-navbar">
        <div className="brand-area">
          <div
            className="brand-logo"
            onClick={() => navigate("/dashboard")}
            style={{ cursor: "pointer" }}
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

          <button className="nav-item active">
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
  onClick={() => navigate("/savings-goals")}
>
  Savings
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
            onClick={() => setShowProfile(true)}
            title="Open Profile"
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

      <main className="expenses-container">
        {/* INTRO */}
        <section className="expenses-intro">
          <div>
            <span className="expenses-eyebrow">
              PERSONAL FINANCE
            </span>

            <h1>
              Track every
              <br />
              <span>rupee you spend.</span>
            </h1>

            <p>
              Keep your expenses organized and stay in control.
            </p>
          </div>

          <div className="today-pill">
            ●{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </section>

        {/* SUMMARY */}
        <section className="expense-summary">
          <div className="expense-total-card">
            <div>
              <span>Total Expenses</span>
              <h2>
                ₹{totalExpenses.toLocaleString("en-IN")}
              </h2>
              <p>
                Across {expenses.length} transaction
                {expenses.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="summary-icon">↓</div>
          </div>

          <div className="expense-mini-card">
            <span>TRANSACTIONS</span>
            <strong>{expenses.length}</strong>
            <small>Total records</small>
          </div>

          <div className="expense-mini-card">
            <span>CATEGORIES</span>
            <strong>{categoryTotals.length}</strong>
            <small>Spending categories</small>
          </div>
        </section>

        {/* ADD EXPENSE AND CATEGORY BREAKDOWN */}
        <section className="expense-content">
          <div className="expense-form-card">
            <div className="card-heading">
              <div>
                <span>NEW TRANSACTION</span>
                <h2>Add Expense</h2>
                <p>Record where your money went.</p>
              </div>

              <div className="form-symbol">+</div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Expense title</label>
                <input
                  type="text"
                  placeholder="e.g. Grocery shopping"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount</label>
                <div className="amount-input">
                  <span>₹</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills">Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="add-expense-button"
                disabled={adding}
              >
                {adding ? "Saving..." : "Add Expense →"}
              </button>
            </form>
          </div>

          {/* CATEGORY BREAKDOWN */}
          <div className="category-card">
            <div className="card-heading">
              <div>
                <span>BREAKDOWN</span>
                <h2>Spending by category</h2>
              </div>
            </div>

            {categoryTotals.length === 0 ? (
              <div className="category-empty">
                <div>₹</div>
                <p>
                  Add an expense to see your spending breakdown.
                </p>
              </div>
            ) : (
              <div className="category-items">
                {categoryTotals.map(([name, value], index) => {
                  const percentage =
                    totalExpenses > 0
                      ? (value / totalExpenses) * 100
                      : 0;

                  return (
                    <div className="category-item" key={name}>
                      <div className="category-top">
                        <div className="category-label">
                          <span
                            className={`category-color color-${index}`}
                          />
                          <span>{name}</span>
                        </div>

                        <strong>
                          ₹{value.toLocaleString("en-IN")}
                        </strong>
                      </div>

                      <div className="category-bar">
                        <div style={{ width: `${percentage}%` }} />
                      </div>

                      <small>
                        {Math.round(percentage)}% of total spending
                      </small>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* EXPENSE HISTORY */}
        <section className="transactions-card">
          <div className="transactions-heading">
            <div>
              <span>ACTIVITY</span>
              <h2>Expense history</h2>
            </div>

            <span className="record-count">
              {expenses.length} records
            </span>
          </div>

          {loading ? (
            <div className="expense-loading">
              <div className="loading-ring" />
              <p>Loading your expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="expense-empty">
              <div className="empty-icon">₹</div>
              <h3>No expenses yet</h3>
              <p>
                Your expense history will appear here after you
                add your first transaction.
              </p>
            </div>
          ) : (
            <div className="expense-list">
              {expenses
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.date) - new Date(a.date)
                )
                .map((expense) => (
                  <div className="expense-row" key={expense.id}>
                    <div className="expense-row-icon">↓</div>

                    {editingId === expense.id ? (
                      <div className="expense-edit-fields">
                        <input
                          type="text"
                          placeholder="Expense title"
                          aria-label="Expense title"
                          value={editTitle}
                          onChange={(e) =>
                            setEditTitle(e.target.value)
                          }
                        />

                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Amount"
                          aria-label="Amount"
                          value={editAmount}
                          onChange={(e) =>
                            setEditAmount(e.target.value)
                          }
                        />

                        <select
                          aria-label="Category"
                          value={editCategory}
                          onChange={(e) =>
                            setEditCategory(e.target.value)
                          }
                        >
                          <option value="">Select category</option>
                          <option value="Food">Food</option>
                          <option value="Travel">Travel</option>
                          <option value="Shopping">Shopping</option>
                          <option value="Bills">Bills</option>
                          <option value="Entertainment">
                            Entertainment
                          </option>
                          <option value="Health">Health</option>
                          <option value="Education">Education</option>
                          <option value="Other">Other</option>
                        </select>

                        <input
                          type="date"
                          aria-label="Date"
                          value={editDate}
                          onChange={(e) =>
                            setEditDate(e.target.value)
                          }
                        />

                        <div className="expense-edit-actions">
                          <button
                            type="button"
                            className="save-edit"
                            onClick={() =>
                              handleUpdateExpense(expense.id)
                            }
                            disabled={saving}
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>

                          <button
                            type="button"
                            className="cancel-edit"
                            onClick={cancelInlineEdit}
                            disabled={saving}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="expense-info">
                          <strong>{expense.title}</strong>
                          <span>
                            {expense.category} • {expense.date}
                          </span>
                        </div>

                        <div className="expense-row-amount">
                          -₹
                          {Number(
                            expense.amount || 0
                          ).toLocaleString("en-IN")}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleEdit(expense)}
                          disabled={
                            saving ||
                            adding ||
                            deletingId !== null
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-expense"
                          onClick={() => handleDelete(expense.id)}
                          disabled={
                            saving ||
                            adding ||
                            deletingId !== null
                          }
                        >
                          {deletingId === expense.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* MESSAGE */}
        {message && (
          <div className={`expense-message ${messageType}`}>
            <span>
              {messageType === "success" ? "✓" : "!"}
            </span>
            {message}
          </div>
        )}

        {/* BOTTOM SECTION */}
        <section className="expense-bottom">
          <div>
            <span>KEEP GOING</span>
            <h2>Every expense tells a story.</h2>
            <p>
              Stay aware of your spending and make every rupee
              count.
            </p>
          </div>

          <button onClick={() => navigate("/dashboard")}>
            Back to Overview <span>↗</span>
          </button>
        </section>
      </main>

      {/* PROFILE MODAL */}
      {showProfile && (
        <div
          className="profile-modal-overlay"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="profile-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="profile-modal-close"
              onClick={() => setShowProfile(false)}
            >
              ×
            </button>

            <Profile />
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;
