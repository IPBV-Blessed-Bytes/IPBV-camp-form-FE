import fetcher from '@/fetchers';

export const getChatbotEnabled = async () => {
  try {
    const { data } = await fetcher.get('/chatbot/enabled');
    return Boolean(data?.enabled);
  } catch {
    return false;
  }
};

export const askChatbot = async (message, history) => {
  const { data } = await fetcher.post('/chatbot', { message, history });
  return data?.answer ?? '';
};
