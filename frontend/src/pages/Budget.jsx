import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Budget.css";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:8000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken")
  );
}

function Budget() {
  const navigate = useNavigate();

  const currentDate = new Date();

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [category, setCategory] = useState("");
  const [allocatedAmount, setAllocatedAmount] = useState("");

  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editAmount, setEditAmount] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const categories = [
    "Food",
    "Transport",
    "Entertainment",
    "Shopping",
    "Bills",
    "Healthcare",
    "Education",
    "Other",
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* =========================================
     ERROR MESSAGE HANDLER
  ========================================= */

  const getErrorMessage = (data, defaultMessage) => {
    if (!data) {
      return defaultMessage;
    }

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item && typeof item.msg === "string") {
            return item.msg;
          }

          return JSON.stringify(item);
        })
        .join(", ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return defaultMessage;
  };

  /* =========================================
     FETCH BUDGETS
  ========================================= */

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/budget/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Failed to fetch budgets.")
        );
      }

      if (Array.isArray(data)) {
        setBudgets(data);
      } else if (data && Array.isArray(data.budgets)) {
        setBudgets(data.budgets);
      } else {
        setBudgets([]);
      }
    } catch (err) {
      console.error("Fetch budgets error:", err);
      setError(err.message || "Unable to load budgets.");
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  /* =========================================
     CREATE BUDGET
  ========================================= */

  const handleCreateBudget = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (!allocatedAmount || Number(allocatedAmount) <= 0) {
      setError("Please enter a valid allocated amount.");
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/budget/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          month: Number(month),
          year: Number(year),
          category: category,
          allocated_amount: Number(allocatedAmount),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Failed to create budget.")
        );
      }

      setMessage("Budget created successfully!");

      setCategory("");
      setAllocatedAmount("");

      await fetchBudgets();
    } catch (err) {
      console.error("Create budget error:", err);
      setError(err.message || "Failed to create budget.");
    }
  };

  /* =========================================
     EDIT
  ========================================= */

  const handleEdit = (budget) => {
    setMessage("");
    setError("");

    setEditingBudgetId(budget.id);
    setEditAmount(budget.allocated_amount);
  };

  /* =========================================
     CANCEL EDIT
  ========================================= */

  const handleCancelEdit = () => {
    setEditingBudgetId(null);
    setEditAmount("");

    setMessage("");
    setError("");
  };

  /* =========================================
     UPDATE BUDGET
  ========================================= */

  const handleUpdateBudget = async (budgetId) => {
    setMessage("");
    setError("");

    if (!editAmount || Number(editAmount) <= 0) {
      setError("Please enter a valid allocated amount.");
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const currentBudget = budgets.find(
        (budget) => budget.id === budgetId
      );

      if (!currentBudget) {
        setError("Budget not found.");
        return;
      }

      const response = await fetch(
        `${API_URL}/budget/${budgetId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            month: Number(currentBudget.month),
            year: Number(currentBudget.year),
            category: currentBudget.category,
            allocated_amount: Number(editAmount),
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Failed to update budget.")
        );
      }

      setMessage("Budget updated successfully!");

      setEditingBudgetId(null);
      setEditAmount("");

      await fetchBudgets();
    } catch (err) {
      console.error("Update budget error:", err);
      setError(err.message || "Failed to update budget.");
    }
  };

  /* =========================================
     DELETE BUDGET
  ========================================= */

  const handleDeleteBudget = async (budgetId) => {
    setMessage("");
    setError("");

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/budget/${budgetId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Failed to delete budget.")
        );
      }

      setMessage("Budget deleted successfully!");

      await fetchBudgets();
    } catch (err) {
      console.error("Delete budget error:", err);
      setError(err.message || "Failed to delete budget.");
    }
  };

  /* =========================================
     HELPERS
  ========================================= */

  const getMonthName = (monthNumber) => {
    return months[Number(monthNumber) - 1] || "Unknown";
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN");
  };

  /* =========================================
     PAGE
  ========================================= */

  return (
    <div className="budget-page">

      {/* =====================================
          EXACT SAME DASHBOARD NAVBAR
      ===================================== */}

      <header className="dashboard-navbar">

        <div className="brand-area">

          <div className="brand-logo">
            BB
          </div>

          <div>
            <div className="brand-name">
              BudgetBuddy
            </div>

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

          <button
            className="nav-item active"
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

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="budget-content">

        {/* HERO */}

        <section className="budget-hero">

          <p className="budget-eyebrow">
            Budget Planning
          </p>

          <h1>
            Plan your spending.
          </h1>

          <p>
            Set monthly budgets and stay in control
            of your expenses.
          </p>

        </section>

        {/* =====================================
            CREATE BUDGET
        ===================================== */}

        <section className="create-budget-section">

          <div className="section-heading">

            <h2>
              Create Budget
            </h2>

            <p>
              Set a spending limit for a category.
            </p>

          </div>

          <form
            className="budget-form"
            onSubmit={handleCreateBudget}
          >

            {/* MONTH */}

            <div className="form-group">

              <label htmlFor="month">
                Month
              </label>

              <select
                id="month"
                value={month}
                onChange={(e) =>
                  setMonth(Number(e.target.value))
                }
              >
                {months.map(
                  (monthName, index) => (
                    <option
                      key={monthName}
                      value={index + 1}
                    >
                      {monthName}
                    </option>
                  )
                )}
              </select>

            </div>

            {/* YEAR */}

            <div className="form-group">

              <label htmlFor="year">
                Year
              </label>

              <input
                id="year"
                type="number"
                min="2020"
                max="2100"
                value={year}
                onChange={(e) =>
                  setYear(Number(e.target.value))
                }
              />

            </div>

            {/* CATEGORY */}

            <div className="form-group">

              <label htmlFor="category">
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              >

                <option value="">
                  Select category
                </option>

                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}

              </select>

            </div>

            {/* AMOUNT */}

            <div className="form-group">

              <label htmlFor="allocatedAmount">
                Allocated Amount
              </label>

              <div className="amount-input-wrapper">

                <span>
                  ₹
                </span>

                <input
                  id="allocatedAmount"
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  value={allocatedAmount}
                  onChange={(e) =>
                    setAllocatedAmount(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* CREATE */}

            <button
              type="submit"
              className="create-budget-button"
            >
              Create Budget
            </button>

          </form>

        </section>

        {/* SUCCESS */}

        {message && (
          <div className="budget-success-message">
            {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="budget-error-message">
            {error}
          </div>
        )}

        {/* =====================================
            MY BUDGETS
        ===================================== */}

        <section className="my-budgets-section">

          <div className="section-heading-row">

            <div>

              <h2>
                My Budgets
              </h2>

              <p>
                Manage your monthly spending limits.
              </p>

            </div>

            <span className="budget-count">

              {budgets.length}{" "}

              {budgets.length === 1
                ? "budget"
                : "budgets"}

            </span>

          </div>

          {/* LOADING */}

          {loading ? (

            <div className="budget-loading">
              Loading budgets...
            </div>

          ) : budgets.length === 0 ? (

            /* EMPTY */

            <div className="empty-budget">
              No budgets created yet.
            </div>

          ) : (

            /* GRID */

            <div className="budget-grid">

              {budgets.map((budget) => (

                <div
                  className="budget-card"
                  key={budget.id}
                >

                  {/* CARD HEADER */}

                  <div className="budget-card-top">

                    <div>

                      <h3>
                        {budget.category}
                      </h3>

                      <p>
                        {getMonthName(budget.month)}{" "}
                        {budget.year}
                      </p>

                    </div>

                  </div>

                  {/* =================================
                      EDIT MODE
                  ================================= */}

                  {editingBudgetId === budget.id ? (

                    <div className="budget-edit-area">

                      <label>
                        Allocated Amount
                      </label>

                      <div className="budget-input-wrapper">

                        <span>
                          ₹
                        </span>

                        <input
                          type="number"
                          min="1"
                          value={editAmount}
                          onChange={(e) =>
                            setEditAmount(
                              e.target.value
                            )
                          }
                          className="budget-edit-amount"
                        />

                      </div>

                      <div className="budget-card-actions">

                        <button
                          type="button"
                          className="update-budget-button"
                          onClick={() =>
                            handleUpdateBudget(
                              budget.id
                            )
                          }
                        >
                          Update
                        </button>

                        <button
                          type="button"
                          className="cancel-budget-button"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>

                      </div>

                    </div>

                  ) : (

                    /* =================================
                        NORMAL MODE
                    ================================= */

                    <>

                      <div className="budget-amount-label">
                        Allocated Amount
                      </div>

                      <div className="budget-amount">
                        ₹
                        {formatAmount(
                          budget.allocated_amount
                        )}
                      </div>

                      {/* PROGRESS */}

                      <div className="budget-progress">

                        <div className="budget-progress-header">

                          <span>
                            Spent
                          </span>

                          <span>
                            0%
                          </span>

                        </div>

                        <div className="budget-progress-bar">

                          <div
                            className="budget-progress-fill"
                            style={{
                              width: "0%",
                            }}
                          />

                        </div>

                      </div>

                      {/* ACTIONS */}

                      <div className="budget-card-actions">

                        <button
                          type="button"
                          className="edit-budget-button"
                          onClick={() =>
                            handleEdit(budget)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-budget-button"
                          onClick={() =>
                            handleDeleteBudget(
                              budget.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </>

                  )}

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Budget;