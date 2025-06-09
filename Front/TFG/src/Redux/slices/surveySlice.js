import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { surveyService } from '../../services/surveyService';

// Async Thunks
export const fetchSurveys = createAsyncThunk(
  'surveys/fetchSurveys',
  async (_, { rejectWithValue }) => {
    try {
      return await surveyService.getAll();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createSurvey = createAsyncThunk(
  'surveys/createSurvey',
  async (surveyData, { rejectWithValue }) => {
    try {
      return await surveyService.create(surveyData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSurvey = createAsyncThunk(
  'surveys/updateSurvey',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await surveyService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSurvey = createAsyncThunk(
  'surveys/deleteSurvey',
  async (id, { rejectWithValue }) => {
    try {
      await surveyService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSurveyById = createAsyncThunk(
  'surveys/fetchSurveyById',
  async (id, { rejectWithValue }) => {
    try {
      return await surveyService.getById(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  currentSurvey: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    hasNext: false,
  },
};

const surveySlice = createSlice({
  name: 'surveys',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSurvey: (state) => {
      state.currentSurvey = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Surveys
      .addCase(fetchSurveys.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveys.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || action.payload;
        if (action.payload.total !== undefined) {
          state.pagination.total = action.payload.total;
          state.pagination.hasNext = action.payload.has_next;
        }
      })
      .addCase(fetchSurveys.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Survey
      .addCase(createSurvey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSurvey.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createSurvey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Survey
      .addCase(updateSurvey.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentSurvey?.id === action.payload.id) {
          state.currentSurvey = action.payload;
        }
      })
      
      // Delete Survey
      .addCase(deleteSurvey.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.currentSurvey?.id === action.payload) {
          state.currentSurvey = null;
        }
      })
      
      // Fetch Survey By ID
      .addCase(fetchSurveyById.fulfilled, (state, action) => {
        state.currentSurvey = action.payload;
        state.loading = false;
        state.error = null;

      })
      .addCase(fetchSurveyById.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchSurveyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
  },
});

export const { clearError, clearCurrentSurvey, setPagination } = surveySlice.actions;
export default surveySlice.reducer;

