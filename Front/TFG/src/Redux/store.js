import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import surveyReducer from './slices/surveySlice';
import instanceReducer from './slices/instanceSlice';
import participationReducer from './slices/participationSlice';

/**
 * The Redux store, which is the central state manager for the application.
 * This is the single source of truth for the application state, and it is
 * where all the state is stored.
 *
 * @constant {Store}
 */
export const store = configureStore({
  reducer: {
    user: userReducer,
    surveys: surveyReducer,
    instances: instanceReducer,
    participations: participationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;