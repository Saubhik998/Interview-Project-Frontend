import reducer, { AuthState, login, logout } from '../redux/authSlice';

describe('authSlice', () => {
  const initialState: AuthState = {
    isLoggedIn: false,
    email: '',
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle login', () => {
    const state = reducer(initialState, login('user@example.com'));
    expect(state.isLoggedIn).toBe(true);
    expect(state.email).toBe('user@example.com');
  });

  it('should handle logout', () => {
    const loggedInState: AuthState = { isLoggedIn: true, email: 'user@example.com' };
    const state = reducer(loggedInState, logout());
    expect(state.isLoggedIn).toBe(false);
    expect(state.email).toBe('');
  });

  it('should overwrite email on multiple logins', () => {
    let state = reducer(initialState, login('first@example.com'));
    expect(state.email).toBe('first@example.com');
    state = reducer(state, login('second@example.com'));
    expect(state.email).toBe('second@example.com');
    expect(state.isLoggedIn).toBe(true);
  });
});
