import { createContext, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { JWT_LOCAL_STORAGE_KEY, USER_STORAGE_KEY, USER_STORAGE_ROLE, FORM_CONTEXT_KEY } from '@/config';
import { isTokenValid } from './helpers';
import fetcher from '@/fetchers';

export const AuthContext = createContext({
  user: {},
  isLoggedIn: false,
  loading: false,
  formContext: '',
  setFormContext: () => {},
  login: () => {},
  logout: () => {},
});

// eslint-disable-next-line react/prop-types
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (userData) return JSON.parse(userData);
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem(JWT_LOCAL_STORAGE_KEY);

    if (!token) {
      return false;
    }

    if (isTokenValid(token)) {
      return true;
    } else {
      localStorage.removeItem(JWT_LOCAL_STORAGE_KEY);
      return false;
    }
  });

  const [loading, setLoading] = useState(true);

  const [formContext, setFormContextState] = useState(() => {
    return sessionStorage.getItem(FORM_CONTEXT_KEY) || '';
  });

  const setFormContext = useCallback((context) => {
    setFormContextState(context);
    sessionStorage.setItem(FORM_CONTEXT_KEY, context);
  }, []);

  useEffect(() => {
    const fetchFormContext = async () => {
      try {
        const response = await fetcher.get('/form-context');
        const context = response?.data?.formContext || '';

        setFormContextState(context);
        sessionStorage.setItem(FORM_CONTEXT_KEY, context);
      } catch (error) {
        console.error('[AuthProvider] erro ao buscar formContext', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormContext();
  }, []);

  const login = useCallback(async (userName, passWord) => {
    try {
      const response = await fetcher.post('/auth/login', {
        login: userName,
        password: passWord,
      });

      setIsLoggedIn(true);
      setUser(userName);

      localStorage.setItem(JWT_LOCAL_STORAGE_KEY, response.data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userName));
      localStorage.setItem(USER_STORAGE_ROLE, response.data.role);

      toast.success('Usuário logado com sucesso');
    } catch (error) {
      console.error(error.message);
      toast.error('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(JWT_LOCAL_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_ROLE);
    sessionStorage.removeItem(FORM_CONTEXT_KEY);

    setIsLoggedIn(false);
    setUser(undefined);
    setFormContextState('');

    toast.success('Logout realizado com sucesso!');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        formContext,
        setFormContext,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
