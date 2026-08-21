import authFetcher from '@/fetchers/fetcherWithCredentials';

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

    await authFetcher.post('/logs', {
      user: user || 'Usuário não identificado',
      action: message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
};
