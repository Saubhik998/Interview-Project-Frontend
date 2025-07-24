import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axiosInstance from '../api';
import ReportDetails from '../components/ReportDetails';

// ----- MOCKS -----

// Mock the custom axios instance so no real HTTP calls are made
jest.mock('../api');
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

// Test data for a report returned by the API
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

// ----- TEST SUITE -----
describe('ReportDetails Component', () => {
  beforeEach(() => {
    // Reset axios and any global mocks before each test
    jest.clearAllMocks();
  });

  it('renders loading and then displays report details', async () => {
    // Arrange: Mock axios.get to resolve with fake report data
    mockedAxios.get.mockResolvedValueOnce({
      data: mockReport,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { url: '/api/interview/report/123' },
    });

    // Render the component for /report/123 inside a router
    render(
      <MemoryRouter initialEntries={['/report/123']}>
        <Routes>
          <Route path="/report/:id" element={<ReportDetails />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert: Loading UI is present before fetch completes
    expect(screen.getByText(/loading report/i)).toBeInTheDocument();

    // Wait for full report UI to appear and check for summary text and answers
    await waitFor(() => {
      expect(screen.getByText(/Full Interview Report/i)).toBeInTheDocument();
      expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument();
      expect(screen.getByText(/TypeScript is a typed superset/i)).toBeInTheDocument();
      expect(screen.getByText(/Problem-solving/i)).toBeInTheDocument();
    });
  });

  it('renders error message if API fails', async () => {
    // Arrange: Make axios.get reject (simulate network/error)
    mockedAxios.get.mockRejectedValueOnce(new Error('Fetch error'));

    // Render the component for /report/456 (does not matter, error will occur)
    render(
      <MemoryRouter initialEntries={['/report/456']}>
        <Routes>
          <Route path="/report/:id" element={<ReportDetails />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/report not found/i)).toBeInTheDocument();
    });
  });
});
