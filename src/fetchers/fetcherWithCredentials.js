import axios from 'axios';
import { toast } from 'react-toastify';

import { JWT_LOCAL_STORAGE_KEY, BASE_URL, LOGIN_ROUTE } from '@/config';
import { withEventScope } from '@/config/eventScope';
import { isTokenValid } from './helpers';

const fetcherWithCredentials = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15_000,
  timeoutErrorMessage: 'time exceeded',
  headers: {
    'Content-Type': 'application/json',
  },
});

fetcherWithCredentials.interceptors.request.use(
  (config) => {
    config.url = withEventScope(config.url);

    if (!config.headers['Authorization']) {
      const token = localStorage.getItem(JWT_LOCAL_STORAGE_KEY);

      if (token && isTokenValid(token)) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else if (token) {
        localStorage.removeItem(JWT_LOCAL_STORAGE_KEY);
        window.location.assign(LOGIN_ROUTE);
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

fetcherWithCredentials.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(JWT_LOCAL_STORAGE_KEY);
      window.location.assign(LOGIN_ROUTE);
	  return;
    }

    if (error?.response?.status === 402 && error.response.data?.billing_blocked) {
      toast.error(
        error.response.data.billing_blocked === 'admin'
          ? 'Sistema bloqueado por pendência de pagamento da plataforma. Regularize para reativar.'
          : 'Inscrições temporariamente indisponíveis por pendência de pagamento da plataforma.',
      );
    }

	return Promise.reject(error)
  },
);

export default fetcherWithCredentials;
