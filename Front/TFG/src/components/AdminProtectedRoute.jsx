import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useUser from "../hooks/useUser";
import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = ({ allowedRoles }) => {
  const { user } = useUser();
  const [isReady, setIsReady] = useState(false);
  const accessToken = useSelector((state) => state.user.accessToken);
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  useEffect(() => {
    let timer;

    // Handling delays in order to check the user logged in
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

  // Loader
  if (!isReady) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  // Debug and redirect for not logged in
  if (!isLoggedIn || !user) {
        console.log("No has iniciado sesión");

    return <Navigate to="/login" replace />;
  }

  // Debug and redirect for not being admin
  if (allowedRoles && !allowedRoles.includes(user.role?.name)) {
    console.log("No tienes permisos para admin");
    
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;