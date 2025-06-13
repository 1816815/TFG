import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { submitService } from '../../services/submitService';

// Async thunks
export const submitSurvey = createAsyncThunk(
  'surveySubmit/submitSurvey',
  async ({ instanceId, data }, { rejectWithValue }) => {
    try {
      
      const response = await submitService.submit(instanceId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getParticipationResults = createAsyncThunk(
  'surveySubmit/getParticipationResults',
  async (participationId, { rejectWithValue }) => {
    try {
      const response = await submitService.getParticipationResults(participationId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getSurveyStats = createAsyncThunk(
  'surveySubmit/getSurveyStats',
  async ({ surveyId, instanceId }, { rejectWithValue }) => {
    try {
      const response = await submitService.getStats(surveyId, instanceId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Initial state
const initialState = {
  // Submit state
  submit: {
    loading: false,
    success: false,
    error: null,
    participationId: null,
    lastSubmitData: null
  },
  
  // Participation results state
  participationResults: {
    loading: false,
    data: null,
    error: null,
    lastFetched: null
  },
  
  // Survey stats state
  surveyStats: {
    loading: false,
    data: null,
    error: null,
    lastFetched: null
  },
  
  // Form state management
  form: {
    currentStep: 0,
    answers: {},
    isDirty: false,
    progress: 0
  }
};

// Slice
const surveySubmitSlice = createSlice({
  name: 'surveySubmit',
  initialState,
  reducers: {
    // Form management actions
    updateAnswer: (state, action) => {
      const { questionId, answerData } = action.payload;
      state.form.answers[questionId] = answerData;
      state.form.isDirty = true;
    },
    
    setCurrentStep: (state, action) => {
      state.form.currentStep = action.payload;
    },
    
    setFormProgress: (state, action) => {
      state.form.progress = action.payload;
    },
    
    resetForm: (state) => {
      state.form = initialState.form;
    },
    
    // Submit state management
    resetSubmitState: (state) => {
      state.submit = initialState.submit;
    },
    
    clearSubmitError: (state) => {
      state.submit.error = null;
    },
    
    // Results state management
    clearParticipationResults: (state) => {
      state.participationResults = initialState.participationResults;
    },
    
    // Stats state management
    clearSurveyStats: (state) => {
      state.surveyStats = initialState.surveyStats;
    },
    
    // Clear all states
    resetAllStates: (state) => {
      return initialState;
    }
  },
  
  extraReducers: (builder) => {
    // Submit survey
    builder
      .addCase(submitSurvey.pending, (state) => {
        state.submit.loading = true;
        state.submit.error = null;
        state.submit.success = false;
      })
      .addCase(submitSurvey.fulfilled, (state, action) => {
        state.submit.loading = false;
        state.submit.success = true;
        state.submit.participationId = action.payload.participation_id;
        state.submit.lastSubmitData = action.payload;
        state.form.isDirty = false;
      })
      .addCase(submitSurvey.rejected, (state, action) => {
        state.submit.loading = false;
        state.submit.error = action.payload;
        state.submit.success = false;
      });

    // Get participation results
    builder
      .addCase(getParticipationResults.pending, (state) => {
        state.participationResults.loading = true;
        state.participationResults.error = null;
      })
      .addCase(getParticipationResults.fulfilled, (state, action) => {
        state.participationResults.loading = false;
        state.participationResults.data = action.payload;
        state.participationResults.lastFetched = new Date().toISOString();
      })
      .addCase(getParticipationResults.rejected, (state, action) => {
        state.participationResults.loading = false;
        state.participationResults.error = action.payload;
      });

    // Get survey stats
    builder
      .addCase(getSurveyStats.pending, (state) => {
        state.surveyStats.loading = true;
        state.surveyStats.error = null;
      })
      .addCase(getSurveyStats.fulfilled, (state, action) => {
        state.surveyStats.loading = false;
        state.surveyStats.data = action.payload;
        state.surveyStats.lastFetched = new Date().toISOString();
      })
      .addCase(getSurveyStats.rejected, (state, action) => {
        state.surveyStats.loading = false;
        state.surveyStats.error = action.payload;
      });

  }
});

// Export actions
export const {
  updateAnswer,
  setCurrentStep,
  setFormProgress,
  resetForm,
  resetSubmitState,
  clearSubmitError,
  clearParticipationResults,
  clearSurveyStats,
  resetAllStates
} = surveySubmitSlice.actions;

// Selectors
export const selectSubmitState = (state) => state.surveySubmit.submit;
export const selectParticipationResults = (state) => state.surveySubmit.participationResults;
export const selectSurveyStats = (state) => state.surveySubmit.surveyStats;
export const selectFormState = (state) => state.surveySubmit.form;

// Complex selectors
export const selectIsSubmitting = (state) => state.surveySubmit.submit.loading;
export const selectSubmitSuccess = (state) => state.surveySubmit.submit.success;
export const selectSubmitError = (state) => state.surveySubmit.submit.error;
export const selectParticipationId = (state) => state.surveySubmit.submit.participationId;

export const selectFormAnswers = (state) => state.surveySubmit.form.answers;
export const selectCurrentStep = (state) => state.surveySubmit.form.currentStep;
export const selectFormProgress = (state) => state.surveySubmit.form.progress;
export const selectFormIsDirty = (state) => state.surveySubmit.form.isDirty;

// Export reducer
export default surveySubmitSlice.reducer;