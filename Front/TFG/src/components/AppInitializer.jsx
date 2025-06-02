import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import useUser from "../hooks/useUser";

const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  const accessToken = useSelector((state) => state.user.accessToken);
  const user = useSelector((state) => state.user.user);
  const isLoadingUser = useSelector((state) => state.user.isLoading);
  
  const { loadUserProfile, doRefreshToken } = useUser();
  
  const refreshIntervalRef = useRef(null);
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // Validating token
  const isTokenValid = useCallback((token) => {
    if (!token) return false;
    
    try {
      const payload = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp && (payload.exp - now) > 300;
    } catch (error) {
      console.error("Error al verificar token:", error);
      return false;
    }
  }, []);

  // Cleaning state
  const clearAuthState = useCallback(() => {
    localStorage.removeItem("isLoggedIn");

    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    dispatch({ type: 'user/clearUser' });
  }, [dispatch]);

  // Setting automatic refresh
  const setupTokenRefresh = useCallback(() => {
    if (!isLoggedIn || !accessToken) return;

    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    console.log("Configurando refresh automático");
    refreshIntervalRef.current = setInterval(async () => {
      try {
        console.log("Ejecutando refresh automático...");
        await doRefreshToken();
        console.log("Token refresh automático exitoso");
      } catch (error) {
        console.error("Error en refresh automático:", error);
        clearAuthState();
      }
    }, 15 * 60 * 1000);
  }, [isLoggedIn, accessToken, doRefreshToken, clearAuthState]);

  // Initialize
  useEffect(() => {
    if (initialized) return;

    const initializeApp = async () => {
      try {
        console.log("=== INICIALIZANDO APP ===");
        console.log("isLoggedIn:", isLoggedIn);
        console.log("accessToken en Redux:", !!accessToken);
        console.log("user en Redux:", !!user);
        
        setLoading(true);

        if (!isLoggedIn) {
          console.log("No hay sesión activa");
          setLoading(false);
          setInitialized(true);
          return;
        }

        // Refresh if current token is no longer valid
        let currentToken = accessToken;

        if (!currentToken || !isTokenValid(currentToken)) {
          console.log("Token inválido o inexistente, refrescando...");
          try {
            const refreshResult = await doRefreshToken();
            currentToken = refreshResult?.accessToken;
            console.log("Token refrescado exitosamente");
          } catch (error) {
            console.warn("No se pudo refrescar el token:", error.message);
            clearAuthState();
            setLoading(false);
            setInitialized(true);
            return;
          }
        } else {
          console.log("Token válido encontrado, saltando refresh");
          // Check if Redux has the token
          if (!accessToken && currentToken) {
            dispatch({ type: 'user/setTokens', payload: { accessToken: currentToken } });
          }
        }

        // Only load user if it is on Redux
        if (!user && currentToken) {
          console.log("Usuario no encontrado en Redux, cargando...");
          try {
            await loadUserProfile();
            console.log("Perfil cargado exitosamente");
          } catch (error) {
            console.warn("No se pudo cargar el perfil:", error.message);
            clearAuthState();
            setLoading(false);
            setInitialized(true);
            return;
          }
        } else if (user) {
          console.log("Usuario ya existe en Redux, saltando carga");
        }

        console.log("=== INICIALIZACIÓN COMPLETADA ===");

      } catch (error) {
        console.error("Error al inicializar app:", error);
        clearAuthState();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeApp();
  }, [initialized, isLoggedIn, accessToken, user, doRefreshToken, loadUserProfile, clearAuthState, isTokenValid, dispatch]);

  // Set up token refresh interval

  useEffect(() => {
    if (initialized && accessToken && isLoggedIn) {
      setupTokenRefresh();
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [initialized, accessToken, isLoggedIn, setupTokenRefresh]);

  // Logout listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "isLoggedIn" && e.newValue !== "true") {
        console.log("Logout detectado desde otra pestaña");
        clearAuthState();
        setInitialized(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [clearAuthState]);

  if (loading || isLoadingUser) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Cargando aplicación...</div>
      </div>
    );
  }

  return children;
};

export default AppInitializer;