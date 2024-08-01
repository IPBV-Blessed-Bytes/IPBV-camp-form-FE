import axios from 'axios';

import { BASE_URL } from '../config';

const fetcher = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  timeoutErrorMessage: 'time exceeded',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default fetcher;
