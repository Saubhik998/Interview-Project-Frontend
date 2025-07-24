import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setJD } from '../redux/interviewSlice';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/*
  JDInput component
  Lets the user paste or write a Job Description.
  Validates the input and talks to the backend to start the interview session.
*/
const JDInput: React.FC = () => {
  // Local state: stores the textarea value
  const [jdText, setJdText] = useState('');

  // Redux dispatch function and router navigation
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Get the user email from the store (user must be logged in)
  const email = useSelector((state: RootState) => state.auth.email);

  /*
    Handles Start Interview button click:
    - Validates input length and login status
    - Calls backend to start interview session
    - Stores JD to Redux so next pages can use
    - Redirects user to the interview screen
  */
  const handleStart = async () => {
    // Check for non-trivial JD input
    if (jdText.trim().length < 10) {
      alert('Please enter a more complete Job Description.');
      return;
    }

    // User must be logged in (email should exist)
    if (!email) {
      alert('You must be logged in to start an interview.');
      return;
    }

    try {
      // POST job description and email to backend
      const response = await api.post('/interview/init', {
        email,
        jobDescription: jdText,
      });

      // Save Job Description to Redux store
      dispatch(setJD(jdText));
      // Go to the main interview screen
      navigate('/interview');
    } catch (error) {
      // Handle any failure in API or network
      console.error('Failed to initialize interview:', error);
      alert('Error: Could not connect to server.');
    }
  };

  return (
    <div
      className="container d-flex flex-column justify-content-center align-items-center min-vh-100"
      style={{
        backgroundImage: 'url("/images/bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Main card with background */}
      <div
        className="shadow p-4"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)', // semi-transparent black
          color: 'white',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '100%',
        }}
      >
        <h3 className="mb-3 text-center">AI Screening Interview</h3>

        {/* Input for Job Description */}
        <label htmlFor="jdInput" className="form-label">Paste the Job Description</label>

        <textarea
          id="jdInput"
          className="form-control mb-3"
          rows={8}
          placeholder="Enter job description here..."
          value={jdText}
          onChange={e => setJdText(e.target.value)} // Keep input synced with state
        />

        {/* Action button */}
        <button className="btn btn-primary w-100" onClick={handleStart}>
          Start Interview
        </button>
      </div>
    </div>
  );
};

export default JDInput;
