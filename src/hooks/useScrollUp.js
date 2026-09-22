import { useEffect } from 'react';

export const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

const useScrollUp = () => {
  useEffect(() => {
    scrollTop();
  }, []);
};

export default useScrollUp;
