import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import userApi from "../api/userApi";
import MyOrderPage from "./MyOrderPage";

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully 👋");
    navigate("/login");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const updated = await userApi.updateProfile({ name });
      updateUser(updated || { ...user, name });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <div className="flex-grow container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          {/* Left profile section */}
          <div className="w-full md:w-1/3 lg:w-1/4 shadow-sm rounded-lg p-6 bg-white border h-fit">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {user?.name || "User"}
            </h1>
            <p className="text-sm text-gray-600 mb-3">{user?.email || ""}</p>

            {user?.role && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full mb-6">
                Role: {user.role.replace("ROLE_", "")}
              </span>
            )}

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="mb-4">
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-black text-white py-1.5 rounded text-sm font-semibold hover:bg-gray-800 transition"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 border text-gray-700 py-1.5 rounded text-sm font-semibold hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => {
                  setName(user?.name || "");
                  setIsEditing(true);
                }}
                className="w-full border border-gray-300 text-gray-800 py-2 px-4 rounded mb-3 hover:bg-gray-50 transition text-sm font-semibold"
              >
                Edit Profile
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition font-semibold text-sm"
            >
              Logout
            </button>
          </div>

          {/* Right section - My Orders */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <MyOrderPage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
