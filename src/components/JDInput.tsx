import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setJD } from '../redux/interviewSlice';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const JDInput: React.FC = () => {
  const [jdText, setJdText] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const email = useSelector((state: RootState) => state.auth.email);

  const handleStart = async () => {
    if (jdText.trim().length < 10) {
      alert('Please enter a more complete Job Description.');
      return;
    }

    if (!email) {
      alert('You must be logged in to start an interview.');
      return;
    }

    try {
      const response = await api.post('/interview/init', {
        email,
        jobDescription: jdText,
      });

      console.log('Backend initialized interview:', response.data);
      dispatch(setJD(jdText));
      navigate('/interview');
    } catch (error) {
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
      {/* JD card with translucent background */}
      <div
        className="shadow p-4"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)', // translucent black
          color: 'white',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '100%',
        }}
      >
        <h3 className="mb-3 text-center">AI Screening Interview</h3>

        <label htmlFor="jdInput" className="form-label">Paste the Job Description</label>

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
