/**
 * JDInput.tsx
 * ----------------------------
 * This component allows the recruiter or user to input or paste a plain-text Job Description (JD).
 * After entering the JD, clicking "Start Interview" will:
 * - Send JD to backend API (/api/interview/init)
 * - Store the JD in Redux
 * - Navigate to Interview screen
 * ----------------------------
 * Technologies used:
 * - React + TypeScript
 * - Axios for HTTP requests
 * - Redux for state management
 * - React Router for navigation
 * - Bootstrap 5 for layout/styling
 */

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setJD } from '../redux/interviewSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const JDInput: React.FC = () => {
  const [jdText, setJdText] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleStart = async () => {
    if (jdText.trim().length < 10) {
      alert('Please enter a more complete Job Description.');
      return;
    }

    try {
      // ✅ Send the JD to backend API
      const response = await axios.post('https://localhost:7080/api/interview/init', jdText, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Backend initialized interview:', response.data);

      // ✅ Save JD to Redux
      dispatch(setJD(jdText));

      // ✅ Navigate to Interview screen
      navigate('/interview');
    } catch (error) {
      console.error('Failed to initialize interview:', error);
      alert('Error: Could not connect to server.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ maxWidth: '600px', width: '100%' }}>
        <h3 className="mb-3 text-center">AI Screening Interview</h3>

        <label htmlFor="jdInput" className="form-label">
          Paste the Job Description
        </label>

        <textarea
          id="jdInput"
          className="form-control mb-3"
          rows={8}
          placeholder="Enter job description here..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        />

        <button className="btn btn-primary w-100" onClick={handleStart}>
          Start Interview
        </button>
      </div>
    </div>
  );
};

export default JDInput;
