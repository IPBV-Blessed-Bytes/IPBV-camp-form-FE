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

export default fetcher;
