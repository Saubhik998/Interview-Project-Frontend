import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from '../App';
import store from '../redux/store';

describe('App Component', () => {
  test('renders without crashing and shows login screen elements', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    // ✅ Check for login heading (e.g., <h2>Login</h2>)
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();

    // ✅ Check for login button (e.g., <button>Login</button>)
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
});
