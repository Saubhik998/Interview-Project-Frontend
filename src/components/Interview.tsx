/**
 * Interview.tsx
 * --------------------------------------------
 * This component handles the live AI interview:
 * - Plays each question
 * - Starts 2-minute countdown timer for answering
 * - Records candidate audio via microphone
 * - Auto-submits answer and moves to next question
 * - Ends with navigation to Report page
 * --------------------------------------------
 */

import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { setAnswer } from '../redux/interviewSlice';
import { useNavigate } from 'react-router-dom';

const Interview: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { questions } = useSelector((state: RootState) => state.interview);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(120); // 2-minute timer per question
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  //  Countdown Timer Logic (decrements every second)
  useEffect(() => {
    if (timer <= 0) {
      stopRecording(); // Stop and move to next question
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  //  Automatically start recording when question loads
  useEffect(() => {
    if (currentQuestionIndex < questions.length) {
      setTimer(120); // Reset timer
      startRecording(); // Start recording audio
    } else {
      navigate('/report'); // All questions done → Show report
    }
  }, [currentQuestionIndex]);

  // 🎤 Start recording candidate answer
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(blob);
        dispatch(setAnswer({ index: currentQuestionIndex, answer: audioURL }));
        chunksRef.current = [];
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to access microphone:', err);
    }
  };

  //  Stop recording and move to next question
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  //  Format timer MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="container my-5">
      <div className="card shadow p-4">
        <h3 className="mb-4 text-center">Interview In Progress</h3>

        {/* Question display */}
        <div className="mb-4">
          <h5>
            Question {currentQuestionIndex + 1} of {questions.length}
          </h5>
          <p className="lead">{questions[currentQuestionIndex]}</p>
        </div>

        {/* Timer and recording status */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="badge bg-primary p-2 fs-6">
            Time Left: {formatTime(timer)}
          </span>
          <span className={`badge p-2 fs-6 ${isRecording ? 'bg-success' : 'bg-secondary'}`}>
            {isRecording ? 'Recording...' : 'Stopped'}
          </span>
        </div>

        {/* Stop button (for manual skip) */}
        <div className="text-end">
          <button
            className="btn btn-danger"
            onClick={stopRecording}
            disabled={!isRecording}
          >
            Stop & Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Interview;
