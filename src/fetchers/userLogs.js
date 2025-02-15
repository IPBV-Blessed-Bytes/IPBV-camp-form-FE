import axios from 'axios';
import fetcher from '@/fetchers/fetcherWithCredentials';

export const registerLog = async (message, user) => {
  try {
    if (user === 'test') return;

    const timestamp = new Date().toISOString();
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    const userIp = ipResponse.data.ip;

    const logsPayload = {
      user: user || 'Usuário não identificado',
      action: message,
      timestamp,
      ip: userIp,
    };

    await fetcher.post('logs', logsPayload);
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
};
