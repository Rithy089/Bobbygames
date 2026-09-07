// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
const auth = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
}));
vi.mock('../src/lib/supabase', () => ({ supabase: { auth } }));
import { authenticate } from '../src/features/auth-actions';
describe('auth API boundaries (mocked service)', () => {
  beforeEach(() => vi.resetAllMocks());
  it('signs in using email without placing it in public profile', async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });
    expect(
      await authenticate('login', 'test@example.invalid', 'long-password'),
    ).toBe('login');
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.invalid',
      password: 'long-password',
    });
  });
  it('handles confirmation required registration', async () => {
    auth.signUp.mockResolvedValue({ data: { session: null }, error: null });
    expect(
      await authenticate('signup', 'test@example.invalid', 'long-password'),
    ).toBe('authSuccess');
  });
  it('sends recovery to same-origin route and updates password', async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    expect(await authenticate('reset', 'test@example.invalid', '')).toBe(
      'authSuccess',
    );
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.invalid',
      { redirectTo: window.location.origin + '/reset-password' },
    );
    auth.updateUser.mockResolvedValue({ error: null });
    expect(await authenticate('password', '', 'long-password')).toBe('login');
  });
  it('shows a safe generic error on invalid credentials', async () => {
    auth.signInWithPassword.mockResolvedValue({
      error: { message: 'internal detail' },
    });
    await expect(
      authenticate('login', 'test@example.invalid', 'bad'),
    ).rejects.toThrow('authError');
  });
});
