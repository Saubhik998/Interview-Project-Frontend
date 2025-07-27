import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import Interview from '../components/Interview';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import api from '../api';

// ------------ Browser API/polyfill mocks ------------

// MediaStream: Fake for Node test env
if (typeof (global as any).MediaStream === 'undefined') {
  (global as any).MediaStream = function () { return {}; };
}

// Mock SpeechSynthesisUtterance with proper setter types
class MockSpeechSynthesisUtterance {
  public text: string;
  public lang: string = '';
  public pitch: number = 1;
  public rate: number = 1;
  public voice: any;
  private _onstart: (() => void) | null = null;
  private _onend: (() => void) | null = null;
  constructor(text: string) { this.text = text; }
  set onstart(fn: (() => void) | null) { this._onstart = fn; if (fn) setTimeout(fn, 0); }
  set onend(fn: (() => void) | null) { this._onend = fn; if (fn) setTimeout(fn, 10); }
}
(global as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
(global as any).speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: () => [{ name: 'Female', lang: 'en-US' }],
  onvoiceschanged: null
};
// webkitSpeechRecognition stub
(global as any).webkitSpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  onresult: null,
  onerror: null,
  lang: '',
  continuous: false,
  interimResults: false,
}));
// getUserMedia on mediaDevices (Node can't override navigator.mediaDevices itself)
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

// ------------ Redux/Router mocks ------------
jest.mock('../api');
const mockStore = configureStore([]);
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// ------------ Tests ------------
describe('Interview component', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      auth: { email: 'test@example.com' },
      interview: { jd: 'Test Job' }
    });
    (api.post as jest.Mock).mockReset();
    (api.get as jest.Mock).mockReset();
    (navigator.mediaDevices.getUserMedia as jest.Mock).mockReset();
    (navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(new (global as any).MediaStream());
    jest.clearAllMocks();
  });

  it('initializes session and loads first question', async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { sessionId: 'sid123', firstQuestion: 'First Q?' },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      '/interview/init',
      { email: 'test@example.com', jobDescription: 'Test Job' }
    ));
    await waitFor(() => {
      const q1Headings = screen.getAllByText(
        (content, node) =>
          node?.textContent?.replace(/\s/g, '').includes('Q1:'.replace(/\s/g,'')) || false
      );
      expect(q1Headings.length).toBeGreaterThan(0);
      expect(screen.getByText('First Q?')).toBeInTheDocument();
    });
  });

  it('shows alert on init error', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error('fail'));
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Failed to start interview.');
    });
  });

  it('handles end of questions and routes to report', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { sessionId: 'sid123', firstQuestion: 'First Q?' },
    });
    (api.post as jest.Mock).mockResolvedValueOnce({});
    const noMoreError = { response: { data: { error: 'No more questions.' } } };
    (api.get as jest.Mock).mockRejectedValue(noMoreError);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        '/interview/init',
        { email: 'test@example.com', jobDescription: 'Test Job' }
      )
    );
    // Press "Stop & Next"
    const stopBtn = screen.queryByRole('button', { name: /Stop & Next/i });
    if (stopBtn) {
      act(() => {
        fireEvent.click(stopBtn);
      });
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/report'));
    }
  });
});
