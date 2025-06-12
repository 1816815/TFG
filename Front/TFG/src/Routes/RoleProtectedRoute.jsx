import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useUser from "../hooks/useUser";
import { Outlet, useNavigate } from "react-router-dom";
import { useFlashRedirect } from "../hooks/useFlashRedirect";

/**
 * Restricts access to certain roles.
 * If user is not authenticated or lacks required role, redirects with flash message.
 */
const RoleProtectedRoute = ({ allowedRoles }) => {
  const { user } = useUser();
  const { navigateWithFlash } = useFlashRedirect();
  const [isReady, setIsReady] = useState(false);
  const accessToken = useSelector((state) => state.user.accessToken);
  const isLoggedIn = localStorage.getItem("accessToken");

  const navigate = useNavigate();

  useEffect(() => {
    let timer;

    // Simulate loading (e.g., waiting for user data to load)
    if (!isLoggedIn) {
      setIsReady(true);
      return;
    }

    if (user) {
      setIsReady(true);
      return;
    }

    if (accessToken && !user) {
      timer = setTimeout(() => {
        setIsReady(true);
      }, 1000);
    } else {
      timer = setTimeout(() => {
        setIsReady(true);
      }, 300);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user, accessToken, isLoggedIn]);

  // Redirections after readiness check
  useEffect(() => {
    if (!isReady) return;

    if (!isLoggedIn || !user) {
      navigateWithFlash("/login", "Debes iniciar sesión para acceder a esta sección.", "warning");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role?.name)) {
      navigateWithFlash("/", "No tienes permiso para acceder a esta sección.", "error");
    }
  }, [isReady, isLoggedIn, user, allowedRoles, navigateWithFlash]);

  if (!isReady || !isLoggedIn || !user || (allowedRoles && !allowedRoles.includes(user.role?.name))) {
    return null; // Esperamos a que el useEffect redirija
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
