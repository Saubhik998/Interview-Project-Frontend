import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import Interview from '../components/Interview';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import interviewReducer from '../redux/interviewSlice';
import authReducer from '../redux/authSlice';
import { RootState } from '../redux/store';
import { MemoryRouter } from 'react-router-dom';
import axiosInstance from '../api'; 

//  Mock navigation
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

//  Mock custom axios instance
jest.mock('../api');
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

//  Mock SpeechSynthesisUtterance
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

//  Mock speechSynthesis
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

//  Capture and mock MediaRecorder
const mediaRecorderInstances: any[] = [];
Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  value: class {
    onstop: () => void = () => {};
    ondataavailable: (e: any) => void = () => {};
    start = jest.fn();
    stop = jest.fn();
    constructor() {
      mediaRecorderInstances.push(this);
    }
    static isTypeSupported(_: string) {
      return true;
    }
  },
});

//  Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({}),
  },
});

//  AxiosResponse type
type AxiosResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: { url: string };
};

//  Helper to render component with Redux
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

//  Base state
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

//  TESTS
describe('Interview Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mediaRecorderInstances.length = 0;
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
      config: { url: '/api/interview/init' },
    } as AxiosResponse);

    renderWithStore(baseState);

    expect(screen.getByText(/Loading interview/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Tell me about yourself/i)).toBeInTheDocument();
    });
  });

  it('completes interview and navigates to report', async () => {
    mockedAxios.post
      .mockResolvedValueOnce({
        data: {
          message: 'Started',
          jobDescription: 'Test JD',
          firstQuestion: 'First question',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/api/interview/init' },
      } as AxiosResponse)
      .mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/api/interview/answer' },
      } as AxiosResponse)
      .mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/api/interview/complete' },
      } as AxiosResponse);

    mockedAxios.get.mockResolvedValueOnce({
      data: { question: null },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { url: '/api/interview/question' },
    } as AxiosResponse);

    renderWithStore(baseState);

    await waitFor(() => {
      expect(screen.getByText(/First question/i)).toBeInTheDocument();
    });

    act(() => {
      const utterance = (window.speechSynthesis.speak as jest.Mock).mock.calls[0][0];
      utterance.onend();
    });

    let recorder: any;
    await waitFor(() => {
      recorder = mediaRecorderInstances[0];
      if (!recorder) throw new Error('Recorder not ready');
    });

    act(() => {
      recorder.ondataavailable({ data: new Blob() });
      recorder.onstop();
    });

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/report');
    });
  });
});
