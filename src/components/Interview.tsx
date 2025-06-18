/**
 * Interview.tsx
 * -------------------------------------------------------
 * Handles AI interview flow:
 * - Speaks each question using female TTS
 * - Shows TTS animation while speaking
 * - Starts 10-minute timer after TTS
 * - Records audio answer with mic animation
 * - Auto-saves answer and moves to next
 * - Navigates to report page at the end
 * -------------------------------------------------------
 */

import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { setAnswer } from '../redux/interviewSlice';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Interview.module.css'; // 🎨 CSS module for animations

const Interview: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { questions } = useSelector((state: RootState) => state.interview);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timer, setTimer] = useState(600); // 10-minute countdown

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  /**
   * Text-to-Speech: Reads question aloud using a female voice
   */
  const speakQuestion = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1.2;

    // Try to select a female voice if available
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(
      (v) =>
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('samantha') || // macOS
        v.name.toLowerCase().includes('zira') ||     // Windows
        v.name.toLowerCase().includes('google us english') // Chrome
    );
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsRecording(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setTimer(600);
      startRecording();
    };

    window.speechSynthesis.cancel(); // Prevent overlap
    window.speechSynthesis.speak(utterance);
  };

  /**
   * Trigger TTS when question changes
   */
  useEffect(() => {
    if (currentQuestionIndex < questions.length) {
      // Some browsers require wait for voices to load
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = () =>
          speakQuestion(questions[currentQuestionIndex]);
      } else {
        speakQuestion(questions[currentQuestionIndex]);
      }
    } else {
      navigate('/report');
    }
  }, [currentQuestionIndex]);

  /**
   * Countdown timer runs only while recording
   */
  useEffect(() => {
    if (isSpeaking || !isRecording) return;

    if (timer <= 0) {
      stopRecording();
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, isSpeaking, isRecording]);

  /**
   * Start mic recording
   */
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
      console.error('🎙️ Microphone access denied:', err);
    }
  };

  /**
   * Stop mic and go to next question
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  /**
   * Format time as MM:SS
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="container my-5">
      <div className="card shadow p-4">
        <h3 className="mb-4 text-center">Interview In Progress</h3>

        {/* Question text */}
        <div className="mb-4">
          <h5>Question {currentQuestionIndex + 1} of {questions.length}</h5>
          <p className="lead">{questions[currentQuestionIndex]}</p>
        </div>

        {/* Timer and Speaking/Recording Status */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="badge bg-primary p-2 fs-6">
            Time Left: {formatTime(timer)}
          </span>

          <div className="d-flex align-items-center gap-3">
            {/* Speaking Animation */}
            {isSpeaking && (
              <div className={styles.speakingDots}>
                <span></span><span></span><span></span>
              </div>
            )}

            {/* Recording Animation */}
            {isRecording && !isSpeaking && (
              <div className={styles.recordingMic}></div>
            )}

            {/* Status Label */}
            <span className={`badge p-2 fs-6 ${
              isSpeaking ? 'bg-warning' :
              isRecording ? 'bg-success' :
              'bg-secondary'
            }`}>
              {isSpeaking ? 'Speaking...' : isRecording ? 'Recording...' : 'Waiting'}
            </span>
          </div>
        </div>

        {/* Skip to next manually */}
        <div className="text-end">
          <button
            className="btn btn-danger"
            onClick={stopRecording}
            disabled={!isRecording || isSpeaking}
          >
            Stop & Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Interview;
