// Redux slice to manage user authentication state
// Tracks whether user is logged in and stores user email

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Interface defining auth state structure
export  interface AuthState {
  isLoggedIn: boolean;
  email: string;
}

// Initial default state
const initialState: AuthState = {
  isLoggedIn: false,
  email: '',
};

// Slice with login/logout reducers
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Logs in the user and sets email
    login: (state, action: PayloadAction<string>) => {
      state.isLoggedIn = true;
      state.email = action.payload;
    },
    // Logs out the user and clears email
    logout: (state) => {
      state.isLoggedIn = false;
      state.email = '';
    },
  },
});

// Export actions and reducer
export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
