import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { apiClient, User } from "../lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    username: string,
    role: "ADMIN" | "MANAGER" | "DEVELOPER"
  ) => Promise<void>;
  signOut: () => void;
  setUserFromOTP: (token: string, user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        apiClient.setToken(storedToken);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      setToken(response.token);
      setUser(response.user);
      apiClient.setToken(response.token);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    username: string,
    role: "ADMIN" | "MANAGER" | "DEVELOPER"
  ) => {
    try {
      // Registration with OTP verification
      const response = await apiClient.register({
        username,
        email,
        password,
        role,
      });

      // If registration returns a token (email already verified), set user data
      if ((response as any).token) {
        const authResponse = response as any;
        setToken(authResponse.token);
        setUser(authResponse.user);
        apiClient.setToken(authResponse.token);
        localStorage.setItem("token", authResponse.token);
        localStorage.setItem("user", JSON.stringify(authResponse.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    apiClient.setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const setUserFromOTP = (authToken: string, userData: User) => {
    setToken(authToken);
    setUser(userData);
    apiClient.setToken(authToken);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const refreshUser = async () => {
    try {
      if (!token) return;
      const response = await apiClient.get("/profile");
      if (response.profile) {
        const updatedUser = {
          user_id: response.profile.user_id,
          id: response.profile.user_id,
          username: response.profile.username,
          email: response.profile.email,
          role: response.profile.role,
          email_verified: response.profile.email_verified,
          profile_photo_url: response.profile.profile_photo_url,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signUp,
        signOut,
        setUserFromOTP,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
