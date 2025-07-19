// Mock navigation (must be hoisted before imports)
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock custom axios instance (hoisted)
jest.mock('../api');

// Stub out window.alert (JSDOM doesn’t support it)
Object.defineProperty(window, 'alert', {
  writable: true,
  value: jest.fn(),
});

// Silence React Router future-flag warnings
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterAll(() => {
  (console.warn as jest.Mock).mockRestore();
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import Interview from '../components/Interview';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import interviewReducer from '../redux/interviewSlice';
import authReducer from '../redux/authSlice';
import { RootState } from '../redux/store';
import { MemoryRouter } from 'react-router-dom';
import axiosInstance from '../api';

// Mock custom axios instance type
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

// Mock SpeechSynthesisUtterance
Object.assign(global, {
  SpeechSynthesisUtterance: class {
    text: string;
    lang = '';
    pitch = 1;
    rate = 1;
    voice: any = null;
    onstart: () => void = () => {};
    onend: () => void = () => {};
    constructor(text: string) {
      this.text = text;
    }
  },
});

// Mock speechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: jest.fn(),
    cancel: jest.fn(),
    getVoices: () => [{ name: 'Google US English', lang: 'en-US' }],
    paused: false,
    speaking: false,
    pending: false,
    pause: jest.fn(),
    resume: jest.fn(),
    onvoiceschanged: null,
  },
});

// Capture and mock MediaRecorder instances
Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  value: class {
    constructor() {}
    static isTypeSupported(_: string) {
      return true;
    }
  },
});

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({}),
  },
});

// AxiosResponse type
type AxiosResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: { url: string };
};

// Helper to render component with Redux
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
        <Interview />
      </MemoryRouter>
    </Provider>
  );
}

// Base state
const baseState: Partial<RootState> = {
  auth: {
    email: 'test@example.com',
    isLoggedIn: true,
  },
  interview: {
    jd: 'Test JD',
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
  },
};

describe('Interview Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading then renders first question', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        message: 'Started',
        jobDescription: 'Test JD',
        firstQuestion: 'Tell me about yourself',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { url: '/interview/init' },
    } as AxiosResponse);

    renderWithStore(baseState);

    await screen.findByText(/Loading…/i);
    await screen.findByText(/Tell me about yourself/i);
  });
});
