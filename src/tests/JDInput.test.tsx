// src/tests/JDInput.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JDInput from '../components/JDInput';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import interviewReducer from '../redux/interviewSlice';
import authReducer from '../redux/authSlice';
import { RootState } from '../redux/store';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';

// ✅ Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// ✅ Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// ✅ Helper to render with preloaded store
function renderWithStore(preState: Partial<RootState>) {
  const store = configureStore({
    reducer: {
      interview: interviewReducer,
      auth: authReducer,
    },
    preloadedState: preState as RootState,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <JDInput />
      </MemoryRouter>
    </Provider>
  );
}

// ✅ Base state with email
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

describe('JDInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders JD input field', () => {
    renderWithStore(baseState);
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start interview/i })).toBeInTheDocument();
  });

  it('submits JD and navigates to /interview', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        message: 'Started',
        jobDescription: 'Frontend developer',
        firstQuestion: 'What makes you suitable?',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { url: '/api/interview/init' },
    });

    renderWithStore(baseState);

    const textarea = screen.getByLabelText(/job description/i);
    fireEvent.change(textarea, { target: { value: 'Frontend developer' } });

    const button = screen.getByRole('button', { name: /start interview/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/api/interview/init'), {
        jobDescription: 'Frontend developer',
        email: 'test@example.com',
      });
    });

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/interview');
    });
  });
});
