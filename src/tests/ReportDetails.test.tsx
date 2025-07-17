import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axiosInstance from '../api';
import ReportDetails from '../components/ReportDetails';

//  Mock the custom axios instance
jest.mock('../api');
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

const mockReport = {
  jobDescription: 'Software Engineer',
  candidateFitScore: 88,
  strengths: ['Problem-solving', 'Team collaboration'],
  improvementAreas: ['Explain concepts more clearly'],
  suggestedFollowUp: ['Discuss project experience'],
  answers: [
    {
      question: 'What is TypeScript?',
      transcript: 'TypeScript is a typed superset of JavaScript.',
      audio: 'http://example.com/audio1.mp3',
    },
    {
      question: 'Explain REST APIs',
      transcript: 'REST APIs follow standard HTTP methods.',
      audio: 'http://example.com/audio2.mp3',
    },
  ],
};

describe('ReportDetails Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading and then displays report details', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockReport,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { url: '/api/interview/report/123' }, // required for type compatibility
    });

    render(
      <MemoryRouter initialEntries={['/report/123']}>
        <Routes>
          <Route path="/report/:id" element={<ReportDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading report/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Full Interview Report/i)).toBeInTheDocument();
      expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument();
      expect(screen.getByText(/TypeScript is a typed superset/i)).toBeInTheDocument();
      expect(screen.getByText(/Problem-solving/i)).toBeInTheDocument();
    });
  });

  it('renders error message if API fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Fetch error'));

    render(
      <MemoryRouter initialEntries={['/report/456']}>
        <Routes>
          <Route path="/report/:id" element={<ReportDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/report not found/i)).toBeInTheDocument();
    });
  });
});
