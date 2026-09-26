import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';
import './style.scss';

const STEPS = [
  {
    icon: 'camp',
    title: 'Bem-vindo ao painel do Acampamento',
    text: 'Este é o seu painel administrativo. Aqui você acompanha as inscrições, gerencia pacotes, cobranças e toda a organização do evento. Vamos dar uma volta rápida pelas principais áreas.',
  },
  {
    icon: 'form',
    title: 'Acampantes e inscrições',
    text: 'Em "Acampantes" você vê todas as inscrições, filtra, edita, faz check-in e exporta os dados. É o coração do dia a dia do painel.',
  },
  {
    icon: 'cart',
    title: 'Pacotes, produtos e preços',
    text: 'Em "Produtos" e "Lotes" você define hospedagem, transporte, preços por lote, vagas e descontos por idade. Cada produto pode ganhar um ícone ou imagem no card do formulário.',
  },
  {
    icon: 'money',
    title: 'Financeiro',
    text: 'Boletos, taxas de pagamento, doações e reembolsos ficam nas seções financeiras. Acompanhe o que entrou e resolva pendências de cobrança por ali.',
  },
  {
    icon: 'rooms',
    title: 'Organização do evento',
    text: 'Quartos, times, ônibus, check-in e pulseiras ajudam a organizar a logística do acampamento antes e durante o evento.',
  },
  {
    icon: 'settings',
    title: 'Configurações e conteúdo',
    text: 'No estágio do formulário você abre ou fecha as inscrições. Em FAQ, Área Institucional, Usuários e Papéis você ajusta conteúdo, acessos e permissões da equipe.',
  },
  {
    icon: 'checked',
    title: 'Tudo pronto!',
    text: 'Você pode rever qualquer seção pelo menu a qualquer momento. Bom trabalho e um ótimo acampamento!',
  },
];

const AdminTourModal = ({ show, onClose, dontShowAgain, onDontShowAgainChange }) => {
  const [step, setStep] = useState(0);

  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const handleClose = () => {
    onClose();
    setStep(0);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      className="admin-tour"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Body className="admin-tour__body">
        <div className="admin-tour__icon">
          <Icons typeIcon={current.icon} iconSize={54} fill="#007185" />
        </div>

        <h4 className="admin-tour__title">{current.title}</h4>
        <p className="admin-tour__text">{current.text}</p>

        <div className="admin-tour__dots" role="tablist" aria-label="Progresso do tutorial">
          {STEPS.map((s, i) => (
            <span key={s.title} className={`admin-tour__dot ${i === step ? 'is-active' : ''}`} aria-hidden="true" />
          ))}
        </div>

        <div className="admin-tour__footer">
          <Form.Check
            type="checkbox"
            id="admin-tour-dont-show"
            label="Não mostrar novamente"
            checked={dontShowAgain}
            onChange={(e) => onDontShowAgainChange(e.target.checked)}
          />

          <div className="admin-tour__nav">
            <button
              type="button"
              className="admin-tour__arrow"
              onClick={() => setStep((s) => s - 1)}
              disabled={isFirst}
              aria-label="Passo anterior"
            >
              <Icons typeIcon="arrow-left" iconSize={20} fill={isFirst ? '#adb5bd' : '#007185'} />
            </button>
            <button
              type="button"
              className="admin-tour__arrow"
              onClick={() => setStep((s) => s + 1)}
              disabled={isLast}
              aria-label="Próximo passo"
            >
              <Icons typeIcon="arrow-right" iconSize={20} fill={isLast ? '#adb5bd' : '#007185'} />
            </button>
            <Button
              variant="teal-blue"
              className={`admin-tour__finish ${isLast ? '' : 'admin-tour__finish--hidden'}`}
              onClick={handleClose}
              tabIndex={isLast ? 0 : -1}
              aria-hidden={!isLast}
            >
              Fechar
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

AdminTourModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  dontShowAgain: PropTypes.bool.isRequired,
  onDontShowAgainChange: PropTypes.func.isRequired,
};

export default AdminTourModal;
