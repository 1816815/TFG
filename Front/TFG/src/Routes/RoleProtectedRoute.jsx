import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useUser from "../hooks/useUser";
import { Navigate, Outlet } from "react-router-dom";

/**
 * A component that restricts access based on user roles and authentication status.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.allowedRoles - An array of roles that are permitted to access the route.
 *
 * @returns {JSX.Element} - A component that either renders the nested routes or redirects to a login page if the user is not authenticated or does not have the required role.
 *
 * The component checks the user's authentication status and role to determine access.
 * If the user is not logged in, it redirects to the login page.
 * If the user does not have the required role, it redirects to the home page.
 * Displays a loading screen while determining the access status.
 */

const RoleProtectedRoute = ({ allowedRoles }) => {
  const { user } = useUser();
  const [isReady, setIsReady] = useState(false);
  const accessToken = useSelector((state) => state.user.accessToken);
  const isLoggedIn = localStorage.getItem("accessToken");

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

export default RoleProtectedRoute;