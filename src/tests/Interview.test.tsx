// ---------------------------------------------
// MOCKS AND GLOBAL STUBS (must be at top-level)
// ---------------------------------------------

// Mock navigation hook (useNavigate) from react-router-dom
// This must be declared before importing components
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock the custom axios instance used for API requests
jest.mock('../api');

// Stub window.alert since JSDOM environment does not support it
Object.defineProperty(window, 'alert', {
  writable: true,
  value: jest.fn(),
});

// Silence React Router's warning messages for cleaner test output
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterAll(() => {
  (console.warn as jest.Mock).mockRestore();
});

// ---------------------------------------------
// IMPORTS
// ---------------------------------------------

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

// ---------------------------------------------
// BROWSER/PLATFORM API MOCKS
// ---------------------------------------------

// Typed mock for axiosInstance so we can set mock return values/methods
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

// Mock SpeechSynthesisUtterance (for TTS)
// Many browsers use this for speaking interview questions
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

// Mock the speechSynthesis global object with expected methods and voice data
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

// Provide a minimal, mockable MediaRecorder to support audio recording code
Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  value: class {
    constructor() {}
    static isTypeSupported(_: string) {
      return true;
    }
  },
});

// Mock navigator.mediaDevices.getUserMedia for microphone access in recording
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({}),
  },
});

// ---------------------------------------------
// TYPE HELPERS AND UTILITIES
// ---------------------------------------------

// Type for mimicking an AxiosResponse 
type AxiosResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: { url: string };
};

// Helper for rendering Interview with Redux store and React Router
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

// Example Redux state for a logged-in user, ready to start interview
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

// ---------------------------------------------
// MAIN TEST SUITE: INTERVIEW COMPONENT
// ---------------------------------------------

describe('Interview Component', () => {
  beforeEach(() => {
    // Always reset all mocks to ensure test isolation
    jest.clearAllMocks();
  });

  it('shows loading then renders first question', async () => {
    // Arrange: set up axios POST mock to resolve with initial interview question
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

    // Render the Interview component within test Redux/Router context
    renderWithStore(baseState);

    // First, "Loading..." text should be present while waiting for API
    await screen.findByText(/Loading…/i);

    // Then, after mock resolves: The first question should appear
    await screen.findByText(/Tell me about yourself/i);
  });
});
