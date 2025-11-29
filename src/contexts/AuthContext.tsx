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
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        apiClient.setToken(storedToken);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
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
      localStorage.setItem("authUser", JSON.stringify(response.user));
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
      const response = await apiClient.register({
        username,
        email,
        password,
        role,
      });
      setToken(response.token);
      setUser(response.user);
      apiClient.setToken(response.token);
      localStorage.setItem("authUser", JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    apiClient.setToken(null);
    localStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
