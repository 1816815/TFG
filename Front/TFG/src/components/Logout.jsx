import { useEffect } from "react";
import useAuth  from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useFlashRedirect } from "../hooks/useFlashRedirect";

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
  const { navigateWithFlash } = useFlashRedirect();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("isLoggedIn"));

  useEffect(() => {
    if (isLoggedIn) {
      doLogout();
    } else {
     navigateWithFlash("/", "Su sesión no estaba iniciada", "info")
    }
  }, [isLoggedIn, doLogout, navigate]);

  return null;
};

export default Logout;
