import { useAuth } from "../../contexts/AuthContext";
import {
  LogOut,
  User,
  LayoutDashboard,
  Users,
  FolderKanban,
  Menu,
  X,
  Share2,
  Calendar,
  UserCircle,
  Settings,
  BarChart3,
} from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import mainIco from "../../assets/icons/main-ico.svg";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  icon: any;
  label: string;
  path: string;
  roles: string[];
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Refresh user data on mount to ensure profile photo is loaded
  useEffect(() => {
    if (user && !user.profile_photo_url) {
      refreshUser();
    }
  }, []);

  const handleSignOut = () => {
    try {
      signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navigationItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
      roles: ["ADMIN", "MANAGER", "DEVELOPER"],
    },
    {
      icon: BarChart3,
      label: "Analytics",
      path: "/manager/analytics",
      roles: ["ADMIN", "MANAGER"],
    },
    {
      icon: Calendar,
      label: "Calendar",
      path: "/calendar",
      roles: ["ADMIN", "MANAGER", "DEVELOPER"],
    },
    {
      icon: Users,
      label: "User Management",
      path: "/admin/users",
      roles: ["ADMIN"],
    },
    {
      icon: FolderKanban,
      label: "Projects",
      path: "/admin/projects",
      roles: ["ADMIN"],
    },
    {
      icon: Share2,
      label: "File Sharing",
      path: "/file-sharing",
      roles: ["ADMIN", "MANAGER", "DEVELOPER"],
    },
    {
      icon: UserCircle,
      label: "Profile",
      path: "/profile",
      roles: ["ADMIN", "MANAGER", "DEVELOPER"],
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings",
      roles: ["ADMIN", "MANAGER", "DEVELOPER"],
    },
  ];

  const filteredNavItems = navigationItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

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

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen dark app-dark">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen glass border-r border-white/10 transition-all duration-300 z-40 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/10 flex-shrink-0">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg">
              <img src={mainIco} alt="Neutral logo" className="w-5 h-5" />
            </div>
            {isSidebarOpen && (
              <span className="font-semibold text-lg">Neutral</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {filteredNavItems.map((item) => {
            const isActive = isActivePath(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive ? "glass border border-white/20" : "hover:glass-soft"
                }`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <item.icon
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: isActive ? "var(--brand)" : "inherit" }}
                />
                {isSidebarOpen && (
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "opacity-100" : "opacity-70"
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={() => navigate("/profile")}
            className="w-full glass rounded-lg p-3 hover:border-[var(--brand)] hover:border transition-all text-left cursor-pointer"
            title="View Profile"
          >
            {isSidebarOpen ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    {user?.profile_photo_url ? (
                      <img
                        src={user.profile_photo_url}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user?.username}
                    </p>
                    <p className="text-xs opacity-70 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      user?.role || ""
                    )}`}
                  >
                    {user?.role}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  {user?.profile_photo_url ? (
                    <img
                      src={user.profile_photo_url}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 neo-icon w-6 h-6 flex items-center justify-center rounded-full hover:opacity-80 transition"
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? (
            <span className="text-xs">‹</span>
          ) : (
            <span className="text-xs">›</span>
          )}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-screen w-64 glass border-r border-white/10 animate-slide-in-left flex flex-col">
            <div className="p-5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  navigate("/dashboard");
                  setIsMobileMenuOpen(false);
                }}
              >
                <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg">
                  <img src={mainIco} alt="Neutral logo" className="w-5 h-5" />
                </div>
                <span className="font-semibold text-lg">Neutral</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="neo-icon w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-80 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {filteredNavItems.map((item) => {
                const isActive = isActivePath(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "glass border border-white/20"
                        : "hover:glass-soft"
                    }`}
                  >
                    <item.icon
                      className="w-5 h-5"
                      style={{ color: isActive ? "var(--brand)" : "inherit" }}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isActive ? "opacity-100" : "opacity-70"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/10 flex-shrink-0">
              <button
                onClick={() => {
                  navigate("/profile");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full glass rounded-lg p-3 hover:border-[var(--brand)] hover:border transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    {user?.profile_photo_url ? (
                      <img
                        src={user.profile_photo_url}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate">
                      {user?.username}
                    </p>
                    <p className="text-xs opacity-70 truncate">{user?.email}</p>
                  </div>
                </div>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:pl-64" : "lg:pl-20"
        }`}
      >
        {/* Header */}
        <header className="glass border-b border-white/10 sticky top-0 z-30 backdrop-blur-lg">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden neo-icon w-10 h-10 flex items-center justify-center rounded-lg hover:opacity-80 transition"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl font-semibold">
                {filteredNavItems.find((item) => isActivePath(item.path))
                  ?.label || "Dashboard"}
              </h1>
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                  user?.role || ""
                )}`}
              >
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content - This scrolls independently */}
        <main className="p-6">{children}</main>
      </div>

      <style>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        /* Custom Scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Firefox */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
      `}</style>
    </div>
  );
};
