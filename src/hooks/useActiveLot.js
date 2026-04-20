import { useEffect, useState } from 'react';

import { getLots } from '@/services/lots';
import { findActiveLot } from '@/utils/activeLot';

const useActiveLot = ({ skip = false } = {}) => {
  const [lots, setLots] = useState([]);
  const [activeLot, setActiveLot] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (skip) return;

    let canceled = false;

    const fetchLots = async () => {
      try {
        const data = await getLots();
        if (canceled) return;

        const list = data?.lots || [];
        setLots(list);
        setActiveLot(findActiveLot(list));
      } catch (err) {
        if (!canceled) setError(err);
        console.error('Erro ao buscar lotes:', err);
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    fetchLots();

    return () => {
      canceled = true;
    };
  }, [skip]);

  return { lots, activeLot, loading, error };
};

export default useActiveLot;
