import { configureStore } from '@reduxjs/toolkit';
import interviewReducer from './interviewSlice';

// This sets up the Redux store using our interview reducer
export const store = configureStore({
  reducer: {
    interview: interviewReducer,
  },
});

// Infer types for use throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
