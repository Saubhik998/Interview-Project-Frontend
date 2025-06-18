// src/redux/interviewSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the structure for each answer
interface Answer {
  audio: string;       // URL to recorded audio
  transcript: string;  // Transcribed text
}

// Define interview state structure
interface InterviewState {
  jd: string;
  questions: string[];
  currentQuestionIndex: number;
  answers: Answer[]; // Now stores audio + transcript per question
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
  answers: [], // Initially empty
};

// Create the interview slice with reducers
const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    // Save the job description
    setJD: (state, action: PayloadAction<string>) => {
      state.jd = action.payload;
    },

    // Move to the next question
    nextQuestion: (state) => {
      state.currentQuestionIndex += 1;
    },

    // Set answer at specific index with audio and transcript
    setAnswer: (
      state,
      action: PayloadAction<{ index: number; audio: string; transcript: string }>
    ) => {
      const { index, audio, transcript } = action.payload;
      state.answers[index] = { audio, transcript };
    },

    // Reset interview state
    resetInterview: () => initialState,
  },
});

// Export actions and reducer
export const { setJD, nextQuestion, setAnswer, resetInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
