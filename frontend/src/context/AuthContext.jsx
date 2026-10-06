import React, { createContext, useEffect, useState, useCallback } from "react";
import authApi from "../api/authApi";
import userApi from "../api/userApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore API logout failures
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  }, []);

  // Sync state on app mount or token change
  useEffect(() => {
    const initializeAuth = async () => {
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        try {
          const freshProfile = await userApi.getProfile();
          if (freshProfile) {
            setUser(freshProfile);
            localStorage.setItem("user", JSON.stringify(freshProfile));
          }
        } catch (err) {
          // If token is invalid (401 handled by interceptor), clear state
          if (err.response && err.response.status === 401) {
            logout();
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    initializeAuth();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    if (data && data.token) {
      setToken(data.token);
      localStorage.setItem("token", data.token);

      const userData = data.user || {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    }
    throw new Error("Invalid response from server");
  };

  const register = async (name, email, password) => {
    return await authApi.register({ name, email, password });
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === "ROLE_ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
