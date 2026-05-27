import { jwtDecode } from 'jwt-decode';

export const isTokenValid = (token) => {
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const getApiErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  if (data && typeof data.message === 'string') return data.message;
  return null;
};
