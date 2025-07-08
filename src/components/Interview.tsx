import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Interview.module.css';
import axios from 'axios';

interface InitResponse {
  message: string;
  jd: string;
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
  const { jd } = useSelector((state: RootState) => state.interview);

  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timer, setTimer] = useState(600);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  // Initialize interview
  useEffect(() => {
    const initInterview = async () => {
      try {
        const res = await axios.post<InitResponse>('/api/interview/init', jd, {
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

  // Speak the current question
  const speakQuestion = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.pitch = 1.2;
    utterance.rate = 1;

    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(v =>
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('zira') ||
      v.name.toLowerCase().includes('google us english')
    );
    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsRecording(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setTimer(600);
      startRecording();
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (currentQuestion) {
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = () => speakQuestion(currentQuestion);
      } else {
        speakQuestion(currentQuestion);
      }
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (isSpeaking || !isRecording) return;

    if (timer <= 0) {
      stopRecording();
      return;
    }

    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, isSpeaking, isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      transcriptRef.current = '';

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

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const base64Audio = await blobToBase64(blob);

        const payload: AnswerPayload = {
          question: currentQuestion,
          audioBase64: base64Audio,
          transcript: transcriptRef.current
        };

        await axios.post('/api/interview/answer', payload);
        chunksRef.current = [];
        transcriptRef.current = '';

        // Fetch next question
        const res = await axios.get<QuestionResponse>('/api/interview/question');
        if (res.data?.question) {
          setCurrentQuestion(res.data.question);
          setQuestions(prev => [...prev, res.data.question]);
        } else {
          completeInterview();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const completeInterview = async () => {
    try {
      await axios.post('/api/interview/complete');
      navigate('/report');
    } catch (err) {
      console.error('Error completing interview:', err);
    }
  };

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

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (!currentQuestion)
    return <div className="container p-5 text-center">Loading interview...</div>;

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
