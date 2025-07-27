import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, Store } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Login from '../auth/Login';
import authReducer from '../redux/authSlice';
import interviewReducer from '../redux/interviewSlice'; 
import { RootState } from '../redux/store';
import '@testing-library/jest-dom';

// ---- Mock useNavigate so redirects can be tested ----
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  // The Redux store for each test run
  let store: Store<RootState>;

  beforeEach(() => {
    // Set up a new Redux store before each test
    store = configureStore({
      reducer: {
        auth: authReducer,
        interview: interviewReducer, 
      },
    });
    // Clear navigation and any other mocks to isolate tests
    jest.clearAllMocks();
  });

  /*
    Helper function for rendering the Login component
    with Redux Provider and MemoryRouter context.
  */
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

    // Find email input and login button in the form
    const emailInput = screen.getByLabelText(/email address/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    // Simulate user typing email and clicking-login
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(loginButton);

    
    expect(mockNavigate).toHaveBeenCalledWith('/');

    // Check the Redux state is updated correctly
    const state = store.getState();
    expect(state.auth.email).toBe('user@example.com');
    expect(state.auth.isLoggedIn).toBe(true);
  });
});
