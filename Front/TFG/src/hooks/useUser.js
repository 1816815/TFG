import { useDispatch, useSelector } from "react-redux";
import { 
  fetchUserProfile, 
  updateUser, 
  loginUser, 
  refreshToken, 
  logoutUser, 
  registerUser,
  initializeAuth 
} from "../redux/userSlice";

/**
 * Custom hook for user-related operations
 * Provides simplified access to user authentication and profile management
 */
const useUser = () => {
  const dispatch = useDispatch();
  
  const {
    user,
    accessToken,
    isInitialized,
    isAuthenticated,
    status,
    refreshStatus,
    error,
    refreshError,
    registrationStatus,
    registrationError,
    logoutStatus,
    logoutError,
  } = useSelector((state) => state.user);

  // Derived states for easier usage
  const isLoading = status === "loading";
  const isRefreshing = refreshStatus === "loading";
  const isRegistering = registrationStatus === "loading";
  const isLoggingOut = logoutStatus === "loading";

  // Initialize authentication
  const initAuth = async () => {
    try {
      const result = await dispatch(initializeAuth()).unwrap();
      return result;
    } catch (error) {
      console.error("Error initializing auth:", error);
      throw error;
    }
  };

  // Load user profile
  const loadUserProfile = async () => {
    try {
      const result = await dispatch(fetchUserProfile()).unwrap();
      return result;
    } catch (error) {
      console.error("Error loading user profile:", error);
      throw error;
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      return result;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  // Refresh access token
  const doRefreshToken = async () => {
    try {
      const result = await dispatch(refreshToken()).unwrap();
      return { accessToken: result };
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (id, data) => {
    try {
      const result = await dispatch(updateUser({ id, data })).unwrap();
      return result;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      const result = await dispatch(logoutUser()).unwrap();
      return result;
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

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

  return {
    // State
    user,
    accessToken,
    isInitialized,
    isAuthenticated,
    isLoading,
    isRefreshing,
    isRegistering,
    isLoggingOut,
    error,
    refreshError,
    registrationError,
    logoutError,
    
    // Actions
    initAuth,
    loadUserProfile,
    login,
    logout,
    register,
    updateUserProfile,
    doRefreshToken,
  };
};

export default useUser;