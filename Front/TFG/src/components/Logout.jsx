import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";


/**
 * Logs out the user if they are logged in, otherwise redirects to the login page.
 *
 * Checks if the user is logged in by looking for the "isLoggedIn" flag in localStorage.
 * If they are logged in, it calls the doLogout function to log them out.
 * If they are not logged in, it redirects them to the root page.
 *
 * Returns null.
 */
const Logout = () => {
  const { doLogout } = useAuth();
  const isLoggedIn = Boolean(localStorage.getItem("isLoggedIn"));
  if (isLoggedIn) {
    useEffect(() => {
      doLogout();
    }, [doLogout]);
  } else {
    const navigate = useNavigate();
    useEffect(() => {
      navigate("/");
    }, [navigate]);
  }

  return null;
};

export default Logout;
