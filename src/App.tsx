import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/layout/Layout";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ManagerDashboard } from "./components/manager/ManagerDashboard";
import { DeveloperDashboard } from "./components/developer/DeveloperDashboard";
import { HomePage } from "./components/HomePage";

function AppContent() {
  const { user, loading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showHome, setShowHome] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show homepage first always
  if (showHome) {
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

  if (!user) {
    return isLoginMode ? (
      <Login onToggleMode={() => setIsLoginMode(false)} />
    ) : (
      <Register onToggleMode={() => setIsLoginMode(true)} />
    );
  }

  return (
    <Layout>
      {user.role === "ADMIN" && <AdminDashboard />}
      {user.role === "MANAGER" && <ManagerDashboard />}
      {user.role === "DEVELOPER" && <DeveloperDashboard />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
