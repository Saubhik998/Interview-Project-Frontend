import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Report from '../components/Report';
import axios from '../api';

//  Mock axios
jest.mock('../api');
const mockedAxios = axios as jest.Mocked<typeof axios>;

//  Mock html2pdf so it doesn't try to run in JSDOM
jest.mock('html2pdf.js', () => ({
  __esModule: true,
  default: () => ({ set: () => ({ from: () => ({ save: () => {} }) }) })
}));

describe('Report Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure sessionId present so loading->fetch path
    localStorage.setItem('sessionId', '123');
  });

  it('renders loading state and then displays the report', async () => {
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

    mockedAxios.get.mockResolvedValueOnce({ data: mockReportData, status: 200 } as any);

    render(
      <MemoryRouter initialEntries={['/report']}>
        <Routes>
          <Route path="/report" element={<Report />} />
        </Routes>
      </MemoryRouter>
    );

    // initial loading
    expect(screen.getByText(/Loading report\.\.\./i)).toBeInTheDocument();

    // then report content
    await waitFor(() => {
      expect(screen.getByText(/Interview Summary Report/i)).toBeInTheDocument();
      expect(screen.getByText(/Full Stack Developer/i)).toBeInTheDocument();
      expect(screen.getByText(/React is a JavaScript library/i)).toBeInTheDocument();
      expect(screen.getByText(/Strong communication/i)).toBeInTheDocument();
    });
  });

  it('shows error message if fetching report fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
    localStorage.setItem('sessionId', '123');

    render(
      <MemoryRouter initialEntries={['/report']}>
        <Routes>
          <Route path="/report" element={<Report />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load report./i)).toBeInTheDocument();
    });
  });
});
