import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock components used inside App
jest.mock('../components/JDInput', () => () => <div>JDInput Component</div>);
jest.mock('../components/Interview', () => () => <div>Interview Component</div>);
jest.mock('../components/Report', () => () => <div>Report Component</div>);
jest.mock('../components/PastReports', () => () => <div>PastReports Component</div>);
jest.mock('../components/Navbar', () => () => <div>Navbar Component</div>);
jest.mock('../components/ReportDetails', () => () => <div>ReportDetails Component</div>);
jest.mock('../auth/Login', () => () => <div>Login Component</div>);

// Mock ProtectedRoute to just render children for test simplicity
jest.mock('../auth/ProtectedRoute', () => ({ children }: { children: React.ReactNode }) => <>{children}</>);

describe('App Routing', () => {
  beforeEach(() => {
    // Reset any previous history state before each test
    window.history.pushState({}, '', '/');
  });

  it('renders Login component on /login route', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByText(/Login Component/i)).toBeInTheDocument();
  });

  it('renders Navbar and JDInput on / route', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(screen.getByText(/Navbar Component/i)).toBeInTheDocument();
    expect(screen.getByText(/JDInput Component/i)).toBeInTheDocument();
  });

  it('renders Interview component on /interview route', () => {
    window.history.pushState({}, '', '/interview');
    render(<App />);
    expect(screen.getByText(/Interview Component/i)).toBeInTheDocument();
  });

  it('renders Report component on /report route', () => {
    window.history.pushState({}, '', '/report');
    render(<App />);
    expect(screen.getByText(/Report Component/i)).toBeInTheDocument();
  });

  it('renders PastReports component on /reports route', () => {
    window.history.pushState({}, '', '/reports');
    render(<App />);
    expect(screen.getByText(/PastReports Component/i)).toBeInTheDocument();
  });

  it('renders ReportDetails component on /report/:id route', () => {
    window.history.pushState({}, '', '/report/123');
    render(<App />);
    expect(screen.getByText(/ReportDetails Component/i)).toBeInTheDocument();
  });
});
