import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useFlashRedirect } from "../hooks/useFlashRedirect";

/**
 * A component that protects routes from unauthorized access by checking if the user is logged in.
 * If not logged in, redirects to login with a flash message.
 */
const AuthProtectedRoute = () => {
  const isLoggedIn = localStorage.getItem("accessToken");
  const { navigateWithFlash } = useFlashRedirect();

  useEffect(() => {
    if (!isLoggedIn) {
      navigateWithFlash("/login", "Debes iniciar sesión para acceder a esta sección.", "warning");
    }
  }, [isLoggedIn, navigateWithFlash]);

  if (!isLoggedIn) {
    return null;
  }

  return <Outlet />;
};

export default AuthProtectedRoute;
