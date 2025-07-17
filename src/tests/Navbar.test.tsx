import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '../redux/authSlice';
import interviewReducer from '../redux/interviewSlice';
import Navbaar from '../components/Navbar';
import { RootState } from '../redux/store';

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

//  Helper to render with Redux store
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

//  State fixtures
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

//  TESTS
describe('Navbaar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows email and View Past Reports button when logged in', () => {
    renderWithStore(loggedInState);

    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view past reports/i })).toBeInTheDocument();
  });

  it('does not show email or reports button when not logged in', () => {
    renderWithStore(loggedOutState);

    expect(screen.queryByText(/logged in as/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /view past reports/i })).not.toBeInTheDocument();
  });

  it('navigates to /reports on link click', () => {
    renderWithStore(loggedInState);

    const link = screen.getByRole('link', { name: /view past reports/i });
    fireEvent.click(link);

    // Optional: If the <a> has an `onClick={() => navigate('/reports')}` instead of href, this would work
    // For now, just assert the link has correct href
    expect(link).toHaveAttribute('href', '/reports');
  });
});
