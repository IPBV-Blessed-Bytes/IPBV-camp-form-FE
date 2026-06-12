import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'ipbv-theme';

const ThemeContext = createContext(null);

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const getInitialTheme = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return getSystemTheme();
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  // Modo de cores nativo do Bootstrap 5.3 (cards, tabelas, modais, inputs…).
  root.setAttribute('data-bs-theme', theme);
};

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Acompanha mudanças do SO enquanto o usuário não tiver escolhido manualmente.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event) => {
      if (localStorage.getItem(STORAGE_KEY)) return;
      setTheme(event.matches ? 'dark' : 'light');
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export { ThemeProvider, useTheme };
