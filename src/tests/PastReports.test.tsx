import React from 'react';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import PastReports from '../components/PastReports';
import authReducer from '../redux/authSlice';
import interviewReducer from '../redux/interviewSlice';
import axios from '../api'; 
import { RootState } from '../redux/store';

// -----------
// Mock useNavigate from react-router-dom so navigation is testable
// -----------
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// -----------
// Mock axios, so requests are intercepted by our test
// -----------
jest.mock('../api'); 
const mockedAxios = axios as jest.Mocked<typeof axios>;

// -----------
// Helper to render with a Redux provider and router context
// -----------
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
        <PastReports />
      </MemoryRouter>
    </Provider>
  );
}

// -----------
// A typical logged-in user state
// -----------
const baseState: Partial<RootState> = {
  auth: {
    email: 'test@example.com',
    isLoggedIn: true,
  },
  interview: {
    jd: '',
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
  },
};

// =============================
// TEST SUITE
// =============================
describe('PastReports Component', () => {
  beforeEach(() => {
    // Clear any mocks so each test is isolated
    jest.clearAllMocks();
  });

  it('shows loading and then renders reports', async () => {
    // Use a manual promise for fine-grained async control
    let resolveAxios: (value: any) => void;
    const axiosPromise = new Promise((resolve) => {
      resolveAxios = resolve;
    });

    // When component asks for past reports, resolve later
    mockedAxios.get.mockImplementationOnce(() => axiosPromise as any);

    await act(async () => {
      renderWithStore(baseState);
    });

    // Loading indicator must show while promise not resolved
    expect(screen.getByText(/loading past reports/i)).toBeInTheDocument();

    // After manual resolve, two reports should appear
    resolveAxios!({
      data: [
        {
          _id: '1',
          jobDescription: 'Frontend Developer',
          candidateFitScore: 85,
        },
        {
          _id: '2',
          jobDescription: 'Backend Developer',
          candidateFitScore: 90,
        },
      ],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { url: '/api/interview/reports' },
    });

    // Wait for UI to update for both reports
    await waitFor(() => {
      expect(screen.getAllByText(/Job Description:/i)).toHaveLength(2);
      expect(screen.getAllByText(/Candidate Fit Score:/i)).toHaveLength(2);
      expect(screen.getAllByText(/View Full Report/i)).toHaveLength(2);
    });
  });

  it('navigates to report detail when a report is clicked', async () => {
    // Only one report this time for clickability test
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          _id: 'abc123',
          jobDescription: 'QA Engineer',
          candidateFitScore: 77,
        },
      ],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { url: '/api/interview/reports' },
    });

    // Render component and ensure report loaded
    await act(async () => {
      renderWithStore(baseState);
    });

    // Wait for report to render
    await waitFor(() => {
      expect(screen.getByText(/QA Engineer/i)).toBeInTheDocument();
    });

    // Click the button to view full report
    fireEvent.click(screen.getByText(/View Full Report/i));
    expect(mockedNavigate).toHaveBeenCalledWith('/report/abc123');
  });

  it('shows message if no reports found', async () => {
    // Simulate empty list returned from backend
    mockedAxios.get.mockResolvedValueOnce({
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { url: '/api/interview/reports' },
    });

    await act(async () => {
      renderWithStore(baseState);
    });

    
    expect(
      await screen.findByText(/no reports found for test@example.com/i)
    ).toBeInTheDocument();
  });
});
