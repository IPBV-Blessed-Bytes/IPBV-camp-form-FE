import axios from 'axios';
import authFetcher from '@/fetchers/fetcherWithCredentials';

const getClientIp = async () => {
  try {
    const { data } = await axios.get('https://api.ipify.org?format=json');
    return data.ip;
  } catch {
    return null;
  }
};

export const listLogs = async () => {
  const { data } = await authFetcher.get('/logs');
  return data;
};

export const deleteAllLogs = async () => {
  const { data } = await authFetcher.delete('/logs');
  return data;
};

export const registerLog = async (message, user) => {
  try {
    if (user === 'test') return;

    const timestamp = new Date().toISOString();
    const ip = await getClientIp();

    await authFetcher.post('/logs', {
      user: user || 'Usuário não identificado',
      action: message,
      timestamp,
      ip,
    });
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
};
