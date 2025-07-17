import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the structure for each answer
interface Answer {
  audio: string;       // URL to recorded audio
  transcript: string;  // Transcribed text
}

// ✅ Export this interface so it can be used elsewhere
export interface InterviewState {
  jd: string;
  questions: string[];
  currentQuestionIndex: number;
  answers: Answer[];
}

// Initial mock state (replace questions via backend later)
const initialState: InterviewState = {
  jd: '',
  questions: [
    "Tell me about yourself.",
    "What are your strengths?",
    "Why do you want this job?",
    "Describe a challenge you faced.",
    "Where do you see yourself in 5 years?",
  ],
  currentQuestionIndex: 0,
  answers: [],
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setJD: (state, action: PayloadAction<string>) => {
      state.jd = action.payload;
    },
    nextQuestion: (state) => {
      state.currentQuestionIndex += 1;
    },
    setAnswer: (
      state,
      action: PayloadAction<{ index: number; audio: string; transcript: string }>
    ) => {
      const { index, audio, transcript } = action.payload;
      state.answers[index] = { audio, transcript };
    },
    resetInterview: () => initialState,
  },
});

export const { setJD, nextQuestion, setAnswer, resetInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
