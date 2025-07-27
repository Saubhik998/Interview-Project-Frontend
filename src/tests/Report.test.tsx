import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Report from '../components/Report';
import api from '../api';

// -- html2pdf.js mock 
jest.mock('html2pdf.js', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    set: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    save: jest.fn(),
  })),
}));

// ----- api mock -----
jest.mock('../api');

// Minimal report for error and transcript test
const mockReport = {
  jd: 'Frontend Developer JD',   
  score: 83,
  questions: [
    "Why are you interested in this job?",
    "How do you handle pressure?",
  ],
  answers: [
    { question: "Why are you interested in this job?", transcript: "I love front-end work." },
    { question: "How do you handle pressure?", transcript: "I stay organized and focused." }
  ],
  strengths: ["UI development", "Teamwork"],
  improvements: ["React optimization"],
  followUps: ["Tell me about a React project.", "How do you grow your skills?"],
};

function setSessionId(id: string | null) {
  if (id !== null) {
    window.localStorage.setItem('sessionId', id);
  } else {
    window.localStorage.removeItem('sessionId');
  }
}

describe('<Report />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setSessionId('fakeSessionId');
  });

  it('shows loading screen while fetching', async () => {
    (api.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<Report />);
    expect(screen.getByText(/Loading report/i)).toBeInTheDocument();
  });

  it('shows error if sessionId is missing', async () => {
    setSessionId(null);
    render(<Report />);
    await waitFor(() =>
      expect(screen.getByText(/Failed to load report/i)).toBeInTheDocument()
    );
  });

  it('shows error if API fails', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<Report />);
    await waitFor(() =>
      expect(screen.getByText(/Failed to load report/i)).toBeInTheDocument()
    );
  });

  it('handles missing transcript field gracefully', async () => {
    const partialReport = {
      ...mockReport,
      answers: [
        { question: "Why are you interested in this job?", transcript: undefined },
        { question: "How do you handle pressure?", transcript: "" }
      ]
    };
    (api.get as jest.Mock).mockResolvedValue({ data: partialReport });

    render(<Report />);
    await waitFor(() =>
      expect(screen.getByText(/Interview Summary Report/i)).toBeInTheDocument()
    );
    expect(screen.getAllByText(/No transcript available/i).length).toBeGreaterThanOrEqual(1);
  });
});
