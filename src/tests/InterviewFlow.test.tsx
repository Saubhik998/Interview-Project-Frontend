/**
 * Integration test for the Interview Flow:
 * - Renders Interview and Report components
 * - Ensures they load correctly with mocked Redux state
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import Interview from '../components/Interview';
import Report from '../components/Report';
import { RootState } from '../redux/store';
import { MemoryRouter } from 'react-router-dom';

// ✅ Mock speechSynthesis API globally for the test environment
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: () => [],
  onvoiceschanged: null,
} as any;

const mockStore = configureMockStore<RootState>();

describe('Interview Flow Integration', () => {
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore({
      interview: {
        jd: 'Mock JD for testing integration flow',
        questions: ['Tell me about yourself.', 'What are your strengths?'],
        currentQuestionIndex: 0,
        answers: [],
      },
      auth: {
        isLoggedIn: true,
        email: 'test@example.com',
      },
    });
  });

  test('renders Interview component with first question', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Interview />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText(/Tell me about yourself/i)).toBeInTheDocument();
  });

  test('renders Report component with JD and mock questions', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Report />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText(/Interview Summary Report/i)).toBeInTheDocument();
    expect(screen.getByText(/Mock JD for testing integration flow/i)).toBeInTheDocument();
    expect(screen.getByText(/Tell me about yourself/i)).toBeInTheDocument();
    expect(screen.getByText(/What are your strengths/i)).toBeInTheDocument();
  });
});
