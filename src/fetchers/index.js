import axios from 'axios';

import { BASE_URL } from '@/config';
import { withEventScope } from '@/config/eventScope';

const fetcher = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  timeoutErrorMessage: 'time exceeded',
  headers: {
    'Content-Type': 'application/json',
  },
});

fetcher.interceptors.request.use((config) => {
  config.url = withEventScope(config.url);
  return config;
});

fetcher.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 402 &&
      error.response.data?.billing_blocked &&
      typeof window !== 'undefined' &&
      !window.location.pathname.endsWith('/indisponivel')
    ) {
      window.location.assign('/indisponivel');
    }
    if (
      error?.response?.status === 503 &&
      error.response.data?.system_stage &&
      typeof window !== 'undefined' &&
      !window.location.pathname.endsWith('/manutencao')
    ) {
      window.location.assign('/manutencao');
    }
    return Promise.reject(error);
  },
);

export default fetcher;
