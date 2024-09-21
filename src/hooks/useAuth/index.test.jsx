import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import AuthProvider from './AuthProvider';
import { toast } from 'react-toastify';
import fetcher from '@/fetchers';
import useAuth from './index';

vi.mock('@/fetchers');

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AuthProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log in successfully', async () => {
    const mockResponse = { data: { token: 'fake-token', user: { id: 1, name: 'Test User' } } };
    fetcher.post.mockResolvedValue(mockResponse);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(fetcher.post).toHaveBeenCalledWith('/auth/login', { login: 'test@example.com', password: 'password123' });

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.user).toEqual('test@example.com');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('token_jwt', 'fake-token');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('user-data', JSON.stringify('test@example.com'));
    expect(toast.success).toHaveBeenCalledWith('Usuário logado com sucesso');
  });

  it('should handle login error', async () => {
    fetcher.post.mockRejectedValueOnce(new Error('Login failed'));

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'wrong-password');
    });

    expect(fetcher.post).toHaveBeenCalledWith('/auth/login', { login: 'test@example.com', password: 'wrong-password' });
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBe(undefined);
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Erro ao fazer login. Tente novamente.');
  });

  it('should log out correctly', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBe(undefined);
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token_jwt');
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('user-data');
    expect(toast.success).toHaveBeenCalledWith('Logout realizado com sucesso!');
  });
});
