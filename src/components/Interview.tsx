import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Interview.module.css';
import axios from 'axios';

// ----------- Interfaces for backend API responses and payloads -----------

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

// ------------- Main Interview Component -------------

const Interview: React.FC = () => {
  const navigate = useNavigate();

  // Redux state
  const email = useSelector((s: RootState) => s.auth.email);
  const { jd } = useSelector((s: RootState) => s.interview);

  // Local state
  const [sessionId, setSessionId] = useState<string>('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [timer, setTimer] = useState(600); // seconds per question

  // Refs for media & speech recognition
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  // Silence detection refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const skipDueToSilenceRef = useRef(false);

  // On component mount: initialize interview session
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.post<InitResponse>(
          'http://pip-interviewerapi.personalbrandingcouncil.com/api/Interview/init',
          { email, jobDescription: jd }
        );
        setSessionId(res.data.sessionId);
        localStorage.setItem('sessionId', res.data.sessionId);
        setCurrentQuestion(res.data.firstQuestion);
        setQuestions([res.data.firstQuestion]);
      } catch (err) {
        console.error('Error initializing interview:', err);
        alert('Failed to start interview.');
      }
    })();
  }, [email, jd]);

  // Use SpeechSynthesis to read the current question aloud
  const speakQuestion = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.pitch = 1.2;
    utterance.rate = 1;

    const voices = speechSynthesis.getVoices();
    const female = voices.find((v) => v.name.toLowerCase().includes('female'));
    if (female) utterance.voice = female;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsRecording(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setTimer(600); // reset timer
      startRecording();
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  // When currentQuestion changes, trigger TTS and then recording
  useEffect(() => {
    if (!currentQuestion) return;

    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.onvoiceschanged = () => speakQuestion(currentQuestion);
    } else {
      speakQuestion(currentQuestion);
    }
  }, [currentQuestion]);

  // Timer countdown while recording (and not speaking)
  useEffect(() => {
    if (isSpeaking || !isRecording) return;

    if (timer <= 0) {
      stopRecording();
      return;
    }

    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, isSpeaking, isRecording]);

  // Convert Blob to base64 string
  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  // Silence detection logic: check every 100ms if volume is below threshold
  function checkForSilence(
    analyser: AnalyserNode,
    stopFn: () => void,
    skipFn: () => void
  ) {
    const data = new Uint8Array(analyser.fftSize);
    let silentTicks = 0;
    const threshold = 0.06; // Adjust if necessary

    function analyze() {
      analyser.getByteTimeDomainData(data);
      const amplitude =
        data.reduce((sum, v) => sum + Math.abs(v - 128) / 128, 0) / data.length;

      if (amplitude < threshold) {
        silentTicks++;
      } else {
        silentTicks = 0;
      }

      if (silentTicks >= 50) {
        // 50 * 100ms = 5 seconds of silence detected
        stopFn();
        skipFn();
        return;
      }

      silenceTimeoutRef.current = setTimeout(analyze, 100);
    }

    analyze();
  }

  // Start recording audio and initialize silence detection
  const startRecording = async () => {
    if (!sessionId || interviewEnded || !currentQuestion.trim()) {
      alert('Session not ready or interview has ended.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      transcriptRef.current = '';

      // Setup speech recognition
      const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SR) {
        const recog = new SR();
        recog.lang = 'en-US';
        recog.continuous = true;
        recog.interimResults = false;
        recog.onresult = (e: any) => {
          transcriptRef.current = Array.from(e.results)
            .map((r: any) => r[0].transcript)
            .join(' ');
        };
        recog.onerror = () => console.error('Speech recognition error');
        recognitionRef.current = recog;
        recog.start();
      }

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        if (audioContextRef.current) {
          await audioContextRef.current.close();
          audioContextRef.current = null;
        }

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const base64 = await blobToBase64(blob);

        // If audio too short and not skipped due to silence, ask to speak more
        if (base64.length < 5000 && !skipDueToSilenceRef.current) {
          alert('Too short, please speak more.');
          return;
        }

        const payload: AnswerPayload = {
          sessionId,
          question: currentQuestion,
          audioBase64: base64,
          transcript: transcriptRef.current,
        };

        try {
          await axios.post(
            'http://pip-interviewerapi.personalbrandingcouncil.com/api/Interview/answer',
            payload
          );

          const { data } = await axios.get<QuestionResponse>(
            'http://pip-interviewerapi.personalbrandingcouncil.com/api/Interview/question',
            { params: { sessionId } }
          );

          if (data.question) {
            setCurrentQuestion(data.question);
            setQuestions((q) => [...q, data.question]);
          } else {
            completeInterview();
          }
        } catch (e: any) {
          if (e.response?.data?.error === 'No more questions.') {
            completeInterview();
          } else {
            console.error(e);
            alert('Error fetching next.');
          }
        }

        skipDueToSilenceRef.current = false;
        chunksRef.current = [];
      };

      // Setup Web Audio API for silence detection
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;
      sourceRef.current = source;

      skipDueToSilenceRef.current = false;

      checkForSilence(
        analyser,
        () => stopRecording(),
        () => moveToNextQuestionDueToSilence()
      );

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
      alert('Microphone access denied or error occurred.');
    }
  };

  // Stop recording and clean up audio context and silence detection
  const stopRecording = () => {
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
    setIsRecording(false);

    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  // Called when silence detected: skip to next question automatically
  const moveToNextQuestionDueToSilence = () => {
    skipDueToSilenceRef.current = true;
    stopRecording();
  };

  // Complete the interview and navigate to report page
  const completeInterview = async () => {
    try {
      await axios.post(
        'http://pip-interviewerapi.personalbrandingcouncil.com/api/Interview/complete',
        null,
        { params: { sessionId } }
      );
    } catch {
      // ignore errors here
    }
    setInterviewEnded(true);
    setCurrentQuestion('');
    navigate('/report');
  };

  if (!currentQuestion && !interviewEnded) {
    return <div>Loading…</div>;
  }

  return (
    <div
      className="container-fluid d-flex flex-column justify-content-center align-items-center min-vh-100"
      style={{
        backgroundImage: 'url("/images/bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        padding: '2rem',
      }}
    >
      <div
        className="p-4 shadow"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '800px',
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
                Time left: {Math.floor(timer / 60)}:
                {String(timer % 60).padStart(2, '0')}
              </span>

              <div className="d-flex align-items-center gap-3">
                {/* Dots indicate system is speaking (TTS) */}
                {isSpeaking && (
                  <div className={styles.speakingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}

                {/* Microphone icon indicates user should answer */}
                {isRecording && !isSpeaking && (
                  <div className={styles.recordingMic}></div>
                )}

                {/* Badge shows current status */}
                <span
                  className={`badge p-2 fs-6 ${
                    isSpeaking ? 'bg-warning' : isRecording ? 'bg-success' : 'bg-secondary'
                  }`}
                >
                  {isSpeaking
                    ? 'Speaking...'
                    : isRecording
                    ? 'Recording...'
                    : 'Waiting'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Interview;
