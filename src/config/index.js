export const JWT_LOCAL_STORAGE_KEY = 'token_jwt';

export const PROD_URL = 'https://www.blessedbytes-campform.camp';

export const TEST_URL = 'http://3.134.99.201:8080';

// BASE_URL pode ser sobrescrito por env (Vite): defina VITE_API_URL para apontar
// ao mock local (ex.: http://localhost:3001). Sem env, mantém o BE real.
export const BASE_URL = import.meta.env?.VITE_API_URL || 'http://3.134.99.201:8080';

export const LOGIN_ROUTE = '/admin';

export const USER_STORAGE_KEY = 'user-data';

export const USER_STORAGE_ROLE = 'user-role';

export const USER_PERMISSIONS_KEY = 'user-permissions';

export const FORM_CONTEXT_KEY = 'formContext';
