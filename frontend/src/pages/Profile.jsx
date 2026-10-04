
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./Profile.css";

const API_URL = "http://127.0.0.1:8000";

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

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const token = getToken();

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const response = await fetch(`${API_URL}/profile/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          clearAuth();
          navigate("/login", { replace: true });
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load profile"
          );
        }

        if (cancelled) return;

        setProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
      } catch (error) {
        if (cancelled) return;

        console.error("Profile error:", error);
        setMessage(error.message || "Unable to load profile");
        setMessageType("error");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleEdit = () => {
    setMessage("");
    setEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
    }

    setEditing(false);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const token = getToken();

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await fetch(`${API_URL}/profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      if (response.status === 401) {
        clearAuth();
        navigate("/login", { replace: true });
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update profile"
        );
      }

      setProfile(data);
      setName(data.name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");

      setEditing(false);
      setMessage("Profile updated successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Update profile error:", error);
      setMessage(error.message || "Something went wrong");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-grid" />

        <div className="profile-loading">
          <div className="profile-loading-logo">BB</div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-grid" />

      {/* DASHBOARD NAVBAR */}

      <header className="dashboard-navbar">
        {/* BRAND */}

        <div
          className="brand-area"
          onClick={() => navigate("/dashboard")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              navigate("/dashboard");
            }
          }}
        >
          <div className="brand-logo">BB</div>

          <div>
            <div className="brand-name">BudgetBuddy</div>
            <div className="brand-tagline">
              Money, made simple.
            </div>
          </div>
        </div>

        {/* NAVIGATION */}

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
            className="nav-item"
            onClick={() => navigate("/reports")}
          >
            Reports
          </button>
        </nav>

        {/* RIGHT SIDE */}

        <div className="nav-right">
          <button
            className="profile-circle"
            onClick={() => navigate("/profile")}
            title="Open Profile"
            aria-label="Open Profile"
          >
            {name ? name.charAt(0).toUpperCase() : "BB"}
          </button>

          <button
            className="logout-link"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* CENTERED PROFILE DETAILS */}

      <main className="profile-main">
        <section className="profile-card">
          {/* KEEP ORIGINAL BB LOGO */}

          <div className="profile-card-icon">BB</div>

          {/* TITLE */}

          <div className="profile-small-title">
            ACCOUNT SETTINGS
          </div>

          <h1>My Profile</h1>

          <p className="profile-subtitle">
            Manage your personal information
          </p>

          {/* SUCCESS / ERROR MESSAGE */}

          {message && (
            <div
              className={`profile-message ${messageType}`}
              role="status"
            >
              <span>
                {messageType === "success" ? "✓" : "!"}
              </span>

              {message}
            </div>
          )}

          {/* PROFILE FORM */}

          <form
            className="profile-form"
            onSubmit={handleSubmit}
          >
            {!editing ? (
              <>
                <div className="profile-display">
                  <span>Name:</span>
                  <div>{name || "Not added"}</div>
                </div>

                <div className="profile-display">
                  <span>Email:</span>
                  <div>{email || "Not added"}</div>
                </div>

                <div className="profile-display">
                  <span>Phone:</span>
                  <div>{phone || "Not added"}</div>
                </div>

                <button
                  type="button"
                  className="profile-edit-button"
                  onClick={handleEdit}
                >
                  Edit Profile
                  <span>→</span>
                </button>
              </>
            ) : (
              <>
                <div className="profile-field">
                  <label htmlFor="profile-name">Name</label>

                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-email">Email</label>

                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-phone">Phone</label>

                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="profile-actions">
                  <button
                    type="submit"
                    className="profile-save-button"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                    {!saving && <span>→</span>}
                  </button>

                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </form>

          {/* BACK TO DASHBOARD */}

          <button
            className="profile-back"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </section>
      </main>

      {/* FOOTER */}

      <p className="profile-footer">
        Smart planning • Better spending • Brighter future
      </p>
    </div>
  );
}

export default Profile;
