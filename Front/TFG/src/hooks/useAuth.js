import { useContext } from "react";
import { AuthContext } from "../components/AuthProvider";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const {
    accessToken,
    setAccessToken,
    logout: contextLogout,
    API_URL,
  } = useContext(AuthContext);

  const isAuthenticated = !!accessToken;

  const user = (() => {
    if (!accessToken) return null;
    try {
      return jwtDecode(accessToken);
    } catch {
      return null;
    }
  })();

  const hasRole = (role) => {
    return user?.rol === role || user?.roles?.includes?.(role);
  };

  const login = async ({ username, password }) => {
    try {
      const res = await fetch(`${API_URL}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setAccessToken(data.access);
        localStorage.setItem("isLoggedIn", true); // Save session
        return { success: true };
      } else {
        return {
          success: false,
          error: data.detail || "Credenciales incorrectas",
        };
      }
    } catch (error) {
      return { success: false, error: "Error de red" };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("isLoggedIn"); // Clean session
      await contextLogout();
    } catch (e) {
      console.warn("Error cerrando sesión", e);
    }
  };

  const register = async ({ username, email, password }) => {
    try {
      const res = await fetch(`${API_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.detail || "Error al registrar" };
      }
    } catch (error) {
      return { success: false, error: "Error de red" };
    }
  };

  return {
    accessToken,
    isAuthenticated,
    user,
    hasRole,
    login,
    logout,
    register,
    API_URL
  };
};

export default useAuth;
