import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Notifications.css";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:8000";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const fetchNotifications = useCallback(async () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/notifications/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        setError("Session expired. Please login again.");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load notifications.");
      }

      const data = await response.json();

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ================= MARK SINGLE NOTIFICATION AS READ =================

  const markAsRead = async (id) => {
    try {
      setUpdating(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || "Unable to update notification."
        );
      }

      await fetchNotifications();
    } catch (err) {
      setError(err.message || "Unable to update notification.");
    } finally {
      setUpdating(false);
    }
  };

  // ================= MARK ALL NOTIFICATIONS AS READ =================

  const markAllAsRead = async () => {
    try {
      setUpdating(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const unreadNotifications = notifications.filter(
        (notification) => !notification.is_read
      );

      for (const notification of unreadNotifications) {
        const response = await fetch(
          `${API_URL}/notifications/${notification.id}/read`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.detail || "Unable to update notifications."
          );
        }
      }

      await fetchNotifications();
    } catch (err) {
      setError(
        err.message || "Unable to update notifications."
      );
    } finally {
      setUpdating(false);
    }
  };

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  return (
    <div className="notifications-page">

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

          <button className="nav-item active">
            Notifications

            {unreadCount > 0 && (
              <span className="nav-notification-count">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
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

      {/* ================= MAIN CONTENT ================= */}

      <main className="notifications-content">

        {/* ================= HEADING ================= */}

        <section className="notifications-heading">

          <div>

            <p className="notifications-eyebrow">
              STAY UPDATED
            </p>

            <h1>
              Notifications<span>.</span>
            </h1>

            <p className="notifications-subtitle">
              Stay informed about your budget activity and updates.
            </p>

          </div>

          <div className="notification-count">

            <span>
              {unreadCount}
            </span>

            <small>
              Unread
            </small>

          </div>

        </section>

        {/* ================= TOOLBAR ================= */}

        <section className="notification-toolbar">

          <div>

            <p className="section-label">
              YOUR ACTIVITY
            </p>

            <h2>
              Your notifications
            </h2>

            <p className="notification-total">
              {notifications.length} notification
              {notifications.length !== 1 ? "s" : ""}
            </p>

          </div>

          <button
            className="notification-action"
            onClick={markAllAsRead}
            disabled={updating || unreadCount === 0}
          >
            {updating
              ? "Updating..."
              : "Mark all as read"}
          </button>

        </section>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="notification-error">

            <span>
              {error}
            </span>

            <button
              onClick={() => {
                if (error.includes("Session expired")) {
                  navigate("/login");
                } else {
                  fetchNotifications();
                }
              }}
            >
              {error.includes("Session expired")
                ? "Login"
                : "Try again"}
            </button>

          </div>
        )}

        {/* ================= NOTIFICATIONS LIST ================= */}

        <section className="notification-list">

          {loading ? (

            <div className="notification-empty">

              <div className="notification-loader" />

              <h3>
                Loading notifications...
              </h3>

              <p>
                Please wait a moment.
              </p>

            </div>

          ) : notifications.length === 0 && !error ? (

            <div className="notification-empty">

              <div className="notification-empty-icon">
                ✓
              </div>

              <h3>
                You're all caught up!
              </h3>

              <p>
                No notifications yet.
              </p>

            </div>

          ) : (

            notifications.map((item) => (

              <article
                key={item.id}
                className={`notification-card ${
                  item.is_read
                    ? "notification-read"
                    : "notification-unread"
                }`}
              >

                <div
                  className={`notification-icon ${
                    item.is_read
                      ? "read-icon"
                      : "unread-icon"
                  }`}
                >
                  {item.is_read ? "✓" : "!"}
                </div>

                <div className="notification-details">

                  <div className="notification-title-row">

                    <h3>
                      {item.title ||
                        "BudgetBuddy Notification"}
                    </h3>

                    {!item.is_read && (
                      <span className="unread-dot" />
                    )}

                  </div>

                  <p>
                    {item.message}
                  </p>

                  <div className="notification-meta">

                    <span>
                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleString("en-IN")
                        : ""}
                    </span>

                    {item.is_read && (
                      <span className="read-label">
                        ✓ Read
                      </span>
                    )}

                  </div>

                </div>

                {!item.is_read && (

                  <button
                    className="mark-read-button"
                    onClick={() =>
                      markAsRead(item.id)
                    }
                    disabled={updating}
                  >
                    Mark as read
                  </button>

                )}

              </article>

            ))

          )}

        </section>

        {/* ================= FOOTER ================= */}

        <footer className="notifications-footer">

          <span className="footer-status-dot" />

          BudgetBuddy · Your finances, organized.

        </footer>

      </main>

    </div>
  );
}

export default Notifications;