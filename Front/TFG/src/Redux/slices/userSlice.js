import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from '../../services/userService';

// Async Thunks
export const initializeAuth = createAsyncThunk(
  "user/initializeAuth",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const result = await userService.initializeAuth();
      
      // If authenticated, try to load user profile
      if (result.authenticated) {
        try {
          await dispatch(fetchUserProfile()).unwrap();
        } catch (error) {
          console.warn("No se pudo cargar el perfil:", error);
          userService.clearAuthStorage();
          return { initialized: true, authenticated: false };
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error initializing auth:", error);
      userService.clearAuthStorage();
      return rejectWithValue(error);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getProfile();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (data, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.user.accessToken;
      
      if (!token) {
        throw new Error("No token available");
      }
      
      return await userService.updateProfile(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const activateUser = createAsyncThunk(
  "user/activateUser",
  async ({ uid, token }, { rejectWithValue }) => {
    try {
      return await userService.activateUser(uid, token);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
)

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const accessToken = await userService.login(credentials);
      
      // Load user profile after successful login
      await dispatch(fetchUserProfile()).unwrap();
      
      return accessToken;
    } catch (error) {
      console.error("Error en loginUser:", error);
      return rejectWithValue(error);
    }
  }
);

export const refreshToken = createAsyncThunk(
  "user/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      return await userService.refreshToken();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.logout();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      return await userService.register({ username, email, password });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getAll();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
)

export const adminUpdateUser= createAsyncThunk(
  'user/adminUpdateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await userService.adminUpdate(id, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
)

export const adminRegisterUser = createAsyncThunk(
  'user/adminRegister',
  async (data, { rejectWithValue }) => {
    try {
      return await userService.adminRegister(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
)

export const adminToggleActive = createAsyncThunk(
  'user/adminToggleActive',
  async ({ id, action }, { rejectWithValue }) => {
    try {      
      return await userService.adminToggleActive(id, action);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
)

export const adminGetRoles = createAsyncThunk(
  'user/adminGetRoles',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getRoles();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
)

export const requireChangePassword = createAsyncThunk(
  'user/changePassword',
  async (email, { rejectWithValue }) => {
    try {
      return await userService.requestPasswordReset(email);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
)

export const confirmChangePassword = createAsyncThunk(
  'user/confirmChangePassword',
  async ({ uid, token, password }, { rejectWithValue }) => {
    try {
      console.log("uid:", uid, "token:", token, "password:", password);
      return await userService.resetPasswordConfirm(uid, token, password);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {      
      return await userService.changePassword(currentPassword, newPassword);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const passwordValidation = createAsyncThunk(
  'user/passwordValidation',
  async (password, { rejectWithValue }) => {
    try {      
      return await userService.validatePassword(password);
    } catch (error) {
      return rejectWithValue(error.errors || ['Error al validar la contraseña.']);
    }
  }
);

// Initial state
const initialState = {
  user: null,
  users: [],
  accessToken: userService.getTokenFromStorage(),
  isInitialized: false,
  isAuthenticated: false,
  
  // Loading states
  loading: false,
  initLoading: false,
  profileLoading: false,
  updateLoading: false,
  loginLoading: false,
  refreshLoading: false,
  logoutLoading: false,
  registerLoading: false,
  
  // Error states
  error: null,
  initError: null,
  profileError: null,
  updateError: null,
  loginError: null,
  refreshError: null,
  logoutError: null,
  registerError: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
    clearInitError: (state) => {
      state.initError = null;
    },
    clearProfileError: (state) => {
      state.profileError = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
    clearLoginError: (state) => {
      state.loginError = null;
    },
    clearRefreshError: (state) => {
      state.refreshError = null;
    },
    clearLogoutError: (state) => {
      state.logoutError = null;
    },
    clearRegisterError: (state) => {
      state.registerError = null;
    },
    
    // Token management
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
      userService.setTokenInStorage(action.payload);
      if (action.payload) {
        localStorage.setItem("isLoggedIn", "true");
      }
    },
    
    // Logout/Clear user
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      userService.clearAuthStorage();
    },
    
    clearUser: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitialized = false;
      userService.clearAuthStorage();
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.initLoading = true;
        state.initError = null;
        state.isInitialized = false;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.initLoading = false;
        state.isInitialized = action.payload.initialized;
        state.isAuthenticated = action.payload.authenticated;
        if (action.payload.accessToken) {
          state.accessToken = action.payload.accessToken;
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.initLoading = false;
        state.initError = action.payload;
        state.isInitialized = true;
        state.isAuthenticated = false;
      })

      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })

      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.accessToken = action.payload;
        state.isAuthenticated = true;
        userService.setTokenInStorage(action.payload);
        localStorage.setItem("isLoggedIn", "true");
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError = action.payload;
      })

      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.refreshLoading = true;
        state.refreshError = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.refreshLoading = false;
        state.accessToken = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.refreshLoading = false;
        state.refreshError = action.payload;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })

      // Logout User
      .addCase(logoutUser.pending, (state) => {
        state.logoutLoading = true;
        state.logoutError = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.logoutLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutLoading = false;
        state.logoutError = action.payload;
      })

      // Register User
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.registerLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError = action.payload;
      })

      //Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //Admin Update
      .addCase(adminUpdateUser.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(adminUpdateUser.fulfilled, (state) => {
        state.updateLoading = false;
      })
      .addCase(adminUpdateUser.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })

      // Admin Register User
      .addCase(adminRegisterUser.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
      })
      .addCase(adminRegisterUser.fulfilled, (state) => {
        state.registerLoading = false;
      })
      .addCase(adminRegisterUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError = action.payload;
      })

      // Toggle Active
      .addCase(adminToggleActive.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(adminToggleActive.fulfilled, (state) => {
        state.updateLoading = false;
      })
      .addCase(adminToggleActive.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // Get Roles
      .addCase(adminGetRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGetRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(adminGetRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

  },
});

export const { 
  clearError, 
  clearInitError, 
  clearProfileError, 
  clearUpdateError, 
  clearLoginError, 
  clearRefreshError, 
  clearLogoutError, 
  clearRegisterError,
  setAccessToken, 
  logout, 
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;