import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '../redux/authSlice';
import interviewReducer from '../redux/interviewSlice';
import Navbaar from '../components/Navbar';
import { RootState } from '../redux/store';

// ------------------
// Mock useNavigate from react-router-dom for navigation testing
// ------------------
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// ------------------
// Helper for rendering component with Redux/Router context
// ------------------
function renderWithStore(preState: Partial<RootState>) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      interview: interviewReducer,
    },
    preloadedState: preState as RootState,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Navbaar />
      </MemoryRouter>
    </Provider>
  );
}

// ------------------
// Sample Redux states for logged in/out scenarios
// ------------------
const loggedInState: Partial<RootState> = {
  auth: { email: 'test@example.com', isLoggedIn: true },
  interview: {
    jd: '',
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
  },
};

const loggedOutState: Partial<RootState> = {
  auth: { email: '', isLoggedIn: false },
  interview: {
    jd: '',
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
  },
};

// ------------------
// TESTS
// ------------------
describe('Navbaar Component', () => {
  beforeEach(() => {
    // Always clear previous mock calls for isolation
    jest.clearAllMocks();
  });

  it('shows email and View Past Reports button when logged in', () => {
    renderWithStore(loggedInState);

    //  Check email visible
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    // View Past Reports button (likely an <a> or<link>)
    expect(screen.getByRole('link', { name: /view past reports/i })).toBeInTheDocument();
  });

  it('does not show email or reports button when not logged in', () => {
    renderWithStore(loggedOutState);

    // "Logged in as" context missing
    expect(screen.queryByText(/logged in as/i)).not.toBeInTheDocument();
    // No View Past Reports button
    expect(screen.queryByRole('link', { name: /view past reports/i })).not.toBeInTheDocument();
  });

  it('navigates to /reports on link click', () => {
    renderWithStore(loggedInState);

    const link = screen.getByRole('link', { name: /view past reports/i });
    fireEvent.click(link);

    
    expect(link).toHaveAttribute('href', '/reports');
    // If Navbaar uses navigate('/reports'), you could also check:
    // expect(mockedNavigate).toHaveBeenCalledWith('/reports');
  });
});
