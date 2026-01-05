import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize token from localStorage directly to avoid flicker
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  
  // Initialize user synchronously to avoid redirect flicker on protected routes
  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        return JSON.parse(atob(storedToken.split(".")[1]));
      } catch (error) {
        console.error("Invalid token on init", error);
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload);
        localStorage.setItem("token", token);
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
