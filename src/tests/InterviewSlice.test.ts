import reducer, {
  InterviewState,
  setJD,
  nextQuestion,
  setAnswer,
  resetInterview
} from '../redux/interviewSlice';

describe('interviewSlice', () => {
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

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle setJD', () => {
    const newJD = "Frontend Developer at Acme";
    const nextState = reducer(initialState, setJD(newJD));
    expect(nextState.jd).toBe(newJD);
    expect(nextState).toMatchObject({
      ...initialState,
      jd: newJD
    });
  });

  it('should handle nextQuestion', () => {
    const nextState = reducer(initialState, nextQuestion());
    expect(nextState.currentQuestionIndex).toBe(1);
    // should not mutate original
    expect(initialState.currentQuestionIndex).toBe(0);
  });

  it('should handle setAnswer for an index', () => {
    // Add answer at position 2
    const payload = { index: 2, audio: 'audio-url', transcript: 'transcribed text' };
    const nextState = reducer(initialState, setAnswer(payload));
    expect(nextState.answers[2]).toEqual({
      audio: 'audio-url',
      transcript: 'transcribed text'
    });
    //answers array remains sparse if previous indices not-set
    expect(Array.isArray(nextState.answers)).toBe(true);
  });

  it('should overwrite answer if set multiple times for same index', () => {
    const first = reducer(initialState, setAnswer({ index: 1, audio: 'a1', transcript: 't1' }));
    const second = reducer(first, setAnswer({ index: 1, audio: 'a2', transcript: 't2' }));
    expect(second.answers[1]).toEqual({ audio: 'a2', transcript: 't2' });
  });

  it('should handle resetInterview, restoring to initial', () => {
    // Change several fields
    let state = reducer(initialState, setJD('changed'));
    state = reducer(state, nextQuestion());
    state = reducer(state, setAnswer({ index: 0, audio: 'xx', transcript: 'yy' }));
    const resetState = reducer(state, resetInterview());
    expect(resetState).toEqual(initialState);
  });

  it('nextQuestion increments even beyond questions.length', () => {
    let state = { ...initialState, currentQuestionIndex: initialState.questions.length };
    state = reducer(state, nextQuestion());
    expect(state.currentQuestionIndex).toBe(initialState.questions.length + 1);
  });
});
