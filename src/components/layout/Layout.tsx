import { useAuth } from "../../contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    try {
      signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "MANAGER":
        return "bg-blue-100 text-blue-800";
      case "DEVELOPER":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Project Management System
              </h1>
            </div>

            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                    <div className="bg-gray-100 p-2 rounded-full">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
};
