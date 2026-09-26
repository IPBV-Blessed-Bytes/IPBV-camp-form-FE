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

const AdminTourModal = ({ show, onClose }) => {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const handleClose = () => {
    onClose(dontShowAgain);
    setStep(0);
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" className="admin-tour">
      <Modal.Body className="admin-tour__body">
        <button type="button" className="admin-tour__close" aria-label="Fechar tutorial" onClick={handleClose}>
          <Icons typeIcon="close" iconSize={18} fill="#6c757d" />
        </button>

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
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />

          <div className="admin-tour__nav">
            {!isFirst && (
              <Button variant="outline-secondary" onClick={() => setStep((s) => s - 1)}>
                Voltar
              </Button>
            )}
            {isLast ? (
              <Button variant="teal-blue" onClick={handleClose}>
                Concluir
              </Button>
            ) : (
              <Button variant="teal-blue" onClick={() => setStep((s) => s + 1)}>
                Próximo
              </Button>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

AdminTourModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AdminTourModal;
