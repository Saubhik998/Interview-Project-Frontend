

import interviewReducer, {
  setJD,
  setAnswer,
  nextQuestion,
  resetInterview,
} from '../redux/interviewSlice';

describe('interviewSlice reducer', () => {
  const initialState = {
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

  it('should return the initial state', () => {
    expect(interviewReducer(undefined, { type: 'UNKNOWN_ACTION' })).toEqual(initialState);
  });

  it('should handle setJD', () => {
    const updated = interviewReducer(initialState, setJD('Software Engineer Role'));
    expect(updated.jd).toBe('Software Engineer Role');
  });

  it('should handle nextQuestion', () => {
    const updated = interviewReducer(initialState, nextQuestion());
    expect(updated.currentQuestionIndex).toBe(1);
  });

  it('should handle setAnswer', () => {
    const updated = interviewReducer(
      initialState,
      setAnswer({
        index: 0,
        audio: 'blob:http://example.com/audio1',
        transcript: 'This is my answer',
      })
    );
    expect(updated.answers[0]).toEqual({
      audio: 'blob:http://example.com/audio1',
      transcript: 'This is my answer',
    });
  });

  it('should handle resetInterview', () => {
    const modifiedState = {
      ...initialState,
      jd: 'Some JD',
      currentQuestionIndex: 3,
      answers: [{ audio: 'a', transcript: 't' }],
    };
    const reset = interviewReducer(modifiedState, resetInterview());
    expect(reset).toEqual(initialState);
  });
});
