import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  Shield,
  Bell,
  Lock,
  Mail,
  AlertCircle,
} from "lucide-react";

export const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSignOut = () => {
    try {
      signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-900/20 text-red-300 border border-red-800";
      case "MANAGER":
        return "bg-blue-900/20 text-blue-300 border border-blue-800";
      case "DEVELOPER":
        return "bg-green-900/20 text-green-300 border border-green-800";
      default:
        return "bg-gray-900/20 text-gray-300 border border-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="opacity-70">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Account Section */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Account</h2>
            <p className="text-sm opacity-70">Your account information</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-soft rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  {user?.profile_photo_url ? (
                    <img
                      src={user.profile_photo_url}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-sm opacity-70">{user?.email}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                  user?.role || ""
                )}`}
              >
                {user?.role}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="w-full glass-soft rounded-lg p-4 flex items-center justify-between hover:glass transition-all"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 opacity-70" />
              <div className="text-left">
                <p className="font-medium">Edit Profile</p>
                <p className="text-sm opacity-70">
                  Update your profile information
                </p>
              </div>
            </div>
            <span className="opacity-50">›</span>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="w-full glass-soft rounded-lg p-4 flex items-center justify-between hover:glass transition-all"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 opacity-70" />
              <div className="text-left">
                <p className="font-medium">Change Password</p>
                <p className="text-sm opacity-70">Update your password</p>
              </div>
            </div>
            <span className="opacity-50">›</span>
          </button>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Preferences</h2>
            <p className="text-sm opacity-70">Customize your experience</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-soft rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 opacity-70" />
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm opacity-70">
                  Manage notification preferences
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand)]"></div>
            </label>
          </div>

          <div className="glass-soft rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 opacity-70" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm opacity-70">Receive email updates</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand)]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass rounded-xl p-6 space-y-4 border border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/10">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
            <p className="text-sm opacity-70">Irreversible actions</p>
          </div>
        </div>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full glass-soft rounded-lg p-4 flex items-center justify-between hover:bg-red-500/10 transition-all border border-red-500/20"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-red-400" />
            <div className="text-left">
              <p className="font-medium text-red-400">Sign Out</p>
              <p className="text-sm opacity-70">Sign out from your account</p>
            </div>
          </div>
          <span className="text-red-400">›</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="glass rounded-xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg bg-red-500/10">
                <LogOut className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Sign Out</h3>
                <p className="text-sm opacity-70">
                  Are you sure you want to sign out?
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
