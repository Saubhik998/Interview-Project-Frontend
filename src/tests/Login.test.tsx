// src/tests/Login.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, Store } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Login from '../auth/Login';
import authReducer from '../redux/authSlice';
import interviewReducer from '../redux/interviewSlice'; // ✅ Add this
import { RootState } from '../redux/store';
import '@testing-library/jest-dom';

// ✅ Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  let store: Store<RootState>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        interview: interviewReducer, // ✅ Include this to match RootState
      },
    });
    jest.clearAllMocks();
  });

  const renderWithProviders = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

  it('renders login form and dispatches login action', () => {
    renderWithProviders();

    const emailInput = screen.getByLabelText(/email address/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');

    const state = store.getState();
    expect(state.auth.email).toBe('user@example.com');
    expect(state.auth.isLoggedIn).toBe(true);
  });
});
