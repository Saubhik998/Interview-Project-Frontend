// src/tests/Report.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Report from '../components/Report';

// ✅ Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// ✅ Mock data
const mockReportData = {
  jd: 'Full Stack Developer',
  score: 87,
  questions: ['What is React?', 'Explain Node.js'],
  answers: [
    {
      question: 'What is React?',
      transcript: 'React is a JavaScript library for building UIs.',
      audio: 'http://example.com/audio1.mp3',
    },
    {
      question: 'Explain Node.js',
      transcript: 'Node.js is a runtime for executing JavaScript on the server.',
      audio: 'http://example.com/audio2.mp3',
    },
  ],
  strengths: ['Strong communication', 'Deep technical knowledge'],
  improvements: ['Expand on backend topics'],
  followUps: ['Ask about database optimization'],
};

describe('Report Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state and then displays the report', async () => {
    const mockResponse = {
      data: mockReportData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { url: '/api/interview/report' },
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    render(<Report />);

    // ✅ Show loading initially
    expect(screen.getByText(/loading report/i)).toBeInTheDocument();

    // ✅ Wait for actual content
    await waitFor(() => {
      expect(screen.getByText(/Interview Summary Report/i)).toBeInTheDocument();
      expect(screen.getByText(/Full Stack Developer/i)).toBeInTheDocument();
      expect(screen.getByText(/React is a JavaScript library/i)).toBeInTheDocument();
      expect(screen.getByText(/Strong communication/i)).toBeInTheDocument();
    });
  });

  it('shows error message if fetching report fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    render(<Report />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load report/i)).toBeInTheDocument();
    });
  });
});
