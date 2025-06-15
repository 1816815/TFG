import { useDispatch, useSelector } from "react-redux";
import { 
  fetchUserProfile, 
  fetchUsers,
  updateUser,
  adminUpdateUser,
  adminRegisterUser,
  adminToggleActive,
  adminGetRoles,
  loginUser, 
  refreshToken, 
  logoutUser, 
  registerUser,
  initializeAuth,
  clearError,
  clearInitError,
  clearProfileError,
  clearUpdateError,
  clearLoginError,
  clearRefreshError,
  clearLogoutError,
  clearRegisterError,
  
} from "../Redux/slices/userSlice";

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
    
    // Loading states
    loading,
    initLoading,
    profileLoading,
    updateLoading,
    loginLoading,
    refreshLoading,
    logoutLoading,
    registerLoading,
    
    // Error states
    error,
    initError,
    profileError,
    updateError,
    loginError,
    refreshError,
    logoutError,
    registerError,
  } = useSelector((state) => state.user);

  // Derived states for easier usage and backward compatibility
  const isLoading = loading || loginLoading || profileLoading;
  const isRefreshing = refreshLoading;
  const isRegistering = registerLoading;
  const isLoggingOut = logoutLoading;
  const isUpdating = updateLoading;
  const isInitializing = initLoading;

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

  // Update user profile - simplified signature (no need for id)
  const updateUserProfile = async (data) => {
    try {
      
      const result = await dispatch(updateUser(data)).unwrap();
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

  const getAllUsers = async () => {
    try {
      const result = dispatch(fetchUsers()).unwrap();
      return result;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };
  const adminUpdate = async (id, data) => {
    try {
      const result = await dispatch(adminUpdateUser({ id, data })).unwrap();
      return result;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };
  const adminRegister = async (data) => {
    try {
      const result = await dispatch(adminRegisterUser(data)).unwrap();
      return result;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  };

  const adminToggle = async (id, action) => {
    try {
      
      const result = await dispatch(adminToggleActive({ id, action })).unwrap();
      return result;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const listRoles = async () => {
    try {
      const result = await dispatch(adminGetRoles()).unwrap();
      return result;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  };



  // Error clearing functions
  const clearErrors = {
    clearError: () => dispatch(clearError()),
    clearInitError: () => dispatch(clearInitError()),
    clearProfileError: () => dispatch(clearProfileError()),
    clearUpdateError: () => dispatch(clearUpdateError()),
    clearLoginError: () => dispatch(clearLoginError()),
    clearRefreshError: () => dispatch(clearRefreshError()),
    clearLogoutError: () => dispatch(clearLogoutError()),
    clearRegisterError: () => dispatch(clearRegisterError()),
  };

  return {
    // State
    user,
    accessToken,
    isInitialized,
    isAuthenticated,
    
    // Loading states (granular)
    loading,
    initLoading,
    profileLoading,
    updateLoading,
    loginLoading,
    refreshLoading,
    logoutLoading,
    registerLoading,
    
    // Loading states (derived for convenience)
    isLoading,
    isRefreshing,
    isRegistering,
    isLoggingOut,
    isUpdating,
    isInitializing,
    
    // Error states (granular)
    error,
    initError,
    profileError,
    updateError,
    loginError,
    refreshError,
    logoutError,
    registerError,
    
    // Actions
    initAuth,
    loadUserProfile,
    login,
    logout,
    register,
    adminUpdate,
    adminRegister,
    adminToggle,
    updateUserProfile,
    doRefreshToken,
    getAllUsers,
    listRoles,
    
    // Error clearing
    ...clearErrors,
  };
};

export default useUser;