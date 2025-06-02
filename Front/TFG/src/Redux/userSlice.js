import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL;

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

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (credentials, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        return thunkAPI.rejectWithValue(errorData);
      }

      const data = await res.json();
      thunkAPI.dispatch(setAccessToken(data.access));
      await thunkAPI.dispatch(fetchUserProfile());

      return data.access;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// refreshToken thunk sin dependencia de Redux state
export const refreshToken = createAsyncThunk(
  "user/refreshToken",
  async (_, thunkAPI) => {
    const res = await fetch(`${API_URL}/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Necessary in order to send the cookie
    });
    if (!res.ok) {
      return thunkAPI.rejectWithValue("No se pudo refrescar el token");
    }
    const data = await res.json();
    return data.access; // access token nuevo
  }
);

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

      
      thunkAPI.dispatch(logout());
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

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
  
const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    accessToken: null,
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
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.status = "idle";
      state.refreshStatus = "idle";
      state.error = null;
      state.refreshError = null;
      state.registrationStatus = "idle";
      state.registrationError = null;
      state.logoutStatus = "idle";
      state.logoutError = null;
    },
  },
  extraReducers(builder) {
    builder
      // fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
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
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accessToken = action.payload;
        state.error = null;
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
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutStatus = "failed";
        state.logoutError = action.payload || action.error.message;
      });
  },
});


export const { setAccessToken, logout } = userSlice.actions;
export default userSlice.reducer;
