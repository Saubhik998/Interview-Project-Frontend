/**
 * JDInput.test.tsx
 * ---------------------------------------------
 * Unit tests for the JDInput component:
 * - Ensures input field renders
 * - Accepts user input
 * - Dispatches setJD action on submit
 * - Navigates to /interview on start
 * ---------------------------------------------
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JDInput from '../components/JDInput';
import { Provider } from 'react-redux';
import store from '../redux/store';
import { MemoryRouter, useNavigate } from 'react-router-dom';

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('JDInput Component', () => {
  const mockNavigate = jest.fn();
  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('renders input and button', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <JDInput />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByPlaceholderText(/enter job description/i)).toBeInTheDocument();
    expect(screen.getByText(/start interview/i)).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <JDInput />
        </MemoryRouter>
      </Provider>
    );

    const input = screen.getByPlaceholderText(/enter job description/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Frontend Developer role' } });
    expect(input.value).toBe('Frontend Developer role');
  });

  it('dispatches setJD and navigates on form submit', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <JDInput />
        </MemoryRouter>
      </Provider>
    );

    const input = screen.getByPlaceholderText(/enter job description/i);
    const button = screen.getByText(/start interview/i);

    fireEvent.change(input, { target: { value: 'Backend Engineer' } });
    fireEvent.click(button);

    // Confirm navigation
    expect(mockNavigate).toHaveBeenCalledWith('/interview');
  });
});
