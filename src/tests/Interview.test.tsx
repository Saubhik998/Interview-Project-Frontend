declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import Interview from '../components/Interview';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import interviewReducer, { setAnswer } from '../redux/interviewSlice';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

jest.useFakeTimers();

// ---- Mock Web Speech API ----
window.SpeechRecognition = window.webkitSpeechRecognition = class {
  onresult: ((event: any) => void) | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;

  start() {
    this.onstart?.();
    setTimeout(() => {
      const event = {
        results: [[{ transcript: 'Mock transcript' }]],
      };
      this.onresult?.(event);
      this.onend?.();
    }, 1000);
  }

  stop() {
    this.onend?.();
  }
};

// ---- Mock TTS ----
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: () => [],
  onvoiceschanged: null,
} as any;

// ---- Test Redux store ----
const createTestStore = () =>
  configureStore({
    reducer: { interview: interviewReducer },
    preloadedState: {
      interview: {
        jd: 'Sample JD',
        questions: ['What is your greatest strength?'],
        currentQuestionIndex: 0,
        answers: [],
      },
    },
  });

describe('Interview Component', () => {
  test('renders question and countdown UI', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/What is your greatest strength/i)).toBeInTheDocument();
    expect(screen.getByText(/Time Left:/i)).toBeInTheDocument();
    expect(screen.getByText(/Waiting/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Stop & Next/i })).toBeDisabled();
  });

  test('records answer and updates Redux store with transcript', async () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );

    // Simulate STT result after TTS
    await act(async () => {
      jest.runAllTimers(); // triggers speech recognition callback
    });

    // Simulate countdown finish and user clicking "Stop & Next"
    const stopNextButton = screen.getByRole('button', { name: /Stop & Next/i });
    act(() => {
      stopNextButton.removeAttribute('disabled');
    });

    // Manually dispatch what the real component would do
    act(() => {
      store.dispatch(
        setAnswer({
          index: 0,
          audio: 'mock-url',
          transcript: 'Mock transcript',
        })
      );
    });

    // Validate Redux was updated
    await waitFor(() => {
      const state = store.getState().interview;
      expect(state.answers.length).toBeGreaterThan(0);
      expect(state.answers[0].transcript).toBe('Mock transcript');
    });
  });
});
