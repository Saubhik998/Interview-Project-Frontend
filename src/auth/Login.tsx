import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../redux/authSlice';

// Login component: renders a simple email-based login form
const Login: React.FC = () => {
  // Local state for the email input field
  const [email, setEmail] = useState('');
  // Redux dispatch to update global auth state
  const dispatch = useDispatch();
  // Navigation hook to redirect after successful login
  const navigate = useNavigate();

  // Handler for form submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    dispatch(login(email)); // Dispatch login action with entered email
    navigate('/'); // Redirect user to the home/dashboard route
  };

  return (
    <div
      className="container d-flex flex-column justify-content-center align-items-center min-vh-100"
      style={{
        backgroundImage: 'url("/images/bg.png")', // Full-screen background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Login card with translucent overlay for readability */}
      <div
        className="shadow p-4"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)', // Translucent black background
          color: 'white', // White text for contrast
          borderRadius: '8px',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <h2 className="text-center mb-4">Login</h2>

        {/* Email login form */}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            {/* Controlled input for email field */}
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update state on input change
              required // HTML5 validation for required field
            />
          </div>

          {/* Submit button triggers handleLogin */}
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
