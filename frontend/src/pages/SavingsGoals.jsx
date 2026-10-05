import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SavingsGoals.css";
import "./Dashboard.css";

const API = "http://127.0.0.1:8000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken")
  );
}

function SavingsGoals() {
  const navigate = useNavigate();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingGoal, setEditingGoal] = useState(null);
  const [editGoalName, setEditGoalName] = useState("");
  const [editTargetAmount, setEditTargetAmount] = useState("");
  const [editTargetDate, setEditTargetDate] = useState("");

  const [progressGoal, setProgressGoal] = useState(null);
  const [savedAmount, setSavedAmount] = useState("");

  const token = getToken();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const getErrorMessage = async (response) => {
    try {
      const data = await response.json();

      if (typeof data?.detail === "string") {
        return data.detail;
      }

      if (Array.isArray(data?.detail)) {
        return data.detail
          .map((item) => item?.msg || "Validation error")
          .join(", ");
      }

      return "Something went wrong.";
    } catch {
      return "Something went wrong.";
    }
  };

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/savings-goals/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();
      setGoals(data);
    } catch (err) {
      setError(err.message || "Failed to load savings goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/savings-goals/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          goal_name: goalName,
          target_amount: Number(targetAmount),
          target_date: targetDate,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setGoalName("");
      setTargetAmount("");
      setTargetDate("");

      setMessage("Savings goal created successfully!");
      await fetchGoals();
    } catch (err) {
      setError(err.message || "Failed to create savings goal.");
    }
  };

  const handleDelete = async (goalId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this savings goal?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/savings-goals/${goalId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setMessage("Savings goal deleted successfully!");
      await fetchGoals();
    } catch (err) {
      setError(err.message || "Failed to delete savings goal.");
    }
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setEditGoalName(goal.goal_name || "");
    setEditTargetAmount(goal.target_amount || "");
    setEditTargetDate(goal.target_date || "");
    setMessage("");
    setError("");
  };

  const closeEditModal = () => {
    setEditingGoal(null);
    setEditGoalName("");
    setEditTargetAmount("");
    setEditTargetDate("");
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();

    if (!editingGoal) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API}/savings-goals/${editingGoal.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            goal_name: editGoalName,
            target_amount: Number(editTargetAmount),
            target_date: editTargetDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      closeEditModal();

      setMessage("Savings goal updated successfully!");
      await fetchGoals();
    } catch (err) {
      setError(err.message || "Failed to update savings goal.");
    }
  };

  const openProgressModal = (goal) => {
    setProgressGoal(goal);
    setSavedAmount(goal.saved_amount || "");
    setMessage("");
    setError("");
  };

  const closeProgressModal = () => {
    setProgressGoal(null);
    setSavedAmount("");
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();

    if (!progressGoal) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API}/savings-goals/${progressGoal.id}/progress`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            saved_amount: Number(savedAmount),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      closeProgressModal();

      setMessage("Savings progress updated successfully!");
      await fetchGoals();
    } catch (err) {
      setError(err.message || "Failed to update progress.");
    }
  };

  const handleComplete = async (goalId) => {
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API}/savings-goals/${goalId}/complete`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setMessage("Savings goal marked as completed!");
      await fetchGoals();
    } catch (err) {
      setError(err.message || "Failed to complete goal.");
    }
  };

  const calculateProgress = (saved, target) => {
    if (!target || Number(target) <= 0) return 0;

    return Math.min(
      100,
      Math.round((Number(saved || 0) / Number(target)) * 100)
    );
  };

  return (
    <div className="savings-page">
      {/* ================= NAVBAR ================= */}
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
            className="nav-item active"
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

          <button className="logout-link" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="savings-main">
        <section className="savings-intro">
          <div className="section-label">SAVINGS GOALS</div>

          <h1>Plan your future with confidence.</h1>

          <p>
            Set savings goals, track your progress, and stay motivated
            toward what matters most.
          </p>
        </section>

        {/* ================= CREATE GOAL ================= */}
        <section className="dashboard-card create-goal-card">
          <div className="card-heading">
            <h2>Create a Savings Goal</h2>
            <p>Start planning for something important.</p>
          </div>

          <form className="goal-form" onSubmit={handleCreateGoal}>
            <div className="form-group">
              <label>Goal Name</label>
              <input
                type="text"
                placeholder="e.g. New Laptop"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Target Amount</label>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="₹25,000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="form-submit">
              Create Goal
            </button>
          </form>
        </section>

        {/* ================= MESSAGES ================= */}
        {message && <div className="success-message">{message}</div>}

        {error && <div className="error-message">{error}</div>}

        {/* ================= GOALS ================= */}
        <section className="goals-section">
          <div className="section-label">MY SAVINGS GOALS</div>

          {loading ? (
            <div className="loading-state">Loading savings goals...</div>
          ) : goals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◎</div>
              <h3>No savings goals yet</h3>
              <p>Create your first savings goal to start tracking.</p>
            </div>
          ) : (
            <div className="goals-grid">
              {goals.map((goal) => {
                const progress = calculateProgress(
                  goal.saved_amount,
                  goal.target_amount
                );

                return (
                  <div className="goal-card" key={goal.id}>
                    <div className="goal-card-top">
                      <div>
                        <h3>{goal.goal_name}</h3>

                        <p className="goal-date">
                          Target: {goal.target_date}
                        </p>
                      </div>

                      {goal.is_completed && (
                        <span className="completed-badge">
                          Completed
                        </span>
                      )}
                    </div>

                    <div className="goal-amount">
                      <strong>
                        ₹{Number(goal.saved_amount || 0).toLocaleString()}
                      </strong>

                      <span>
                        / ₹
                        {Number(goal.target_amount || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="progress-container">
                      <div className="progress-info">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>

                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="goal-actions">
                      <button
                        type="button"
                        onClick={() => openProgressModal(goal)}
                      >
                        Update Progress
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(goal)}
                      >
                        Edit
                      </button>

                      {!goal.is_completed && progress >= 100 && (
                        <button
                          type="button"
                          onClick={() => handleComplete(goal.id)}
                        >
                          Complete
                        </button>
                      )}

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDelete(goal.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ================= PLANNING CTA ================= */}
        <section className="planning-cta">
          <h2>Small steps. Big goals.</h2>
          <p>
            Keep saving consistently and turn your plans into reality.
          </p>
        </section>
      </main>

      {/* ================= EDIT MODAL ================= */}
      {editingGoal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Edit Savings Goal</h2>

              <button
                type="button"
                className="modal-close"
                onClick={closeEditModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateGoal}>
              <div className="form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  value={editGoalName}
                  onChange={(e) => setEditGoalName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Target Amount</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={editTargetAmount}
                  onChange={(e) =>
                    setEditTargetAmount(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Target Date</label>
                <input
                  type="date"
                  value={editTargetDate}
                  onChange={(e) =>
                    setEditTargetDate(e.target.value)
                  }
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit">Update Goal</button>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PROGRESS MODAL ================= */}
      {progressGoal && (
        <div className="modal-overlay" onClick={closeProgressModal}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Update Progress</h2>

              <button
                type="button"
                className="modal-close"
                onClick={closeProgressModal}
              >
                ×
              </button>
            </div>

            <p className="modal-description">
              Update the amount you have saved for{" "}
              <strong>{progressGoal.goal_name}</strong>.
            </p>

            <form onSubmit={handleUpdateProgress}>
              <div className="form-group">
                <label>Saved Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={savedAmount}
                  onChange={(e) => setSavedAmount(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit">
                  Update Progress
                </button>

                <button
                  type="button"
                  onClick={closeProgressModal}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavingsGoals;