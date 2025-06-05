import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser , logoutUser, registerUser } from '../redux/userSlice';

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
    const resultAction = await dispatch(loginUser(credentials));
    
    if (loginUser.fulfilled.match(resultAction)) {
      // Login succesful
      localStorage.setItem("isLoggedIn", true);
      return resultAction.payload; 
    } else {
      // Raise Exception
      const errorMessage = resultAction.payload?.detail || 
                          resultAction.payload?.non_field_errors?.[0] || 
                          resultAction.error?.message || 
                          'Error de login';
      throw new Error(errorMessage);
    }
  };

  /**
   * Asynchronously registers a user. Dispatches the registerUser action, 
   * and returns the action payload if successful, or throws an error if not.
   * @param {Object} userData - The user data, must have a "username", "email", and a "password" property.
   * @returns {Promise<any>} - Resolves with the action payload if successful, or throws an error if not.
   * @throws Will throw an error if the registration fails.
   */
  const register = async (userData) => {
    const resultAction = await dispatch(registerUser(userData));
    
    if (registerUser.fulfilled.match(resultAction)) {
      // Register succesful
      return resultAction.payload;
    } else {
      // Raise Exception
      const errorData = resultAction.payload;
      
      // Customize some common register errors

      let errorMessage = 'Error en el registro';
      
      if (typeof errorData === 'object' && errorData !== null) {
        if (errorData.username) {
          errorMessage = Array.isArray(errorData.username) 
            ? errorData.username[0] 
            : errorData.username;
        } else if (errorData.email) {
          errorMessage = Array.isArray(errorData.email) 
            ? errorData.email[0] 
            : errorData.email;
        } else if (errorData.password) {
          errorMessage = Array.isArray(errorData.password) 
            ? errorData.password[0] 
            : errorData.password;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors[0]
            : errorData.non_field_errors;
        }
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (resultAction.error?.message) {
        errorMessage = resultAction.error.message;
      }
      
      throw new Error(errorMessage);
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
        
        const errorMessage = resultAction.payload?.detail || 
                            resultAction.error?.message || 
                            'Error during logout';
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Logout fails on server, but proceed with client logout
      navigate("/");
      localStorage.removeItem("isLoggedIn");
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
    
  };
};
export default useAuth;
