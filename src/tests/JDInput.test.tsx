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

//  Mock useNavigate from react-router-dom
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

//  Mock custom Axios instance
jest.mock('../api');
const mockedAxios = axios as jest.Mocked<typeof axios>;

//  Helper: render JDInput with custom Redux store state
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

//  Base Redux state for tests
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

//  Tests
describe('JDInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders JD input field and start button', () => {
    renderWithStore(baseState);
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start interview/i })).toBeInTheDocument();
  });

  it('submits JD and navigates to /interview', async () => {
    // Mock successful API response
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

    // Fill in JD
    fireEvent.change(screen.getByLabelText(/job description/i), {
      target: { value: 'Frontend developer' },
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /start interview/i }));

    // Assert Axios POST call
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/interview/init', {
        jobDescription: 'Frontend developer',
        email: 'test@example.com',
      });
    });

    // Assert navigation
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/interview');
    });
  });
});
