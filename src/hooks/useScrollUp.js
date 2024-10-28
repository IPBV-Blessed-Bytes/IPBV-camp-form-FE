// src/hooks/useScrollUp.js
import { useEffect } from 'react';

const useScrollUp = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
};

export default useScrollUp;
