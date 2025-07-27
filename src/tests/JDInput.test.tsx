import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JDInput from '../components/JDInput';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import interviewReducer from '../redux/interviewSlice';
import authReducer from '../redux/authSlice';
import { RootState } from '../redux/store';
import axios from '../api';
import { MemoryRouter } from 'react-router-dom';

// -- Mocks --

// Mock useNavigate so we can test redirects
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock Axios so no real network calls are made
jest.mock('../api');
const mockedAxios = axios as jest.Mocked<typeof axios>;

/*
  renderWithStore:
  Helper which sets up a Redux Provider using a given initial state,
  wraps component in react-router MemoryRouter context for navigation.
*/
function renderWithStore(preloadedState: Partial<RootState>) {
  const store = configureStore({
    reducer: {
      interview: interviewReducer,
      auth: authReducer,
    },
    preloadedState: preloadedState as RootState,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <JDInput />
      </MemoryRouter>
    </Provider>
  );
}

// A basic state for a logged-in user, ready to test JDInput
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

// Main Test Suite for JDInput
describe('JDInput Component', () => {
  beforeEach(() => {
    // Clear navigation, API, and any other mocks before each test
    jest.clearAllMocks();
  });

  it('renders JD input field and start button', () => {
    renderWithStore(baseState);
    // Checks that input and button are rendered - base UI smoke test
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start interview/i })).toBeInTheDocument();
  });

  it('submits JD and navigates to /interview', async () => {
    // Arrange: set up the next Axios POST call to resolve with fake backend data
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        message: 'Started',
        jobDescription: 'Frontend developer',
        firstQuestion: 'What makes you suitable?',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {url: '/api/interview/init'},
    });

    renderWithStore(baseState);

    // Act: Simulate user typing into JD input
    fireEvent.change(screen.getByLabelText(/job description/i), {
      target: { value: 'Frontend developer' },
    });

    // Click the 'Start Interview' button
    fireEvent.click(screen.getByRole('button', { name: /start interview/i }));

    // Assert: Axios call should be triggered with email and JD
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/interview/init', {
        jobDescription: 'Frontend developer',
        email: 'test@example.com',
      });
    });

    
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/interview');
    });
  });
});
