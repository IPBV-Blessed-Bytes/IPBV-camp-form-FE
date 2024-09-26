import { createContext, useCallback, useState } from 'react';
import { toast } from 'react-toastify';

import { JWT_LOCAL_STORAGE_KEY, USER_STORAGE_KEY } from '@/config';
import { isTokenValid } from './helpers';
import fetcher from '@/fetchers';

export const AuthContext = createContext({
  user: {},
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

// eslint-disable-next-line react/prop-types
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (userData) return userData;
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

  const login = useCallback(async (userName, passWord) => {
    try {
      const response = await fetcher.post('/auth/login', {
        login: userName,
        password: passWord,
      });
      setIsLoggedIn(true);
      setUser(userName);
      toast.success('Usuário logado com sucesso');

      localStorage.setItem(JWT_LOCAL_STORAGE_KEY, response.data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userName));
    } catch (error) {
      console.error(error.message);
      toast.error('Erro ao fazer login. Tente novamente.');
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(JWT_LOCAL_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);

    setIsLoggedIn(false);
    setUser(undefined);

    toast.success('Logout realizado com sucesso!');
  }, []);

  return <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
