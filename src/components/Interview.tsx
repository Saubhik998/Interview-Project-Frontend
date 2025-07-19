import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Interview.module.css';
import api from '../api';

interface InitResponse {
  message: string;
  sessionId: string;
  firstQuestion: string;
}

interface QuestionResponse {
  index: number;
  question: string;
}

interface AnswerPayload {
  sessionId: string;
  question: string;
  audioBase64: string;
  transcript: string;
}

const Interview: React.FC = () => {
  const navigate = useNavigate();
  const email = useSelector((s: RootState) => s.auth.email);
  const { jd } = useSelector((s: RootState) => s.interview);

  const [sessionId, setSessionId] = useState<string>('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [timer, setTimer] = useState(600);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.post<InitResponse>('/interview/init', { email, jobDescription: jd });
        const { sessionId, firstQuestion } = res.data;
        setSessionId(sessionId);
        localStorage.setItem('sessionId', sessionId);
        setCurrentQuestion(firstQuestion);
        setQuestions([firstQuestion]);
      } catch (err) {
        console.error('Error initializing interview:', err);
        alert('Failed to start interview.');
      }
    })();
  }, [email, jd]);

  const speakQuestion = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.pitch = 1.2;
    utterance.rate = 1;
    const voices = speechSynthesis.getVoices();
    const female = voices.find(v => v.name.toLowerCase().includes('female'));
    if (female) utterance.voice = female;
    utterance.onstart = () => { setIsSpeaking(true); setIsRecording(false); };
    utterance.onend = () => { setIsSpeaking(false); setTimer(600); startRecording(); };
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!currentQuestion) return;
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.onvoiceschanged = () => speakQuestion(currentQuestion);
    } else {
      speakQuestion(currentQuestion);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (isSpeaking || !isRecording) return;
    if (timer <= 0) { stopRecording(); return; }
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer, isSpeaking, isRecording]);

  const blobToBase64 = (b: Blob) =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onloadend = () => res((r.result as string).split(',')[1]);
      r.onerror = rej;
      r.readAsDataURL(b);
    });

  const startRecording = async () => {
    if (!sessionId || interviewEnded || !currentQuestion.trim()) {
      alert('Session not ready or interview done.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      transcriptRef.current = '';

      const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SR) {
        const recog = new SR();
        recog.lang = 'en-US';
        recog.continuous = true;
        recog.interimResults = false;
        recog.onresult = (e: any) => {
          transcriptRef.current = Array.from(e.results).map((r: any) => r[0].transcript).join(' ');
        };
        recog.onerror = () => console.error('STT error');
        recognitionRef.current = recog;
        recog.start();
      }

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const base64 = await blobToBase64(blob);
        if (base64.length < 5000) {
          alert('Too short, please speak more.');
          return;
        }

        const payload: AnswerPayload = {
          sessionId,
          question: currentQuestion,
          audioBase64: base64,
          transcript: transcriptRef.current
        };

        try {
          await api.post('/interview/answer', payload);
          const { data } = await api.get<QuestionResponse>('/interview/question', { params: { sessionId } });
          if (data.question) {
            setCurrentQuestion(data.question);
            setQuestions(q => [...q, data.question]);
          } else {
            completeInterview();
          }
        } catch (e: any) {
          if (e.response?.data?.error === 'No more questions.') completeInterview();
          else {
            console.error(e);
            alert('Error fetching next.');
          }
        }

        chunksRef.current = [];
      };

      recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error('Recording error:', e);
    }
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const completeInterview = async () => {
    try { await api.post('/interview/complete', null, { params: { sessionId } }); } catch { }
    setInterviewEnded(true);
    setCurrentQuestion('');
    alert('Interview finished!');
    navigate('/report');
  };

  if (!currentQuestion && !interviewEnded) return <div>Loading…</div>;

  return (
    <div
      className="container-fluid d-flex flex-column justify-content-center align-items-center min-vh-100"
      style={{
        backgroundImage: 'url("/images/bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        padding: '2rem'
      }}
    >
      <div
        className="p-4 shadow"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '800px'
        }}
      >
        <h3 className="mb-4 text-center">Interview In Progress</h3>

        {!interviewEnded && (
          <>
            <div className="mb-4">
              <h5>Q{questions.length}:</h5>
              <p className="lead text-light">{currentQuestion}</p>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <span className="badge bg-primary p-2 fs-6">
                Time left: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
              </span>
              <div className="d-flex align-items-center gap-3">
                {isSpeaking && <div className={styles.speakingDots}><span></span><span></span><span></span></div>}
                {isRecording && !isSpeaking && <div className={styles.recordingMic}></div>}
                <span className={`badge p-2 fs-6 ${isSpeaking ? 'bg-warning' : isRecording ? 'bg-success' : 'bg-secondary'}`}>
                  {isSpeaking ? 'Speaking...' : isRecording ? 'Recording...' : 'Waiting'}
                </span>
                <button className="btn btn-danger ms-3" onClick={stopRecording} disabled={!isRecording || isSpeaking}>
                  Stop & Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Interview;
