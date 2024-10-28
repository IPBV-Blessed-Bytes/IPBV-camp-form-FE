import { useEffect } from 'react';

const scrollUp = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
};

export default scrollUp;
