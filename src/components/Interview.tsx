import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Interview.module.css';
import axios from 'axios';

// ----------- Interfaces for backend API responses and payloads -----------

// Response shape for interview session initialization
interface InitResponse {
  message: string;
  sessionId: string;
  firstQuestion: string;
}

// Response shape when requesting the next interview question
interface QuestionResponse {
  index: number;
  question: string;
}

// Format for sending an answer to the backend
interface AnswerPayload {
  sessionId: string;
  question: string;
  audioBase64: string;
  transcript: string;
}

// ------------- Main Interview Component -------------
const Interview: React.FC = () => {
  // Routing/navigation hook from React Router
  const navigate = useNavigate();
  
  // From Redux: current user's email, and job description from setup
  const email = useSelector((s: RootState) => s.auth.email);
  const { jd } = useSelector((s: RootState) => s.interview);

  // Local state for handling session, questions, and flow
  const [sessionId, setSessionId] = useState<string>('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [timer, setTimer] = useState(600); // seconds per question

  // References for media and STT APIs, persist between renders
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  // ----------- On mount: initialize interview (request session and first question) -----------
  useEffect(() => {
    (async () => {
      try {
        // POST to backend. Pass email and job description. Expect sessionId and first question.
        const res = await axios.post<InitResponse>('http://pip-interviewerapi.personalbrandingcouncil.com/api/Interview/init', { email, jobDescription: jd });
        const { sessionId, firstQuestion } = res.data;
        setSessionId(sessionId);
        // Store in localStorage so we can retrieve this session later for the report
        localStorage.setItem('sessionId', sessionId);
        setCurrentQuestion(firstQuestion);
        setQuestions([firstQuestion]);
      } catch (err) {
        // If anything fails, show error and do not proceed
        console.error('Error initializing interview:', err);
        alert('Failed to start interview.');
      }
    })();
  }, [email, jd]);

  /*
    use browser SpeechSynthesis to read the current interview question aloud.
    When speaking ends, automatically trigger audio recording of applicant answer.
  */
  const speakQuestion = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.pitch = 1.2;
    utterance.rate = 1;
    // Try to use a female voice for friendliness if available
    const voices = speechSynthesis.getVoices();
    const female = voices.find(v => v.name.toLowerCase().includes('female'));
    if (female) utterance.voice = female;
    // Mark state as system is currently speaking (not recording)
    utterance.onstart = () => { setIsSpeaking(true); setIsRecording(false); };
    // When finished, switch to recording state and reset answer timer
    utterance.onend = () => { setIsSpeaking(false); setTimer(600); startRecording(); };
    // Ensure any other TTS is stopped
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  // Whenever the currentQuestion changes, first use TTS to read it, then start recording
  useEffect(() => {
    if (!currentQuestion) return;
    // If voices aren't loaded yet, react to voiceschanged event on Chrome/Edge
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.onvoiceschanged = () => speakQuestion(currentQuestion);
    } else {
      speakQuestion(currentQuestion);
    }
  }, [currentQuestion]);

  // Timer effect: as long as recording is ongoing and not TTS, decrement timer every sec
  useEffect(() => {
    if (isSpeaking || !isRecording) return;
    if (timer <= 0) { stopRecording(); return; }
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer, isSpeaking, isRecording]);

  // Utility: convert a Blob (audio) to base64 string for uploading
  const blobToBase64 = (b: Blob) =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onloadend = () => res((r.result as string).split(',')[1]);
      r.onerror = rej;
      r.readAsDataURL(b);
    });

  /*
    Called after TTS to record a user's answer.
    Also uses browser SpeechRecognition for live transcript if available.
   */
  const startRecording = async () => {
    // Defensive: Don't start if session not established or question blank/finished
    if (!sessionId || interviewEnded || !currentQuestion.trim()) {
      alert('Session not ready or interview done.');
      return;
    }
    try {
      // Audio: get user permission, set up MediaRecorder
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      transcriptRef.current = '';

      // Speech Recognition setup (Chrome/Safari/Edge)
      const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SR) {
        const recog = new SR();
        recog.lang = 'en-US';
        recog.continuous = true;
        recog.interimResults = false;
        // Build the transcript as user speaks
        recog.onresult = (e: any) => {
          transcriptRef.current = Array.from(e.results).map((r: any) => r[0].transcript).join(' ');
        };
        recog.onerror = () => console.error('STT error');
        recognitionRef.current = recog;
        recog.start();
      }

      // Collect audio data from MediaRecorder
      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      // When recording is stopped (by user or timeout):
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const base64 = await blobToBase64(blob);
        // Require a minimum length of audio to avoid blank/empty answers
        if (base64.length < 5000) {
          alert('Too short, please speak more.');
          return;
        }

        // Prepare answer for backend
        const payload: AnswerPayload = {
          sessionId,
          question: currentQuestion,
          audioBase64: base64,
          transcript: transcriptRef.current
        };

        try {
          // Upload answer
          await axios.post('http://pip-interviewerapi.personalbrandingcouncil.com/api/Interview/answer', payload);
          // Get the next interview question, if any
          const { data } = await axios.get<QuestionResponse>('http://pip-interviewerapi.personalbrandingcouncil.com/api/Interview/question', { params: { sessionId } });
          if (data.question) {
            // Continue to next question
            setCurrentQuestion(data.question);
            setQuestions(q => [...q, data.question]);
          } else {
            // All questions done
            completeInterview();
          }
        } catch (e: any) {
          // Special handling if backend signals end of questions
          if (e.response?.data?.error === 'No more questions.') completeInterview();
          else {
            console.error(e);
            alert('Error fetching next.');
          }
        }
        // Reset for next round
        chunksRef.current = [];
      };

      recorder.start();
      setIsRecording(true);
    } catch (e) {
      // If user rejects mic permissions or other error
      console.error('Recording error:', e);
    }
  };

  // Force end to both audio and transcript capture
  const stopRecording = () => {
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // Handle final interview completion: send status and route to report
  const completeInterview = async () => {
    try { await axios.post('http://pip-interviewerapi.personalbrandingcouncil.com/api/Interview/complete', null, { params: { sessionId } }); } catch { }
    setInterviewEnded(true);
    setCurrentQuestion('');
    alert('Interview finished!');
    navigate('/report');
  };

  // If no question and not ended, show a temporary loading state
  if (!currentQuestion && !interviewEnded) return <div>Loading…</div>;

  // Main UI render: question, timer, status badges, and record controls
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
            {/* Show current question number and text */}
            <div className="mb-4">
              <h5>Q{questions.length}:</h5>
              <p className="lead text-light">{currentQuestion}</p>
            </div>

            {/* Timer and status (speaking, recording, waiting) */}
            <div className="d-flex justify-content-between align-items-center">
              <span className="badge bg-primary p-2 fs-6">
                Time left: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
              </span>
              <div className="d-flex align-items-center gap-3">
                {/* Dots indicate system is speaking (TTS) */}
                {isSpeaking && <div className={styles.speakingDots}><span></span><span></span><span></span></div>}
                {/* Microphone icon indicates user should answer */}
                {isRecording && !isSpeaking && <div className={styles.recordingMic}></div>}
                {/* Badge shows current status */}
                <span className={`badge p-2 fs-6 ${isSpeaking ? 'bg-warning' : isRecording ? 'bg-success' : 'bg-secondary'}`}>
                  {isSpeaking ? 'Speaking...' : isRecording ? 'Recording...' : 'Waiting'}
                </span>
                {/* Button to stop recording; only enabled during answer */}
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
