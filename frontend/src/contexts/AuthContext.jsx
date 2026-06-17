/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  registerUser,
  updateCurrentUser,
} from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setStatus("guest");
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setStatus("authenticated");
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
        setStatus("guest");
      }
    }

    loadUser();
  }, []);

  const login = useCallback(async (payload) => {
    const data = await loginUser(payload);
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);

    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (payload) => {
    await registerUser(payload);
    await login({
      username: payload.username,
      password: payload.password,
    });
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setStatus("guest");
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updatedUser = await updateCurrentUser(payload);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, status, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
