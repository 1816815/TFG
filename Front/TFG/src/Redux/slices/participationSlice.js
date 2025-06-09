import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { participationService } from '../../services/participationService';


export const fetchParticipations = createAsyncThunk(
  'participations/fetchParticipations',
  async ({ instanceId, params = {} }, { rejectWithValue }) => {
    try {
      return await participationService.getByInstance(instanceId, params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchParticipationResults = createAsyncThunk(
  'participations/fetchParticipationResults',
  async (participationId, { rejectWithValue }) => {
    try {
      return await participationService.getResults(participationId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteParticipation = createAsyncThunk(
  'participations/deleteParticipation',
  async ({ instanceId, participationId }, { rejectWithValue }) => {
    try {
      await participationService.delete(instanceId, participationId);
      return participationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const exportParticipationData = createAsyncThunk(
  'participations/exportParticipationData',
  async (instanceId, { rejectWithValue }) => {
    try {
      return await participationService.exportData(instanceId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  currentParticipation: null,
  exportData: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    hasNext: false,
  },
};

const participationSlice = createSlice({
  name: 'participations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentParticipation: (state) => {
      state.currentParticipation = null;
    },
    clearExportData: (state) => {
      state.exportData = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Participations
      .addCase(fetchParticipations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParticipations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || action.payload;
        if (action.payload.total !== undefined) {
          state.pagination = {
            ...state.pagination,
            total: action.payload.total,
            page: action.payload.page,
            pageSize: action.payload.page_size,
            hasNext: action.payload.has_next,
          };
        }
      })
      .addCase(fetchParticipations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Participation Results
      .addCase(fetchParticipationResults.fulfilled, (state, action) => {
        state.currentParticipation = action.payload;
      })
      
      // Delete Participation
      .addCase(deleteParticipation.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      
      // Export Data
      .addCase(exportParticipationData.fulfilled, (state, action) => {
        state.exportData = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearCurrentParticipation, 
  clearExportData, 
  setPagination 
} = participationSlice.actions;

export default participationSlice.reducer;