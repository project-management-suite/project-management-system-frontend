import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ManagerDashboard } from "./components/manager/ManagerDashboard";
import { DeveloperDashboard } from "./components/developer/DeveloperDashboard";
import { HomePage } from "./components/HomePage";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { UserManagement } from "./components/admin/UserManagement";
import { ProjectManagement } from "./components/admin/ProjectManagement";
import { TaskManagement } from "./components/admin/TaskManagement";
import { FileSharingHub } from "./components/files/FileSharingHub";
import { CalendarView } from "./components/calendar/Calendar";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function AppContent() {
  const { user, loading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showHome, setShowHome] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen dark app-dark flex items-center justify-center">
        <div className="glass rounded-xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-12 h-12 border-4 border-white/10 border-t-[var(--brand)] rounded-full"></div>
            <div className="text-lg opacity-70">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show homepage first always
  if (showHome && !user) {
    return (
      <HomePage
        user={user}
        onEnter={() => setShowHome(false)}
        onLogin={() => {
          setShowHome(false);
          setIsLoginMode(true);
        }}
        onRegister={() => {
          setShowHome(false);
          setIsLoginMode(false);
        }}
      />
    );
  }

  // Show login/register if not authenticated
  if (!user) {
    return isLoginMode ? (
      <Login onToggleMode={() => setIsLoginMode(false)} />
    ) : (
      <Register onToggleMode={() => setIsLoginMode(true)} />
    );
  }

  // Authenticated users - use routing
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            {user.role === "ADMIN" && <AdminDashboard />}
            {user.role === "MANAGER" && <ManagerDashboard />}
            {user.role === "DEVELOPER" && <DeveloperDashboard />}
          </DashboardLayout>
        }
      />

      {/* Admin Routes */}
      {user.role === "ADMIN" && (
        <>
          <Route
            path="/admin/users"
            element={
              <DashboardLayout>
                <UserManagement />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <DashboardLayout>
                <ProjectManagement />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <DashboardLayout>
                <TaskManagement />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <DashboardLayout>
                <div className="glass rounded-xl p-8 text-center">
                  <h2 className="text-2xl font-bold mb-2">System Settings</h2>
                  <p className="opacity-70">Coming soon...</p>
                </div>
              </DashboardLayout>
            }
          />
        </>
      )}

      {/* Manager Routes */}
      {(user.role === "ADMIN" || user.role === "MANAGER") && (
        <Route
          path="/manager/projects"
          element={
            <DashboardLayout>
              <ProjectManagement />
            </DashboardLayout>
          }
        />
      )}

      {/* File Sharing Route - Available to all authenticated users */}
      <Route
        path="/file-sharing"
        element={
          <DashboardLayout>
            <FileSharingHub />
          </DashboardLayout>
        }
      />

      {/* Calendar Route - Available to all authenticated users */}
      <Route
        path="/calendar"
        element={
          <DashboardLayout>
            <CalendarView />
          </DashboardLayout>
        }
      />

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
