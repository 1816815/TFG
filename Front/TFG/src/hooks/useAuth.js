import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser , logoutUser, registerUser } from '../redux/userSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, accessToken, status } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const isAuthenticated = Boolean(localStorage.getItem("isLoggedIn"));

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

  const doLogout = async () => {
    try {
      const resultAction = await dispatch(logoutUser());
      
      if (logoutUser.fulfilled.match(resultAction)) {
        // Logout succesful
        navigate("/");
        localStorage.removeItem("isLoggedIn");
        return resultAction.payload;
      } else {
        // Logout fails in server, but we dispose in client anyway
        navigate("/");
        localStorage.removeItem("isLoggedIn");
        
        const errorMessage = resultAction.payload?.detail || 
                            resultAction.error?.message || 
                            'Error durante el logout';
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Logout fails in server, but we dispose in client anyway
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
