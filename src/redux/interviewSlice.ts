// src/redux/interviewSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define interview state structure
interface InterviewState {
  jd: string;
  questions: string[];
  currentQuestionIndex: number;
  answers: string[]; // Each answer maps to one question
}

//  Initial mock state (replace questions via backend later)
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

    // New: Set answer at specific index
    setAnswer: (state, action: PayloadAction<{ index: number; answer: string }>) => {
      const { index, answer } = action.payload;
      state.answers[index] = answer;
    },

    // Reset everything to initial state
    resetInterview: () => initialState,
  },
});

// Export actions and reducer
export const { setJD, nextQuestion, setAnswer, resetInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
