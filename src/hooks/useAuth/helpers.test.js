import { isTokenValid } from './helpers';
import { vi, describe, it, expect } from 'vitest';
import { jwtDecode } from 'jwt-decode';

vi.mock('jwt-decode');

describe('isTokenValid', () => {
  it('should return true for a valid token', () => {
    const token = 'valid-token';
    const decodedToken = { exp: Math.floor(Date.now() / 1000) + 1000 };

    jwtDecode.mockReturnValue(decodedToken);

    const result = isTokenValid(token);
    expect(result).toBe(true);
  });

  it('should return false for an expired token', () => {
    const token = 'expired-token';
    const decodedToken = { exp: Math.floor(Date.now() / 1000) - 1000 };

    jwtDecode.mockReturnValue(decodedToken);

    const result = isTokenValid(token);
    expect(result).toBe(false);
  });

  it('should return false if an error occurs while decoding the token', () => {
    const token = 'invalid-token';
    jwtDecode.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const result = isTokenValid(token);
    expect(result).toBe(false);
  });
});
