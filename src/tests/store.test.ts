import store, { RootState } from '../redux/store';

describe('Redux Store', () => {
  it('should initialize with the expected slices', () => {
    const state = store.getState();

    // Check that both 'auth' and 'interview' slices are present
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('interview');
  });

  it('should allow dispatching actions to slices', () => {
    // This tests dispatching to both slices with dummy actions
    // You would replace with real actions if available.
    const testAuthAction = { type: 'auth/login', payload: { user: 'test' } };
    const testInterviewAction = { type: 'interview/start', payload: { sessionId: 'abc' } };

    store.dispatch(testAuthAction as any);
    store.dispatch(testInterviewAction as any);

    // Check that state is still accessible and slices exist
    expect(store.getState()).toHaveProperty('auth');
    expect(store.getState()).toHaveProperty('interview');
  });

  it('RootState type matches actual store state', () => {
    // Type checks only: this verifies the exported RootState is consistent
    const state: RootState = store.getState();
    expect(state).toEqual(store.getState());
  });
});
