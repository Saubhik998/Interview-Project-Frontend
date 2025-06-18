// Combines interview and auth reducers into the Redux store

import { configureStore } from '@reduxjs/toolkit';
import interviewReducer from './interviewSlice';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    interview: interviewReducer,
    auth: authReducer,
  },
});

// Define RootState and AppDispatch types for use in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
