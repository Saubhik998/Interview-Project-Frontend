import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Interview.module.css';
import api from '../api';

// --- Interfaces for API responses ---
interface InitResponse {
  message: string;
  jobDescription: string;
  firstQuestion: string;
}

interface QuestionResponse {
  index: number;
  question: string;
}

interface AnswerPayload {
  question: string;
  audioBase64: string;
  transcript: string;
}

const Interview: React.FC = () => {
  const navigate = useNavigate();
  const email = useSelector((state: RootState) => state.auth.email);
  const { jd } = useSelector((state: RootState) => state.interview);

  // --- Component state ---
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes max per question

  // --- References ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  // --- Initialize interview session ---
  useEffect(() => {
    const initInterview = async () => {
      try {
        const res = await api.post<InitResponse>('/interview/init', {
          email,
          jobDescription: jd,
        }, {
          headers: { 'Content-Type': 'application/json' }
        });

        const first = res.data.firstQuestion;
        setCurrentQuestion(first);
        setQuestions([first]);
      } catch (err) {
        console.error('Error initializing interview:', err);
        alert('Failed to start interview.');
      }
    };

    initInterview();
  }, []);

  // --- Speak question aloud using Web Speech API ---
  const speakQuestion = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.pitch = 1.2;
    utterance.rate = 1;

    // Try to choose a natural-sounding female voice
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(v =>
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('zira') ||
      v.name.toLowerCase().includes('google us english')
    );
    if (femaleVoice) utterance.voice = femaleVoice;

    // Handle speech events
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsRecording(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setTimer(600); // Reset timer
      startRecording(); // Start capturing answer
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  // --- When question changes, speak it ---
  useEffect(() => {
    if (currentQuestion) {
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = () => speakQuestion(currentQuestion);
      } else {
        speakQuestion(currentQuestion);
      }
    }
  }, [currentQuestion]);

  // --- Countdown logic while recording ---
  useEffect(() => {
    if (isSpeaking || !isRecording) return;
    if (timer <= 0) {
      stopRecording(); // Auto-stop when time runs out
      return;
    }

    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, isSpeaking, isRecording]);

  // --- Start audio and speech-to-text recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      transcriptRef.current = '';

      // Start Speech Recognition (STT)
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const text = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join(' ');
          transcriptRef.current = text;
        };

        recognition.onerror = (e: any) => console.error('STT error:', e.error);
        recognitionRef.current = recognition;
        recognition.start();
      }

      // Collect audio data
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      // After recording stops, send answer and get next question
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const base64Audio = await blobToBase64(blob);

        const payload: AnswerPayload = {
          question: currentQuestion,
          audioBase64: base64Audio,
          transcript: transcriptRef.current
        };

        await api.post('/interview/answer', payload);

        // Reset buffer
        chunksRef.current = [];
        transcriptRef.current = '';

        // Fetch next question
        const res = await api.get<QuestionResponse>('/interview/question');
        if (res.data?.question) {
          setCurrentQuestion(res.data.question);
          setQuestions(prev => [...prev, res.data.question]);
        } else {
          completeInterview(); // No more questions
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
    }
  };

  // --- Stop recording audio and transcription ---
  const stopRecording = () => {
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // --- Finalize interview and redirect to report ---
  const completeInterview = async () => {
    try {
      await api.post('/interview/complete');
      navigate('/report');
    } catch (err) {
      console.error('Error completing interview:', err);
    }
  };

  // --- Utility: Convert Blob to Base64 ---
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // --- Format seconds into mm:ss ---
  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // --- Loading state ---
  if (!currentQuestion)
    return <div className="container p-5 text-center">Loading interview...</div>;

  // --- Main UI ---
  return (
    <div className="container my-5">
      <div className="card shadow p-4">
        <h3 className="mb-4 text-center">Interview In Progress</h3>

        <div className="mb-4">
          <h5>Question {questions.length}</h5>
          <p className="lead">{currentQuestion}</p>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="badge bg-primary p-2 fs-6">
            Time Left: {formatTime(timer)}
          </span>

          <div className="d-flex align-items-center gap-3">
            {isSpeaking && <div className={styles.speakingDots}><span></span><span></span><span></span></div>}
            {isRecording && !isSpeaking && <div className={styles.recordingMic}></div>}
            <span className={`badge p-2 fs-6 ${
              isSpeaking ? 'bg-warning' : isRecording ? 'bg-success' : 'bg-secondary'
            }`}>
              {isSpeaking ? 'Speaking...' : isRecording ? 'Recording...' : 'Waiting'}
            </span>
          </div>
        </div>

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
