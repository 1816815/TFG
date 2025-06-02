import { useSelector, useDispatch } from "react-redux";
import { fetchUserProfile, updateUser, refreshToken } from "../redux/userSlice";
import { jwtDecode } from "jwt-decode";

const useUser = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const accessToken = useSelector((state) => state.user.accessToken);
  
  let userId = null;
  if (accessToken) {
    try {        
      const decoded = jwtDecode(accessToken);
      userId = decoded.user_id;
    } catch (e) {
      console.error("Error decoding token", e);
    }
  }

  const loadUserProfile = async () => {
    if (!accessToken) {
      throw new Error("No hay token de acceso disponible");
    }

    const resultAction = await dispatch(fetchUserProfile());
    
    if (fetchUserProfile.fulfilled.match(resultAction)) {
      return resultAction.payload;
    } else {
      const errorMessage = resultAction.payload?.detail || 
                          resultAction.payload?.message ||
                          resultAction.error?.message || 
                          'Error al cargar el perfil del usuario';
      throw new Error(errorMessage);
    }
  };

  const doUpdateUser = async (id, data) => {
    if (!id) {
      throw new Error("ID de usuario requerido");
    }
    
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Datos de actualización requeridos");
    }

    const resultAction = await dispatch(updateUser({ id, data }));
    
    if (updateUser.fulfilled.match(resultAction)) {
      return resultAction.payload;
    } else {
      const errorData = resultAction.payload;
      
      let errorMessage = 'Error al actualizar el usuario';
      
      if (typeof errorData === 'object' && errorData !== null) {
        
        if (errorData.email) {
          errorMessage = Array.isArray(errorData.email) 
            ? errorData.email[0] 
            : errorData.email;
        } else if (errorData.username) {
          errorMessage = Array.isArray(errorData.username) 
            ? errorData.username[0] 
            : errorData.username;
        } else if (errorData.first_name) {
          errorMessage = Array.isArray(errorData.first_name) 
            ? errorData.first_name[0] 
            : errorData.first_name;
        } else if (errorData.last_name) {
          errorMessage = Array.isArray(errorData.last_name) 
            ? errorData.last_name[0] 
            : errorData.last_name;
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

  const doRefreshToken = async () => {
    const resultAction = await dispatch(refreshToken());
    
    if (refreshToken.fulfilled.match(resultAction)) {
      return resultAction.payload;
    } else {
      const errorMessage = resultAction.payload?.detail || 
                          resultAction.payload?.message ||
                          resultAction.error?.message || 
                          'Error al renovar el token';
      throw new Error(errorMessage);
    }
  };

  // Helper to validate expiring time
  const isTokenExpiringSoon = (minutesThreshold = 5) => {
    if (!accessToken) return true;
    
    try {
      const decoded = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;
      const minutesUntilExpiry = timeUntilExpiry / 60;
      
      return minutesUntilExpiry <= minutesThreshold;
    } catch (e) {
      console.error("Error checking token expiry", e);
      return true;
    }
  };

  // Function to automatically update token if needed
  const refreshTokenIfNeeded = async () => {
    if (isTokenExpiringSoon()) {
      return await doRefreshToken();
    }
    return accessToken;
  };

  return {
    user,
    userId,
    accessToken,
    loadUserProfile,
    doUpdateUser,
    doRefreshToken,
    isTokenExpiringSoon,
    refreshTokenIfNeeded
  };
};

export default useUser;
