import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const API_URL = "http://127.0.0.1:8000";

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
    fetchProfile();
  }, []);

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("authToken")
    );
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("authToken");
  };

  const fetchProfile = async () => {
    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
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
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load profile"
        );
      }

      setProfile(data);

      setName(data.name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
    } catch (error) {
      console.error("Profile error:", error);

      setMessage(
        error.message || "Unable to load profile"
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

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
        navigate("/login");
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
        navigate("/login");
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

      setMessage(
        error.message || "Something went wrong"
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="profile-page">

        <div className="profile-grid"></div>

        <div className="profile-loading">

          <div className="profile-loading-logo">
            BB
          </div>

          <p>Loading profile...</p>

        </div>

      </div>
    );
  }

  return (
    <div className="profile-page">

      <div className="profile-grid"></div>


      {/* HEADER */}

      <header className="profile-header">

        {/* BRAND */}

        <div
          className="profile-brand"
          onClick={() => navigate("/dashboard")}
        >

          <div className="profile-brand-icon">
            BB
          </div>

          <div className="profile-brand-text">

            <h2>
              BudgetBuddy
            </h2>

            <p>
              Money, made simple.
            </p>

          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="profile-nav">

          <button
            onClick={() => navigate("/dashboard")}
          >
            Overview
          </button>

          <button
            onClick={() => navigate("/income")}
          >
            Income
          </button>

          <button
            onClick={() => navigate("/expenses")}
          >
            Expenses
          </button>

          <button
            onClick={() => navigate("/budget")}
          >
            Budgets
          </button>

        </nav>


        {/* RIGHT SIDE */}

        <div className="profile-header-right">

          <button
            className="profile-small-avatar"
            onClick={() => navigate("/profile")}
            title="Profile"
          >
            {name
              ? name.charAt(0).toUpperCase()
              : "U"}
          </button>

          <button
            className="profile-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* MAIN */}

      <main className="profile-main">

        <div className="profile-card">

          {/* ICON */}

          <div className="profile-card-icon">
            BB
          </div>


          {/* TITLE */}

          <div className="profile-small-title">
            ACCOUNT SETTINGS
          </div>

          <h1>
            My Profile
          </h1>

          <p className="profile-subtitle">
            Manage your personal information
          </p>


          {/* MESSAGE */}

          {message && (
            <div
              className={`profile-message ${messageType}`}
            >

              <span>
                {messageType === "success"
                  ? "✓"
                  : "!"}
              </span>

              {message}

            </div>
          )}


          {/* FORM */}

          <form
            className="profile-form"
            onSubmit={handleSubmit}
          >

            {!editing ? (

              /* =========================
                 NORMAL MODE
              ========================= */

              <>

                <div className="profile-display">
                  <span>Name:</span>
                  {name || "Not added"}
                </div>

                <div className="profile-display">
                  <span>Email:</span>
                  {email || "Not added"}
                </div>

                <div className="profile-display">
                  <span>Phone:</span>
                  {phone || "Not added"}
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

              /* =========================
                 EDIT MODE
              ========================= */

              <>

                <div className="profile-field">

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your name"
                    required
                  />

                </div>


                <div className="profile-field">

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter your email"
                    required
                  />

                </div>


                <div className="profile-field">

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="Enter your phone number"
                  />

                </div>


                <div className="profile-actions">

                  <button
                    type="submit"
                    className="profile-save-button"
                    disabled={saving}
                  >

                    {saving
                      ? "Saving..."
                      : "Save Changes"}

                    <span>→</span>

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


          {/* BACK BUTTON */}

          <button
            className="profile-back"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>

        </div>

      </main>


      {/* FOOTER */}

      <p className="profile-footer">
        Smart planning • Better spending • Brighter future
      </p>

    </div>
  );
}

export default Profile;