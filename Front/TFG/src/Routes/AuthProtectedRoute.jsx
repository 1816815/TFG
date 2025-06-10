import { Navigate, Outlet } from "react-router-dom";


/**
 * A component that protects routes from unauthorized access by checking if the user is logged in.
 *
 * @returns {JSX.Element} - If the user is logged in, renders the nested routes. Otherwise, redirects to the login page.
 *
 * The component checks the user's login status using localStorage. If the user is not logged in,
 * it redirects to the login page. If the user is logged in, it renders the nested routes using Outlet.
 */

const AuthProtectedRoute = () => {
  const isLoggedIn = localStorage.getItem("accessToken");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthProtectedRoute;
