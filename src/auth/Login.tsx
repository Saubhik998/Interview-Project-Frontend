// Login.tsx
// ---------------------------
// This component renders a simple login form for user authentication.
// It collects the user's email and dispatches a Redux login action.
// Upon successful submission, it navigates to the JDInput (home) page.

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../redux/authSlice';

const Login: React.FC = () => {
  // Local state to manage the input email value
  const [email, setEmail] = useState('');

  // Redux dispatcher to send login action
  const dispatch = useDispatch();

  // React Router hook to navigate after login
  const navigate = useNavigate();

  /**
   * Handles form submission
   * - Prevents default form behavior
   * - Dispatches the email to Redux using `login` action
   * - Redirects the user to the home page (JDInput)
   */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(email)); // Save email in Redux global state
    navigate('/');          // Redirect to job description input page
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
      {/* Login card */}
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Login</h2>

        {/* Login form */}
        <form onSubmit={handleLogin}>
          {/* Email input field */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Submit button */}
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
