// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import interviewReducer from './interviewSlice';
import authReducer from './authSlice';

// Configure the Redux store
const store = configureStore({
  reducer: {
    interview: interviewReducer,
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Define types for use throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
