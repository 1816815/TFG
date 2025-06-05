import { useEffect, useRef } from "react";
import useUser from "../hooks/useUser";

const AppInitializer = ({ children }) => {
  const { loadUserProfile, doRefreshToken } = useUser();
  const refreshTimeout = useRef(null);

  // Decodifica el JWT y extrae el campo exp
  function decodeExpFromToken(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch {
      return null;
    }
  }

  async function initializeSession() {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) return;

    try {
      await loadUserProfile();
      localStorage.setItem("isLoggedIn", "true");

      const exp = decodeExpFromToken(accessToken);
      if (exp) {
        const now = Date.now();
        const timeout = exp - now - 30 * 1000; // Refrescar 30 segundos antes de expirar

        if (timeout > 0) {
          refreshTimeout.current = setTimeout(refreshTokenFlow, timeout);
        } else {
          await refreshTokenFlow(); // Si ya expiró o está por expirar, refrescar ya
        }
      }
    } catch (err) {
      console.error("Fallo al cargar perfil:", err.message);
      await refreshTokenFlow();
    }
  }

  async function refreshTokenFlow() {
    try {
      const newToken = await doRefreshToken();
      if (newToken?.accessToken) {
        localStorage.setItem("accessToken", newToken.accessToken);
        await initializeSession(); // Volver a configurar el nuevo timeout
      } else {
        localStorage.removeItem("isLoggedIn");
        console.warn("No se recibió un nuevo accessToken");
      }
    } catch (error) {
      console.error("Error al refrescar token:", error.message);
      localStorage.removeItem("isLoggedIn");
    }
  }

  useEffect(() => {
    initializeSession();

    return () => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    };
  }, []);

  return <>{children}</>;
};

export default AppInitializer;
