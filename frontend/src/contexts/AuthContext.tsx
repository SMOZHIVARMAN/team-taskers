import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi, userApi } from "@/services/api";

/* ===============================
   Types
================================ */

/* ✅ EXPORT User so other files can use it */
export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  skills?: string;
  jobTitle?: string;
  experience?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

/* ===============================
   Context Setup
================================ */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/* ===============================
   Auth Provider
================================ */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ===============================
     Restore auth on refresh
  ================================ */
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, []);

  /* ===============================
     Login
  ================================ */
  const login = async (username: string, password: string) => {
    // 🔹 Backend returns TOKEN STRING
    const response = await authApi.login({
      username,
      password,
    });

    const tokenFromApi: string = response.data;

    if (!tokenFromApi) {
      throw new Error("Login failed: token not returned");
    }

    // ✅ Save token
    localStorage.setItem("token", tokenFromApi);
    setToken(tokenFromApi);

    // ✅ Fetch user AFTER login
    try {
      const meRes = await userApi.getMe();
      setUser(meRes.data);
      localStorage.setItem("user", JSON.stringify(meRes.data));
    } catch {
      setUser(null);
    }
  };

  /* ===============================
     Register
  ================================ */
  const register = async (username: string, email: string, password: string) => {
    await authApi.register({ username, email, password });
  };

  /* ===============================
     Logout
  ================================ */
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("profileImage");

  setToken(null);
  setUser(null);

  // ✅ SIMPLE & SAFE REDIRECT
  window.location.href = "/login";
};

  /* ===============================
     Update User
  ================================ */
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  /* ===============================
     Refresh User
  ================================ */
  const refreshUser = async () => {
    try {
      const response = await userApi.getMe();
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
