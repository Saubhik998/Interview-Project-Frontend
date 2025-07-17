// Component for entering a Job Description and starting the AI interview
// Sends JD + email to the backend and navigates to the interview page

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setJD } from '../redux/interviewSlice';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Custom Axios instance for API calls

const JDInput: React.FC = () => {
  const [jdText, setJdText] = useState(''); // Local state for JD input
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const email = useSelector((state: RootState) => state.auth.email); // Get logged-in email from Redux

  // Handler to initiate interview session with backend
  const handleStart = async () => {
    // Validate JD input
    if (jdText.trim().length < 10) {
      alert('Please enter a more complete Job Description.');
      return;
    }

    // Ensure user is logged in
    if (!email) {
      alert('You must be logged in to start an interview.');
      return;
    }

    try {
      // Send job description and email to backend to initialize interview
      const response = await api.post('/interview/init', {
        email,
        jobDescription: jdText,
      });

      console.log('Backend initialized interview:', response.data);

      // Save JD in Redux and navigate to the Interview screen
      dispatch(setJD(jdText));
      navigate('/interview');
    } catch (error) {
      console.error('Failed to initialize interview:', error);
      alert('Error: Could not connect to server.');
    }
  };

  return (
    <div className="container d-flex justify-content-center mt-5">
      <div className="card shadow p-4" style={{ maxWidth: '600px', width: '100%' }}>
        <h3 className="mb-3 text-center">AI Screening Interview</h3>

        <label htmlFor="jdInput" className="form-label">Paste the Job Description</label>

        <textarea
          id="jdInput"
          className="form-control mb-3"
          rows={8}
          placeholder="Enter job description here..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)} // Update local state as user types
        />

        <button className="btn btn-primary w-100" onClick={handleStart}>
          Start Interview
        </button>
      </div>
    </div>
  );
};

export default JDInput;
