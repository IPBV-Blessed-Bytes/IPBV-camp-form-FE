import { useEffect, useState } from 'react';
import { Container, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getBoletosByOrder } from '@/services/boletos';
import BoletoList from '@/components/Global/BoletoList';
import Icons from '@/components/Global/Icons';
import './style.scss';

const Boletos = () => {
  const navigate = useNavigate();
  const [boletos, setBoletos] = useState([]);
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedOrder = sessionStorage.getItem('generatedBoletosOrder') || '';
    setOrderNumber(storedOrder);

    if (storedOrder) {
      getBoletosByOrder(storedOrder)
        .then(setBoletos)
        .catch(() => setBoletos([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <Container className="boletos-page py-4">
      <div className="boletos-page__header">
        <span className="boletos-page__icon">
          <Icons typeIcon="barcode" iconSize={30} fill="#fff" />
        </span>
        <div>
          <h2 className="boletos-page__title">Seus boletos</h2>
          <p className="boletos-page__subtitle">
            Pague o <b>1º boleto</b> para confirmar sua vaga. Os demais mantêm sua inscrição em dia.
          </p>
          {orderNumber && <span className="boletos-page__order">Pedido nº {orderNumber}</span>}
        </div>
      </div>

      <div className="boletos-page__note">
        <Icons typeIcon="info" iconSize={18} fill="#007185" />
        <span>
          Enviamos os boletos também para o seu e-mail. Você pode voltar aqui ou acessar <b>Minha conta</b> a qualquer
          momento para pagar os próximos.
        </span>
      </div>

      {loading ? (
        <div className="boletos-page__loading">
          <Spinner animation="border" size="sm" /> Carregando boletos...
        </div>
      ) : boletos.length === 0 ? (
        <div className="boletos-page__empty">Nenhum boleto encontrado.</div>
      ) : (
        <BoletoList boletos={boletos} showProgress />
      )}

      <div className="boletos-page__footer">
        <Button variant="teal-blue" onClick={() => navigate('/minha-conta')}>
          Ir para minha conta
        </Button>
        <Button variant="outline-secondary" onClick={() => navigate('/')}>
          Voltar ao formulário
        </Button>
      </div>
    </Container>
  );
};

export default Boletos;
