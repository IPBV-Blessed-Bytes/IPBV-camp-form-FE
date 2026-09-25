import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Modal } from 'react-bootstrap';

import Icons from '@/components/Global/Icons';
import './style.scss';

const STEPS = [
  {
    icon: 'tent',
    title: 'Bem-vindo ao seu painel',
    text: 'Aqui você gerencia seu evento de ponta a ponta: inscrições, formulário, pagamentos e a logística. Vamos dar um tour rápido.',
  },
  {
    icon: 'person',
    title: 'Inscrições',
    text: 'Veja todos os inscritos em tabela, com busca e exportação para Excel. Dá para editar, excluir (vai pra lixeira) e emitir reembolsos.',
  },
  {
    icon: 'form-context',
    title: 'Monte o formulário',
    text: 'Em Configurações → Construtor de Formulário você define campos e seções — ou comece por um modelo pronto (acampamento, congresso, retiro).',
  },
  {
    icon: 'cart',
    title: 'Produtos, pacotes e loja',
    text: 'Cadastre produtos e categorias. Cada categoria pode ser obrigatória ou opcional, de escolha única ou múltipla — ideal para pacotes e até itens de loja (com ícone ou foto no card).',
  },
  {
    icon: 'money',
    title: 'Receba os pagamentos',
    text: 'Configure o Recebimento para receber por PIX, cartão e boleto — o dinheiro cai direto na conta da sua igreja, com repasse automático.',
  },
  {
    icon: 'checkin',
    title: 'Logística do evento',
    text: 'Caronas, quartos, times, pulseiras, ônibus e check-in por QR ou CPF — tudo no mesmo lugar (plano Completo).',
  },
  {
    icon: 'megaphone',
    title: 'Publique e divulgue',
    text: 'Em Estágio do Formulário você liga as inscrições. Depois é só compartilhar o link público do evento. Bom trabalho!',
  },
];

const TenantTourModal = ({ show, onClose }) => {
  const [index, setIndex] = useState(0);
  const [dontShow, setDontShow] = useState(false);

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  const finish = () => {
    onClose(dontShow);
    setIndex(0);
  };

  return (
    <Modal show={show} onHide={finish} centered dialogClassName="tenant-tour">
      <Modal.Body>
        <div className="tenant-tour__body">
          <span className="tenant-tour__icon">
            <Icons typeIcon={step.icon} iconSize={40} fill="#007185" />
          </span>
          <h2 className="tenant-tour__title">{step.title}</h2>
          <p className="tenant-tour__text">{step.text}</p>

          <div className="tenant-tour__dots" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span key={s.title} className={`tenant-tour__dot ${i === index ? 'is-active' : ''}`} />
            ))}
          </div>
        </div>

        <div className="tenant-tour__footer">
          <Form.Check
            type="checkbox"
            id="tenant-tour-dontshow"
            label="Não mostrar novamente"
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
          />
          <div className="tenant-tour__nav">
            {index > 0 && (
              <Button variant="outline-secondary" onClick={() => setIndex((i) => i - 1)}>
                Voltar
              </Button>
            )}
            {isLast ? (
              <Button variant="teal-blue" className="fw-bold" onClick={finish}>
                Começar
              </Button>
            ) : (
              <Button variant="teal-blue" className="fw-bold" onClick={() => setIndex((i) => i + 1)}>
                Próximo
              </Button>
            )}
          </div>
        </div>

        <button type="button" className="tenant-tour__skip" onClick={finish}>
          Pular tour
        </button>
      </Modal.Body>
    </Modal>
  );
};

TenantTourModal.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

export default TenantTourModal;
