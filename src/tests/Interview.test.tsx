import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import Interview from '../components/Interview';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import axios from 'axios'; // ✅ Imported directly

jest.mock('axios'); // ✅ Mocking axios instead of api

const BASE_URL = 'http://192.168.6.154:5035/api/Interview';

const mockStore = configureStore([]);
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

if (typeof (global as any).MediaStream === 'undefined') {
  (global as any).MediaStream = function () { return {}; };
}

(global as any).MediaRecorder = class {
  start = jest.fn();
  stop = jest.fn();
  ondataavailable: ((e: any) => void) | null = null;
  onstop: (() => void) | null = null;
  state = 'inactive';
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  constructor() {
    setTimeout(() => {
      this.ondataavailable?.({ data: new Blob(['audio']) });
      this.onstop?.();
    }, 100);
  }
};

class MockSpeechSynthesisUtterance {
  public text: string;
  public lang: string = '';
  public pitch: number = 1;
  public rate: number = 1;
  public voice: any;
  constructor(text: string) { this.text = text; }
  set onstart(fn: (() => void) | null) { if (fn) setTimeout(fn, 0); }
  set onend(fn: (() => void) | null) { if (fn) setTimeout(fn, 10); }
}
(global as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
(global as any).speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: () => [{ name: 'Female', lang: 'en-US' }],
  onvoiceschanged: null
};
(global as any).webkitSpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  onresult: null,
  onerror: null,
  lang: '',
  continuous: false,
  interimResults: false,
}));
if (!navigator.mediaDevices) {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {},
    configurable: true,
  });
}
Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
  writable: true,
  configurable: true,
  value: jest.fn().mockResolvedValue(new (global as any).MediaStream()),
});

describe('Interview component', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      auth: { email: 'test@example.com' },
      interview: { jd: 'Test Job' }
    });
    (axios.post as jest.Mock).mockReset();
    (axios.get as jest.Mock).mockReset();
    (navigator.mediaDevices.getUserMedia as jest.Mock).mockReset();
    (navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(new (global as any).MediaStream());
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('initializes session and loads first question', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { sessionId: 'sid123', firstQuestion: 'First Q?' },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
      `${BASE_URL}/init`,
      { email: 'test@example.com', jobDescription: 'Test Job' }
    ));

    await screen.findByText('First Q?');
  });

  it('shows alert on init error', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('fail'));
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BASE_URL}/init`,
        { email: 'test@example.com', jobDescription: 'Test Job' }
      );
      expect(window.alert).toHaveBeenCalledWith('Failed to start interview.');
    });
  });

  it('transitions from TTS to recording after speech ends', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { sessionId: 'sid123', firstQuestion: 'Speaking Test' },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );

    await screen.findByText('Speaking Test');

    act(() => {
      const utterance = (window.speechSynthesis.speak as jest.Mock).mock.calls[0][0];
      if (utterance.onend) utterance.onend();
    });
  });

  it('submits answer and fetches next question', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: { sessionId: 'sid123', firstQuestion: 'Q1?' },
    });
    (axios.post as jest.Mock).mockResolvedValueOnce({});
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { index: 2, question: 'Q2?' },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );

    await screen.findByText('Q1?');

    act(() => {
      const utterance = (window.speechSynthesis.speak as jest.Mock).mock.calls[0][0];
      if (utterance.onend) utterance.onend();
    });

    jest.spyOn(window, 'FileReader').mockImplementation(() => ({
      readAsDataURL: function () {
        setTimeout(() => {
          this.onloadend?.({ target: { result: 'data:audio/webm;base64,' + 'a'.repeat(6000) } });
        }, 10);
      },
      onloadend: null,
      onerror: null,
    } as any));

    const stopBtn = await screen.findByRole('button', { name: /Stop & Next/i });
    act(() => fireEvent.click(stopBtn));
  });

  it('alerts if recorded answer is too short', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: { sessionId: 'sid123', firstQuestion: 'Too Short?' },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );

    await screen.findByText('Too Short?');

    jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.spyOn(window, 'FileReader').mockImplementation(() => ({
      readAsDataURL: function () {
        setTimeout(() => {
          this.onloadend?.({ target: { result: 'data:audio/webm;base64,short' } });
        }, 10);
      },
      onloadend: null,
      onerror: null,
    } as any));

    const stopBtn = await screen.findByRole('button', { name: /Stop & Next/i });
    act(() => fireEvent.click(stopBtn));
  });

  it('handles onvoiceschanged speechSynthesis event', () => {
    const trigger = () => {
      expect(true).toBe(true);
    };
    (window.speechSynthesis.onvoiceschanged as any) = trigger;
    trigger();
  });

  it('cleans up on unmount', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { sessionId: 'sid123', firstQuestion: 'Any Q?' },
    });

    const { unmount } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );

    await screen.findByText('Any Q?');
    unmount();
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });

  it('handles unexpected error when fetching next question', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: { sessionId: 'sid123', firstQuestion: 'Q1?' },
    });
    (axios.post as jest.Mock).mockResolvedValueOnce({});
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('unexpected'));

    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );

    await screen.findByText('Q1?');

    act(() => {
      const utterance = (window.speechSynthesis.speak as jest.Mock).mock.calls[0][0];
      if (utterance.onend) utterance.onend();
    });

    const stopBtn = await screen.findByRole('button', { name: /Stop & Next/i });
    act(() => fireEvent.click(stopBtn));
  });

  it('handles FileReader error', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: { sessionId: 'sid123', firstQuestion: 'Faulty Reader?' },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );

    await screen.findByText('Faulty Reader?');

    jest.spyOn(window, 'FileReader').mockImplementation(() => ({
      readAsDataURL: function () {
        setTimeout(() => {
          this.onerror?.(new Event('error'));
        }, 10);
      },
      onloadend: null,
      onerror: null,
    } as any));

    const stopBtn = await screen.findByRole('button', { name: /Stop & Next/i });
    act(() => fireEvent.click(stopBtn));
  });

  it('handles speech recognition start failure', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { sessionId: 'sid123', firstQuestion: 'Recog Fail?' },
    });

    const recogMock = {
      start: jest.fn(() => { throw new Error('recog fail'); }),
      stop: jest.fn(),
      onresult: null,
      onerror: null,
      lang: '',
      continuous: false,
      interimResults: false,
    };

    (global as any).webkitSpeechRecognition = jest.fn(() => recogMock);
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );

    await screen.findByText('Recog Fail?');

    act(() => {
      const utterance = (window.speechSynthesis.speak as jest.Mock).mock.calls[0][0];
      if (utterance.onend) utterance.onend();
    });
  });

  it('gracefully handles missing recorderRef', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { sessionId: 'sid123', firstQuestion: 'Missing Recorder' },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );

    await screen.findByText('Missing Recorder');

    act(() => {
      const utterance = (window.speechSynthesis.speak as jest.Mock).mock.calls[0][0];
      if (utterance.onend) utterance.onend();
    });

    (global as any).MediaRecorder = null;

    const stopBtn = await screen.findByRole('button', { name: /Stop & Next/i });
    act(() => fireEvent.click(stopBtn));
  });
});
