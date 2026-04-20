import { useEffect, useState } from 'react';

import { getBaseDate } from '@/services/baseDate';

const useBaseYear = () => {
  const [baseYear, setBaseYear] = useState('');

  useEffect(() => {
    let canceled = false;

    const fetchBaseDate = async () => {
      try {
        const data = await getBaseDate();
        const dateStr = data?.baseDate;
        if (!canceled && typeof dateStr === 'string') {
          setBaseYear(dateStr.split('/')[2] || '');
        }
      } catch (error) {
        console.error('Erro ao buscar base date', error);
      }
    };

    fetchBaseDate();

    return () => {
      canceled = true;
    };
  }, []);

  return baseYear;
};

export default useBaseYear;
