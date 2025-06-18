/**
 * JDInput.tsx
 * ----------------------------
 * This component allows the recruiter or user to input or paste a plain-text Job Description (JD).
 * After entering the JD, clicking "Start Interview" will store the JD in Redux state
 * and navigate to the Interview screen.
 * ----------------------------
 * Technologies used:
 * - React + TypeScript
 * - Bootstrap 5 for layout/styling
 * - React Router for navigation
 * - Redux for state management
 */

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setJD } from '../redux/interviewSlice'; // Action to save JD
import { useNavigate } from 'react-router-dom';    // Navigation hook

const JDInput: React.FC = () => {
  // Local state to store the JD text input
  const [jdText, setJdText] = useState('');

  const dispatch = useDispatch(); // Redux dispatch function
  const navigate = useNavigate(); // To navigate to /interview after JD is submitted

  // Handler when user clicks "Start Interview"
  const handleStart = () => {
    if (jdText.trim().length < 10) {
      alert('Please enter a more complete Job Description.');
      return;
    }

    // Save JD to Redux
    dispatch(setJD(jdText));

    // Navigate to Interview screen
    navigate('/interview');
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      {/* Centered Bootstrap card for the input */}
      <div className="card shadow p-4" style={{ maxWidth: '600px', width: '100%' }}>
        <h3 className="mb-3 text-center">AI Screening Interview</h3>

        {/* JD input label */}
        <label htmlFor="jdInput" className="form-label">
          Paste the Job Description
        </label>

        {/* Multiline textarea for entering the JD */}
        <textarea
          id="jdInput"
          className="form-control mb-3"
          rows={8}
          placeholder="Enter job description here..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        />

        {/* Start button triggers JD submission */}
        <button
          className="btn btn-primary w-100"
          onClick={handleStart}
        >
          Start Interview
        </button>
      </div>
    </div>
  );
};

export default JDInput;
