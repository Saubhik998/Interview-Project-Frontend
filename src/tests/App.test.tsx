import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/authSlice';
import interviewReducer from '../redux/interviewSlice';
import { RootState } from '../redux/store';

// ✅ Mock ProtectedRoute to render children only (for test simplification)
jest.mock('../auth/ProtectedRoute', () => ({ children }: { children: React.ReactNode }) => <>{children}</>);

// ✅ Sample state for logged-in user
const baseState: Partial<RootState> = {
  auth: {
    email: 'test@example.com',
    isLoggedIn: true,
  },
  interview: {
    jd: 'Sample JD',
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
  },
};

// ✅ Reusable render function with Redux Provider only (no MemoryRouter)
function renderWithProviders(path: string) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      interview: interviewReducer,
    },
    preloadedState: baseState as RootState,
  });

  // Simulate route
  window.history.pushState({}, '', path);

  return render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}

describe('App Routing (with real components)', () => {
  it('renders Login component on /login route', async () => {
    renderWithProviders('/login');
    expect(await screen.findByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('renders Navbar and JDInput on / route', async () => {
    renderWithProviders('/');
    expect(await screen.findByRole('link', { name: /view past reports/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /start interview/i })).toBeInTheDocument();
  });

  it('renders Interview component on /interview route', async () => {
    renderWithProviders('/interview');
    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  it('renders Report component on /report route', async () => {
    localStorage.setItem('sessionId', '123');
    renderWithProviders('/report');
    expect(await screen.findByText(/loading report/i)).toBeInTheDocument();
  });

  it('renders PastReports component on /reports route', async () => {
    renderWithProviders('/reports');
    expect(await screen.findByText(/loading past reports/i)).toBeInTheDocument();
  });

  it('renders ReportDetails component on /report/:id route', async () => {
    renderWithProviders('/report/123');
    expect(await screen.findByText(/loading report/i)).toBeInTheDocument();
  });
});
