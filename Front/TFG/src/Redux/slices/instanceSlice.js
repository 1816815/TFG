import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instanceService } from '../../services/instanceService';

// Async Thunks
export const fetchInstances = createAsyncThunk(
  'instances/fetchInstances',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await instanceService.getAll(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInstanceById = createAsyncThunk(
  'instances/fetchInstanceById',
  async (id, { rejectWithValue }) => {
    try {
      return await instanceService.getById(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createInstance = createAsyncThunk(
  'instances/createInstance',
  async (instanceData, { rejectWithValue }) => {
    try {
      return await instanceService.create(instanceData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateInstance = createAsyncThunk(
  'instances/updateInstance',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await instanceService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateInstanceState = createAsyncThunk(
  'instances/updateInstanceState',
  async ({ id, state, closureDate }, { rejectWithValue }) => {
    try {
      return await instanceService.updateState(id, state, closureDate);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const duplicateInstance = createAsyncThunk(
  'instances/duplicateInstance',
  async (id, { rejectWithValue }) => {
    try {
      return await instanceService.duplicate(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const closeInstance = createAsyncThunk(
  'instances/closeInstance',
  async (id, { rejectWithValue }) => {
    try {
      const result = await instanceService.close(id);
      return { id, ...result };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reopenInstance = createAsyncThunk(
  'instances/reopenInstance',
  async (id, { rejectWithValue }) => {
    try {
      const result = await instanceService.reopen(id);
      return { id, ...result };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInstanceStatistics = createAsyncThunk(
  'instances/fetchInstanceStatistics',
  async (id, { rejectWithValue }) => {
    try {
      return await instanceService.getStatistics(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInstanceConfiguration = createAsyncThunk(
  'instances/fetchInstanceConfiguration',
  async (id, { rejectWithValue }) => {
    try {
      return await instanceService.getConfiguration(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInstanceQuestions = createAsyncThunk(
  'instances/fetchInstanceQuestions',
  async (id, { rejectWithValue }) => {
    try {
      return await instanceService.getQuestions(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPublicUrl = createAsyncThunk(
  'instances/fetchPublicUrl',
  async (id, { rejectWithValue }) => {
    try {
      return await instanceService.getPublicUrl(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInstancesBySurvey = createAsyncThunk(
  'instances/fetchInstancesBySurvey',
  async (surveyId, { rejectWithValue }) => {
    try {
      return await instanceService.getBySurvey(surveyId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPublicInstances = createAsyncThunk(
  'instances/fetchPublicInstances',
  async (_, { rejectWithValue }) => {
    try {
      return await instanceService.getPublicInstances();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
)

export const getPublicInstance = createAsyncThunk(
  'instances/getPublicInstance',
  async (instanceId, { rejectWithValue }) => {
    try {
     return await instanceService.getPublicInstance(instanceId);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);


const initialState = {
  items: [],
  currentInstance: null,
  publicInstances: [],
  instances: [],
  questions: [],
  statistics: null,
  publicUrl: null,
  loading: false,
  error: null,
  operationLoading: false,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    hasNext: false,
  },
};

const instanceSlice = createSlice({
  name: 'instances',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentInstance: (state) => {
      state.currentInstance = null;
      state.questions = [];
      state.statistics = null;
      state.publicUrl = null;
      state.publicInstances = [];

    },
    clearStatistics: (state) => {
      state.statistics = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Instances
      .addCase(fetchInstances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInstances.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || action.payload;
        if (action.payload.total !== undefined) {
          state.pagination = {
            ...state.pagination,
            total: action.payload.total,
            hasNext: action.payload.has_next,
          };
        }
      })
      .addCase(fetchInstances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Instance By ID
      .addCase(fetchInstanceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInstanceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInstance = action.payload;
      })
      .addCase(fetchInstanceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Instance
      .addCase(createInstance.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(createInstance.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createInstance.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Update Instance
      .addCase(updateInstance.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(updateInstance.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentInstance?.id === action.payload.id) {
          state.currentInstance = action.payload;
        }
      })
      .addCase(updateInstance.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Update Instance State
      .addCase(updateInstanceState.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentInstance?.id === action.payload.id) {
          state.currentInstance = action.payload;
        }
      })
      
      // Duplicate Instance
      .addCase(duplicateInstance.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      
      // Close Instance
      .addCase(closeInstance.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            state: action.payload.state,
            closure_date: action.payload.closure_date,
          };
        }
        if (state.currentInstance?.id === action.payload.id) {
          state.currentInstance = {
            ...state.currentInstance,
            state: action.payload.state,
            closure_date: action.payload.closure_date,
          };
        }
      })
      
      // Reopen Instance
      .addCase(reopenInstance.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            state: action.payload.state,
            closure_date: null,
          };
        }
        if (state.currentInstance?.id === action.payload.id) {
          state.currentInstance = {
            ...state.currentInstance,
            state: action.payload.state,
            closure_date: null,
          };
        }
      })
      
      // Fetch Statistics
      .addCase(fetchInstanceStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
        state.loading = false;
      })
      
      // Fetch Configuration
      .addCase(fetchInstanceConfiguration.fulfilled, (state, action) => {
        state.currentInstance = action.payload;
        state.loading = false;
      })
      
      // Fetch Questions
      .addCase(fetchInstanceQuestions.fulfilled, (state, action) => {
        state.questions = action.payload;
        state.loading = false;
      })
      
      // Fetch Public URL
      .addCase(fetchPublicUrl.fulfilled, (state, action) => {
        state.publicUrl = action.payload;
        state.loading = false;
      })
      
      // Fetch Instances by Survey
      .addCase(fetchInstancesBySurvey.fulfilled, (state, action) => {
        state.instances = action.payload;
        state.loading = false;
      })

      .addCase(fetchInstancesBySurvey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInstancesBySurvey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

        //Fetch Public Instances
      })
      .addCase(fetchPublicInstances.fulfilled, (state, action) => {
        state.loading = false;
        state.publicInstances = action.payload;
       
      })
      .addCase(fetchPublicInstances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicInstances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Public Instance
      .addCase(getPublicInstance.fulfilled, (state, action) => {
        state.currentInstance = action.payload;
        state.loading = false;
      })
      .addCase(getPublicInstance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublicInstance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      
  },
});

export const { 
  clearError, 
  clearCurrentInstance, 
  clearStatistics, 
  setPagination 
} = instanceSlice.actions;
export default instanceSlice.reducer;