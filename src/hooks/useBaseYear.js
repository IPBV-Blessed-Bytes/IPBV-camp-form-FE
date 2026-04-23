import { useEffect, useState } from 'react';

import { getBaseDate, initBaseDate } from '@/Pages/Packages/utils/calculateAge';

const extractYear = (date) => (date instanceof Date ? String(date.getFullYear()) : '');

const useBaseYear = () => {
  const [baseYear, setBaseYear] = useState(() => extractYear(getBaseDate()));

  useEffect(() => {
    if (baseYear) return undefined;

    let canceled = false;
    initBaseDate().then((date) => {
      if (!canceled) setBaseYear(extractYear(date));
    });

    return () => {
      canceled = true;
    };
  }, [baseYear]);

  return baseYear;
};

export default useBaseYear;
