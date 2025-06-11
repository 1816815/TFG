import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  logoutUser,
  registerUser,
  activateUser,
  requireChangePassword,
  confirmChangePassword,
  changePassword,
  passwordValidation
} from "../Redux/slices/userSlice";

/**
 * useAuth hook provides authentication functionality for the app.
 *
 * It uses `loginUser` and `logoutUser` actions from the userSlice to handle user authentication.
 *
 * The hook provides the following properties:
 * - user: The authenticated user.
 * - accessToken: The access token of the authenticated user.
 * - status: The status of the user authentication.
 * - isAuthenticated: A boolean indicating if the user is authenticated or not.
 * - login: A function to log in the user. Takes the user credentials as argument and returns a promise that resolves with the access token if successful, or throws an error if not.
 * - register: A function to register a user. Takes the user data as argument and returns a promise that resolves with the action payload if successful, or throws an error if not.
 * - doLogout: A function to log out the user. Returns a promise that resolves with the action payload if successful, or throws an error if not.
 *
 * @returns {Object} - An object containing the properties mentioned above.
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const { user, accessToken, status } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const isAuthenticated = Boolean(localStorage.getItem("isLoggedIn"));

  /**
   * Asynchronously logs in a user. Dispatches the loginUser action,
   * stores the "isLoggedIn" flag in localStorage, and returns the action payload if successful,
   * or throws an error if not.
   * @param {Object} credentials - The user credentials, must have a "username" and a "password" property.
   * @returns {Promise<string>} - Resolves with the action payload (the access token) if successful, or throws an error if not.
   * @throws Will throw an error if the login fails.
   */
  const login = async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      return result;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  /**
   * Asynchronously registers a user. Dispatches the registerUser action,
   * and returns the action payload if successful, or throws an error if not.
   * @param {Object} userData - The user data, must have a "username", "email", and a "password" property.
   * @returns {Promise<any>} - Resolves with the action payload if successful, or throws an error if not.
   * @throws Will throw an error if the registration fails.
   */
  // Register user
  const register = async (credentials) => {
    try {
      const result = await dispatch(registerUser(credentials)).unwrap();
      return result;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  };

  const activateProfile = async (uid, token) => {
    try {
      const result = await dispatch(activateUser({ uid, token })).unwrap();
      return result;
    } catch (error) {
      console.error("Error activating user:", error);
      throw error;
    }
  };

  /**
   * Asynchronously logs out the user. Dispatches the logoutUser action,
   * navigates to the home page, and removes the isLoggedIn flag from localStorage.
   * @returns {Promise<any>} - Resolves with the action payload if successful, or throws an error if not.
   * @throws Will throw an error if the logout fails.
   */
  const doLogout = async () => {
    try {
      const resultAction = await dispatch(logoutUser());

      if (logoutUser.fulfilled.match(resultAction)) {
        // Logout successful
        navigate("/");
        localStorage.removeItem("isLoggedIn");
        return resultAction.payload;
      } else {
        // Logout fails on server, but proceed with client logout
        navigate("/");
        localStorage.removeItem("isLoggedIn");

        const errorMessage =
          resultAction.payload?.detail ||
          resultAction.error?.message ||
          "Error during logout";
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Logout fails on server, but proceed with client logout
      navigate("/");
      localStorage.removeItem("isLoggedIn");
      throw error;
    }
  };

  const requestNewPassword = async (email) => {
    try {
      return dispatch(requireChangePassword(email));
    } catch (error) {
      throw error;
    }
  };

  const confirmNewPassword = async (uid, token, password) => {
    try {
      return dispatch(confirmChangePassword({ uid, token, password }));
    } catch (error) {
      throw error;
    }
  };
  const editPassword = async ({ currentPassword, newPassword }) => {
    try {
      return dispatch(
        changePassword({ currentPassword, newPassword })
      ).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const validatePassword = async (password) => {
    try {
      return dispatch(passwordValidation(password)).unwrap();
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    accessToken,
    status,
    isAuthenticated,
    login,
    register,
    doLogout,
    activateProfile,
    editPassword,
    requestNewPassword,
    confirmNewPassword,
    validatePassword
  };
};
export default useAuth;
