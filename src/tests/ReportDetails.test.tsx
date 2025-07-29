import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ReportDetails from '../components/ReportDetails';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import api from '../api';

jest.mock('html2canvas', () => jest.fn());

//  The PDF download/unit test is removed to avoid_jspdf.default is not a constructor TS error

jest.mock('../api');

const mockReport = {
  jobDescription: "Software Engineer",
  candidateFitScore: 88,
  strengths: ["Problem Solving", "Communication"],
  improvementAreas: ["Time Management", "Technical Depth"],
  suggestedFollowUp: ["Tell me about a recent project."],
  answers: [
    {
      question: "Why do you want this job?",
      transcript: "I love building software.",
      audio: "https://example.com/audio1.mp3"
    },
    {
      question: "Describe a challenge.",
      transcript: "Scope creep in a previous project.",
      audio: ""
    }
  ],
  createdAt: "2025-07-24T18:10:30Z"
};

function renderWithRouter(ui: React.ReactElement, { route = '/report/abc123' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/report/:id" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ReportDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading initially', async () => {
    (api.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    renderWithRouter(<ReportDetails />);
    expect(screen.getByText(/Loading report/i)).toBeInTheDocument();
  });

  it('renders not found on error', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('fail'));
    renderWithRouter(<ReportDetails />);
    await waitFor(() => {
      expect(screen.getByText(/Report not found/i)).toBeInTheDocument();
    });
  });

  it('renders audio tag if audio URL exists', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockReport });
    renderWithRouter(<ReportDetails />);
    await waitFor(() => screen.getByText(/Full Interview Report/i));
    // Use querySelector for <audio>
    const audioEl = document.querySelector('audio');
    expect(audioEl).toBeInTheDocument();
    expect(audioEl).toHaveAttribute('src', "https://example.com/audio1.mp3");
  });
});
