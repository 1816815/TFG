import { jwtDecode } from "jwt-decode";
import apiClient from "./apiClient";

// Utility functions for token management
const getTokenFromStorage = () => {
  try {
    return localStorage.getItem('accessToken');
  } catch (error) {
    console.error('Error reading token from localStorage:', error);
    return null;
  }
};

const setTokenInStorage = (token) => {
  try {
    if (token) {
      console.log("Guardando token en localStorage:", typeof token === 'string' ? token.substring(0, 20) + "..." : token);
      localStorage.setItem('accessToken', token);
    } else {
      console.log("Eliminando token del localStorage - token recibido:", token);
      localStorage.removeItem('accessToken');
    }
  } catch (error) {
    console.error('Error saving token to localStorage:', error);
  }
};

const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const payload = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    
    // Token is valid if it has more than 5 minutes left (300 seconds)
    return payload.exp && (payload.exp - now) > 300;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
};

const clearAuthStorage = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('isLoggedIn');
};

export const userService = {
  // Authentication utilities
  getTokenFromStorage,
  setTokenInStorage,
  isTokenValid,
  clearAuthStorage,

  // API methods
  async login(credentials) {
    
    const data = await apiClient.post('/token', credentials);
    
    return data.access;
  },

  async refreshToken() {
    const data = await apiClient.post('/token/refresh');
    setTokenInStorage(data.access_token);
    return data.access_token;
  },

  async logout() {
    await apiClient.post('/logout');
    clearAuthStorage();
    return true;
  },

  async register({ username, email, password }) {
    await apiClient.post('/register', { username, email, password });
    return { success: true };
  },

  async getProfile() {
    return await apiClient.get('/users/my-profile');
  },

  async updateProfile(data) {
    return await apiClient.put('/users/my-profile', data);
  },
  async getAll() {
    return await apiClient.get('/admin/users/');
  },
async adminUpdate(id, data) {
  return await apiClient.put(`/admin/users/${id}/`, data);
},
async adminRegister(data) {
  return await apiClient.post('/admin/users/', data);
},
async adminToggleActive(id, action) {
  return await apiClient.post(`/admin/users/${id}/${action}/`);
},

async getRoles() {
  return await apiClient.get('/roles');
},

async activateUser(uid, token){
  return await apiClient.get(`/activate/${uid}/${token}/`);

},
async requestPasswordReset(email) {
  return await apiClient.post('/password-reset/', { email });
},

async resetPasswordConfirm(uid, token, password) {
  return await apiClient.post('/password-reset/confirm/', {
    uid,
    token,
    password,
  });
},
async changePassword(currentPassword, newPassword) {
  
  return await apiClient.post('/change-password/', {
    currentPassword,
    newPassword,
  });
},

async validatePassword(password) {
  return await apiClient.post('/password-validate/', {
    password,
  });
},

async initializeAuth() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    
    if (!isLoggedIn) {
      return { initialized: true, authenticated: false };
    }

    const storedToken = getTokenFromStorage();
    
    // If no token or invalid token, try to refresh
    if (!storedToken || !isTokenValid(storedToken)) {
      console.log("Token inválido o inexistente, intentando refresh...");
      
      try {
        const newToken = await this.refreshToken();
        return { 
          initialized: true, 
          authenticated: true, 
          accessToken: newToken 
        };
      } catch (error) {
        console.warn("No se pudo refrescar el token:", error);
        clearAuthStorage();
        return { initialized: true, authenticated: false };
      }
    }

    return { 
      initialized: true, 
      authenticated: true, 
      accessToken: storedToken 
    };
  }
};