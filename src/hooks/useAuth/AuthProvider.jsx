import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import {
  JWT_LOCAL_STORAGE_KEY,
  USER_STORAGE_KEY,
  USER_STORAGE_ROLE,
  USER_PERMISSIONS_KEY,
  FORM_STAGE_KEY,
} from '@/config';
import { isTokenValid, getApiErrorMessage } from '@/fetchers/helpers';
import { login as loginRequest, getMyPermissions } from '@/services/auth';
import { getFormStage } from '@/services/formStage';

const loadPermissions = async () => {
  try {
    const permissions = await getMyPermissions();
    localStorage.setItem(USER_PERMISSIONS_KEY, JSON.stringify(permissions));
  } catch (error) {
    console.error('[AuthProvider] erro ao buscar permissões', error);
  }
};

export const AuthContext = createContext({
  user: {},
  isLoggedIn: false,
  loading: false,
  formStage: '',
  setFormStage: () => {},
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

  const [loading, setLoading] = useState(false);

  const [formStage, setFormStageState] = useState(() => {
    return sessionStorage.getItem(FORM_STAGE_KEY) || '';
  });

  const setFormStage = useCallback((context) => {
    setFormStageState(context);
    sessionStorage.setItem(FORM_STAGE_KEY, context);
  }, []);

  useEffect(() => {
    const fetchFormStage = async () => {
      setLoading(true);
      try {
        const data = await getFormStage();
        const context = data?.formStage || '';

        setFormStageState(context);
        sessionStorage.setItem(FORM_STAGE_KEY, context);
      } catch (error) {
        console.error('[AuthProvider] erro ao buscar formStage', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormStage();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadPermissions();
    }
  }, [isLoggedIn]);

  const login = useCallback(async (userName, passWord, options = {}) => {
    setLoading(true);
    try {
      const data = await loginRequest({ login: userName, password: passWord });

      if (options.area === 'admin' && data.role === 'guest') {
        toast.error('Esta conta é de cliente. Faça login na área de acompanhamento de inscrições.');
        return;
      }

      setIsLoggedIn(true);
      setUser(userName);

      localStorage.setItem(JWT_LOCAL_STORAGE_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userName));
      localStorage.setItem(USER_STORAGE_ROLE, data.role);

      await loadPermissions();

      toast.success('Usuário logado com sucesso');
    } catch (error) {
      console.error(error.message);

      const status = error?.response?.status;
      const apiMessage = getApiErrorMessage(error);
      const minutesLeft = error?.response?.data?.minutesLeft;

      let message;
      if (status === 423) {
        const base = 'Conta temporariamente bloqueada.';
        message = minutesLeft
          ? `${base} Tente novamente em ${minutesLeft} ${minutesLeft === 1 ? 'minuto' : 'minutos'}.`
          : `${base} Tente novamente mais tarde.`;
      } else if (status === 403 && error?.response?.data?.emailNotVerified) {
        message = apiMessage || 'Confirme seu e-mail para acessar sua conta.';
      } else if (status === 403) {
        message = 'Sua conta foi bloqueada. Solicite o link de desbloqueio pelo seu e-mail cadastrado.';
      } else if (status === 401) {
        message = 'Credenciais inválidas. Tente novamente.';
      } else if (apiMessage) {
        message = `${apiMessage} Tente novamente.`;
      } else {
        message = 'Erro ao fazer login. Tente novamente.';
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(JWT_LOCAL_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_ROLE);
    localStorage.removeItem(USER_PERMISSIONS_KEY);
    sessionStorage.removeItem(FORM_STAGE_KEY);

    setIsLoggedIn(false);
    setUser(undefined);

    toast.success('Logout realizado com sucesso!');
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      loading,
      formStage,
      setFormStage,
      login,
      logout,
    }),
    [isLoggedIn, user, loading, formStage, setFormStage, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
