import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Report from '../components/Report';
import axios from '../api';

// ----------------------------
// Mock axios instance so we can control API responses
// ----------------------------
jest.mock('../api');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// ----------------------------
// Mock html2pdf so PDF code does not run in test environment (JSDOM)
// ----------------------------
jest.mock('html2pdf.js', () => ({
  __esModule: true,
  default: () => ({ set: () => ({ from: () => ({ save: () => {} }) }) })
}));

// ----------------------------
// Main test suite for Report
// ----------------------------
describe('Report Component', () => {
  beforeEach(() => {
    // Reset mocks before every test, and ensure a sessionId exists in localStorage
    jest.clearAllMocks();
    localStorage.setItem('sessionId', '123');
  });

  it('renders loading state and then displays the report', async () => {
    // Mock backend API data for happy-path test
    const mockReportData = {
      jd: 'Full Stack Developer',
      score: 87,
      questions: ['What is React?', 'Explain Node.js'],
      answers: [
        { question: 'What is React?', transcript: 'React is a JavaScript library for building UIs.' },
        { question: 'Explain Node.js', transcript: 'Node.js is a runtime for executing JavaScript on the server.' }
      ],
      strengths: ['Strong communication', 'Deep technical knowledge'],
      improvements: ['Expand on backend topics'],
      followUps: ['Ask about database optimization'],
    };

    // Simulate GET /interview/report resolving with the above data
    mockedAxios.get.mockResolvedValueOnce({ data: mockReportData, status: 200 } as any);

    // Render Report via /report route in a memory router context
    render(
      <MemoryRouter initialEntries={['/report']}>
        <Routes>
          <Route path="/report" element={<Report />} />
        </Routes>
      </MemoryRouter>
    );

    // Loading spinner/text should be present immediately
    expect(screen.getByText(/Loading report\.\.\./i)).toBeInTheDocument();

    // Wait for the real content to appear, displaying all fetched sections
    await waitFor(() => {
      expect(screen.getByText(/Interview Summary Report/i)).toBeInTheDocument();
      expect(screen.getByText(/Full Stack Developer/i)).toBeInTheDocument();
      expect(screen.getByText(/React is a JavaScript library/i)).toBeInTheDocument();
      expect(screen.getByText(/Strong communication/i)).toBeInTheDocument();
    });
  });

  it('shows error message if fetching report fails', async () => {
    // Simulate API call failure
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
    localStorage.setItem('sessionId', '123');

    // Render as before
    render(
      <MemoryRouter initialEntries={['/report']}>
        <Routes>
          <Route path="/report" element={<Report />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the error UI to display
    await waitFor(() => {
      expect(screen.getByText(/Failed to load report./i)).toBeInTheDocument();
    });
  });
});
