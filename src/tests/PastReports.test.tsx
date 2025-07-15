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
import axios from 'axios';
import { RootState } from '../redux/store';

// ✅ Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// ✅ Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// ✅ Helper to render with Redux
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

// ✅ Base mock state
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

describe('PastReports Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading and then renders reports', async () => {
    // ✅ Create manual promise delay to simulate real loading
    let resolveAxios: (value: any) => void;
    const axiosPromise = new Promise((resolve) => {
      resolveAxios = resolve;
    });

    mockedAxios.get.mockImplementationOnce(() => axiosPromise as any);

    await act(async () => {
      renderWithStore(baseState);
    });

    // ✅ Now check loading text
    expect(screen.getByText(/loading past reports/i)).toBeInTheDocument();

    // ✅ Now resolve axios manually
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

    // ✅ Now wait for final render
    await waitFor(() => {
      expect(screen.getAllByText(/Job Description:/i)).toHaveLength(2);
      expect(screen.getAllByText(/Candidate Fit Score:/i)).toHaveLength(2);
      expect(screen.getAllByText(/View Full Report/i)).toHaveLength(2);
    });
  });

  it('navigates to report detail when a report is clicked', async () => {
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

    await act(async () => {
      renderWithStore(baseState);
    });

    await waitFor(() => {
      expect(screen.getByText(/QA Engineer/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/View Full Report/i));
    expect(mockedNavigate).toHaveBeenCalledWith('/report/abc123');
  });

  it('shows message if no reports found', async () => {
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
