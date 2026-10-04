
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Budget.css";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:8000";

function Budget() {
  const navigate = useNavigate();

  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("");
  const [allocatedAmount, setAllocatedAmount] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

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

  // FETCH BUDGETS
  const fetchBudgets = async () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/budget/`, {
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

      if (!response.ok) {
        throw new Error("Unable to load budgets");
      }

      const data = await response.json();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch budget error:", error);
      showMessage(
        error.message || "Unable to load budgets",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // ADD BUDGET
  const handleAddBudget = async (e) => {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!category.trim()) {
      showMessage("Please enter a category", "error");
      return;
    }

    if (
      !Number.isFinite(Number(allocatedAmount)) ||
      Number(allocatedAmount) <= 0
    ) {
      showMessage("Amount must be greater than 0", "error");
      return;
    }

    setSaving(true);

    const currentDate = new Date();

    try {
      const response = await fetch(`${API_URL}/budget/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          category: category.trim(),
          allocated_amount: Number(allocatedAmount),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        clearAuth();
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Failed to add budget");
      }

      showMessage("Budget added successfully!", "success");
      setCategory("");
      setAllocatedAmount("");

      await fetchBudgets();
    } catch (error) {
      console.error("Add budget error:", error);
      showMessage(
        error.message || "Failed to add budget",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // START EDITING
  const startEdit = (budget) => {
    setEditingId(budget.id);
    setEditCategory(budget.category || "");
    setEditAmount(String(budget.allocated_amount ?? ""));
    setMessage("");
  };

  // CANCEL EDITING
  const cancelEdit = () => {
    setEditingId(null);
    setEditCategory("");
    setEditAmount("");
  };

  // UPDATE BUDGET
  const handleUpdateBudget = async (budgetId) => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!editCategory.trim()) {
      showMessage("Please enter a category", "error");
      return;
    }

    if (
      !Number.isFinite(Number(editAmount)) ||
      Number(editAmount) <= 0
    ) {
      showMessage("Amount must be greater than 0", "error");
      return;
    }

    setSaving(true);

    const currentDate = new Date();

    try {
      const response = await fetch(
        `${API_URL}/budget/${budgetId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            category: editCategory.trim(),
            allocated_amount: Number(editAmount),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        clearAuth();
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update budget"
        );
      }

      showMessage("Budget updated successfully!", "success");
      cancelEdit();

      await fetchBudgets();
    } catch (error) {
      console.error("Update budget error:", error);
      showMessage(
        error.message || "Failed to update budget",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE BUDGET
  const handleDeleteBudget = async (budgetId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmDelete) return;

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setDeletingId(budgetId);

    try {
      const response = await fetch(
        `${API_URL}/budget/${budgetId}`,
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

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.detail || "Failed to delete budget"
        );
      }

      if (editingId === budgetId) {
        cancelEdit();
      }

      showMessage("Budget deleted successfully!", "success");
      await fetchBudgets();
    } catch (error) {
      console.error("Delete budget error:", error);
      showMessage(
        error.message || "Failed to delete budget",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // TOTAL BUDGET
  const totalBudget = useMemo(() => {
    return budgets.reduce(
      (sum, item) =>
        sum + Number(item.allocated_amount || 0),
      0
    );
  }, [budgets]);

  // LOGOUT
  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="budget-page">
      {/* SAME NAVBAR STRUCTURE AS DASHBOARD */}
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

          <button
            className="nav-item"
            onClick={() => navigate("/expenses")}
          >
            Expenses
          </button>

          <button className="nav-item active">
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

          <button
            className="logout-link"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="budget-container">
        <section className="budget-heading">
          <div>
            <span className="budget-eyebrow">
              PERSONAL FINANCE
            </span>

            <h1>
              Plan your
              <br />
              <span>budget.</span>
            </h1>

            <p>
              Set spending limits and manage your monthly budget
              with ease.
            </p>
          </div>

          <div className="total-budget-card">
            <span>Total Budget</span>

            <strong>
              ₹{totalBudget.toLocaleString("en-IN")}
            </strong>

            <small>
              {budgets.length}{" "}
              {budgets.length === 1 ? "category" : "categories"}
            </small>
          </div>
        </section>

        {/* ADD BUDGET */}
        <section className="budget-form-card">
          <div className="section-title">
            <div>
              <span>CREATE BUDGET</span>
              <h2>Add Budget</h2>
            </div>

            <div className="plus-icon">+</div>
          </div>

          <form onSubmit={handleAddBudget}>
            <div className="form-grid">
              <div className="form-group">
                <label>Category</label>

                <input
                  type="text"
                  placeholder="Food / Travel / Shopping"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Allocated Amount</label>

                <div className="input-with-symbol">
                  <span>₹</span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={allocatedAmount}
                    onChange={(e) =>
                      setAllocatedAmount(e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-bottom">
              <p>
                Set a realistic limit for each spending category.
              </p>

              <button
                type="submit"
                className="add-budget-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "＋ Add Budget"}
              </button>
            </div>
          </form>
        </section>

        {/* STATUS MESSAGE */}
        {message && (
          <div
            className={`budget-message ${
              messageType === "error"
                ? "message-error"
                : "message-success"
            }`}
          >
            <span>
              {messageType === "error" ? "!" : "✓"}
            </span>

            {message}
          </div>
        )}

        {/* BUDGET HISTORY */}
        <section className="budget-records">
          <div className="records-header">
            <div>
              <span>YOUR PLAN</span>
              <h2>Budget categories</h2>
            </div>

            <button onClick={() => navigate("/dashboard")}>
              ← Dashboard
            </button>
          </div>

          {loading ? (
            <div className="budget-empty">
              <div className="loading-small" />
              <p>Loading budgets...</p>
            </div>
          ) : budgets.length === 0 ? (
            <div className="budget-empty">
              <div className="empty-budget-icon">₹</div>
              <h3>No budgets yet</h3>
              <p>
                Add your first budget above and it will appear
                here.
              </p>
            </div>
          ) : (
            <div className="budget-list">
              {budgets.map((item) => (
                <div className="budget-row" key={item.id}>
                  <div className="budget-row-icon">₹</div>

                  {editingId === item.id ? (
                    <div className="budget-edit-area">
                      <input
                        type="text"
                        aria-label="Budget category"
                        value={editCategory}
                        onChange={(e) =>
                          setEditCategory(e.target.value)
                        }
                      />

                      <div className="edit-amount">
                        <span>₹</span>

                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          aria-label="Allocated amount"
                          value={editAmount}
                          onChange={(e) =>
                            setEditAmount(e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="budget-row-info">
                      <strong>
                        {item.category || "Budget"}
                      </strong>

                      <span>Monthly budget</span>
                    </div>
                  )}

                  {editingId === item.id ? (
                    <div className="budget-edit-actions">
                      <button
                        type="button"
                        className="save-edit"
                        onClick={() =>
                          handleUpdateBudget(item.id)
                        }
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>

                      <button
                        type="button"
                        className="cancel-edit"
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="budget-row-amount">
                        ₹
                        {Number(
                          item.allocated_amount || 0
                        ).toLocaleString("en-IN")}
                      </div>

                      <div className="budget-row-actions">
                        <button
                          type="button"
                          className="edit-budget"
                          onClick={() => startEdit(item)}
                          disabled={deletingId !== null}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-budget"
                          onClick={() =>
                            handleDeleteBudget(item.id)
                          }
                          disabled={deletingId !== null}
                        >
                          {deletingId === item.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BOTTOM SECTION */}
        <section className="budget-cta">
          <div>
            <span>STAY ON TRACK</span>

            <h2>Give every rupee a purpose.</h2>

            <p>
              Head back to your dashboard to see your overall
              financial progress.
            </p>
          </div>

          <button onClick={() => navigate("/dashboard")}>
            View Dashboard →
          </button>
        </section>
      </main>
    </div>
  );
}

export default Budget;
