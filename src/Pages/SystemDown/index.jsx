import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';

import { getSystemStage } from '@/services/systemStage';
import Icons from '@/components/Global/Icons';
import './style.scss';

const SystemDown = () => {
  const [stage, setStage] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = 'Sistema indisponível';
    getSystemStage()
      .then((data) => {
        setStage(data?.stage || 'maintenance');
        setMessage(data?.message || '');
      })
      .catch(() => setStage('maintenance'));
  }, []);

  const title = stage === 'off' ? 'Sistema fora do ar' : 'Em manutenção';
  const defaultText =
    stage === 'off'
      ? 'O sistema está temporariamente fora do ar. Tente novamente mais tarde.'
      : 'Estamos fazendo uma manutenção rápida. Volte em instantes.';

  return (
    <div className="system-down">
      <Container className="system-down__card">
        <span className="system-down__icon">
          <Icons typeIcon="settings" iconSize={40} fill="#ffffff" />
        </span>
        <h1>{title}</h1>
        <p>{message || defaultText}</p>
      </Container>
    </div>
  );
};

export default SystemDown;
