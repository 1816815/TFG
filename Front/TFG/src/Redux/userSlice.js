import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL;

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

/**
 * Initialize authentication state from localStorage
 * Checks if there's a valid token and loads user profile if needed
 */
export const initializeAuth = createAsyncThunk(
  "user/initializeAuth",
  async (_, thunkAPI) => {
    try {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      
      if (!isLoggedIn) {
        return { initialized: true, authenticated: false };
      }

      const storedToken = getTokenFromStorage();
      
      // If no token or invalid token, try to refresh
      if (!storedToken || !isTokenValid(storedToken)) {
        console.log("Token inválido o inexistente, intentando refresh...");
        
        try {
          const refreshResult = await thunkAPI.dispatch(refreshToken()).unwrap();
          
          // Load user profile after successful token refresh
          await thunkAPI.dispatch(fetchUserProfile()).unwrap();
          
          return { 
            initialized: true, 
            authenticated: true, 
            accessToken: refreshResult 
          };
        } catch (error) {
          console.warn("No se pudo refrescar el token:", error);
          clearAuthStorage();
          return { initialized: true, authenticated: false };
        }
      }

      // Token is valid, check if we need to load user profile
      const state = thunkAPI.getState();
      if (!state.user.user) {
        try {
          await thunkAPI.dispatch(fetchUserProfile()).unwrap();
        } catch (error) {
          console.warn("No se pudo cargar el perfil:", error);
          clearAuthStorage();
          return { initialized: true, authenticated: false };
        }
      }

      return { 
        initialized: true, 
        authenticated: true, 
        accessToken: storedToken 
      };
      
    } catch (error) {
      console.error("Error initializing auth:", error);
      clearAuthStorage();
      return { initialized: true, authenticated: false };
    }
  }
);

/**
 * Fetch the current user's profile from the server.
 */
export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, thunkAPI) => {
    const res = await fetch(`${API_URL}/users/my-profile`, {
      credentials: "include",
    });

    if (!res.ok) {
      return thunkAPI.rejectWithValue("Error fetching profile");
    }

    const currentUser = await res.json();
    return currentUser;
  }
);

/**
 * Async thunk to update the current user's profile.
 */
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ id, data }, thunkAPI) => {
    const state = thunkAPI.getState();
    const token = state.user.accessToken;
    if (!token) return thunkAPI.rejectWithValue("No token");

    const res = await fetch(`${API_URL}/users/my-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      return thunkAPI.rejectWithValue(error.detail || "Error updating user");
    }
    const updatedUser = await res.json();
    return updatedUser;
  }
);

/**
 * Async thunk to login a user.
 */
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (credentials, thunkAPI) => {
    try {
      console.log("Enviando credenciales:", credentials);
      const res = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      console.log("Respuesta del servidor - status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.log("Error en respuesta:", errorData);
        return thunkAPI.rejectWithValue(errorData);
      }

      const data = await res.json();
      console.log("Datos recibidos del servidor:", data);
      console.log("access_token en respuesta:", data.access);
      
      // Load user profile after successful login
      await thunkAPI.dispatch(fetchUserProfile());

      return data.access;
    } catch (error) {
      console.error("Error en loginUser:", error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to refresh the access token.
 */
export const refreshToken = createAsyncThunk(
  "user/refreshToken",
  async (_, thunkAPI) => {
    const res = await fetch(`${API_URL}/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    
    if (!res.ok) {
      // Clear storage on refresh failure
      clearAuthStorage();
      return thunkAPI.rejectWithValue("No se pudo refrescar el token");
    }
    
    const data = await res.json();
    
    // Store new token in localStorage
    setTokenInStorage(data.access_token);

    
    return data.access_token;
  }
);

/**
 * Async thunk to logout a user.
 */
export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const error = await res.json();
        return thunkAPI.rejectWithValue(error.detail || 'Logout failed');
      }

      // Clear storage on successful logout
      clearAuthStorage();
      
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to register a user.
 */
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async ({ username, email, password }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(data.detail || 'Error al registrar');
      }

      return { success: true };
    } catch (error) {
      return thunkAPI.rejectWithValue('Error de red');
    }
  }
);

/**
 * The user slice of the Redux store.
 */
const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    accessToken: getTokenFromStorage(), // Initialize from localStorage
    isInitialized: false,
    isAuthenticated: false,
    status: "idle",
    refreshStatus: "idle",
    error: null,
    refreshError: null,
    registrationStatus: "idle",
    registrationError: null,
    logoutStatus: "idle",
    logoutError: null,
  },
  reducers: {
    setAccessToken(state, action) {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
      setTokenInStorage(action.payload);
      if (action.payload) {
        localStorage.setItem("isLoggedIn", "true");
      }
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.refreshStatus = "idle";
      state.error = null;
      state.refreshError = null;
      state.registrationStatus = "idle";
      state.registrationError = null;
      state.logoutStatus = "idle";
      state.logoutError = null;
      clearAuthStorage();
    },
    clearUser(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitialized = false;
      clearAuthStorage();
    },
    setTokens(state, action) {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = !!action.payload.accessToken;
      setTokenInStorage(action.payload.accessToken);
      if (action.payload.accessToken) {
        localStorage.setItem("isLoggedIn", "true");
      }
    }
  },
  extraReducers(builder) {
    builder
      // initializeAuth
      .addCase(initializeAuth.pending, (state) => {
        state.status = "loading";
        state.isInitialized = false;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isInitialized = action.payload.initialized;
        state.isAuthenticated = action.payload.authenticated;
        if (action.payload.accessToken) {
          state.accessToken = action.payload.accessToken;
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isInitialized = true;
        state.isAuthenticated = false;
      })

      // fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        // Don't clear authentication on profile fetch failure
        // The token might still be valid
      })

      // updateUser
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      // refreshToken
      .addCase(refreshToken.pending, (state) => {
        state.refreshStatus = "loading";
        state.refreshError = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.refreshStatus = "succeeded";
        state.accessToken = action.payload;
        state.refreshError = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.refreshStatus = "failed";
        state.refreshError = action.payload;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("Login exitoso, payload completo:", action.payload);
        console.log("Tipo del payload:", typeof action.payload);
        state.status = "succeeded";
        state.accessToken = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        // Ensure token is saved to localStorage
        setTokenInStorage(action.payload);
        localStorage.setItem("isLoggedIn", "true");
        console.log("Estado después del login - isAuthenticated:", true);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.registrationStatus = "loading";
        state.registrationError = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.registrationStatus = "succeeded";
        state.registrationError = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registrationStatus = "failed";
        state.registrationError = action.payload || action.error.message;
      })

      // logoutUser
      .addCase(logoutUser.pending, (state) => {
        state.logoutStatus = "loading";
        state.logoutError = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.logoutStatus = "succeeded";
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutStatus = "failed";
        state.logoutError = action.payload || action.error.message;
      });
  },
});

export const { setAccessToken, logout, clearUser, setTokens } = userSlice.actions;
export default userSlice.reducer;