import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/userSlice';

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
  },
});
