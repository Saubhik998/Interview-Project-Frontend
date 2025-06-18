import React from 'react';
import { render, screen } from '@testing-library/react';
import Report from '../components/Report';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import interviewReducer from '../redux/interviewSlice';

// Helper: Create a Redux test store with mocked state
const mockStore = configureStore({
  reducer: {
    interview: interviewReducer,
  },
  preloadedState: {
    interview: {
      jd: 'Looking for a React developer with strong TypeScript skills.',
      questions: ['Why do you want this job?'],
      currentQuestionIndex: 0,
      answers: [
        {
          audio: 'test-audio-url.mp3',
          transcript: 'I am passionate about frontend engineering.',
        },
      ],
    },
  },
});

describe('Report Component', () => {
  test('renders the report with score, JD, question, audio, and transcript', () => {
    render(
      <Provider store={mockStore}>
        <Report />
      </Provider>
    );

    // Score
    expect(screen.getByText(/Candidate Fit Score/i)).toBeInTheDocument();

    // Job Description
    expect(
      screen.getByText(/Looking for a React developer with strong TypeScript skills/i)
    ).toBeInTheDocument();

    // Question
    expect(screen.getByText(/Q1:/)).toBeInTheDocument();

    // Transcript
    expect(screen.getByText(/I am passionate about frontend engineering./)).toBeInTheDocument();

    // Audio
    const audio = screen.getByTestId('audio-player');
    expect(audio).toBeInTheDocument();
  });

  test('shows fallback text if no transcript is available', () => {
    const fallbackStore = configureStore({
      reducer: { interview: interviewReducer },
      preloadedState: {
        interview: {
          jd: 'Sample JD',
          questions: ['What is your biggest strength?'],
          currentQuestionIndex: 0,
          answers: [
            {
              audio: 'test-audio-url.mp3',
              transcript: '',
            },
          ],
        },
      },
    });

    render(
      <Provider store={fallbackStore}>
        <Report />
      </Provider>
    );

    expect(screen.getByText(/No transcript available/i)).toBeInTheDocument();
  });

  test('shows warning if no answer recorded', () => {
    const noAnswerStore = configureStore({
      reducer: { interview: interviewReducer },
      preloadedState: {
        interview: {
          jd: '',
          questions: ['Describe a challenge you faced.'],
          currentQuestionIndex: 0,
          answers: [],
        },
      },
    });

    render(
      <Provider store={noAnswerStore}>
        <Report />
      </Provider>
    );

    expect(screen.getByText(/No answer recorded/i)).toBeInTheDocument();
  });
});
