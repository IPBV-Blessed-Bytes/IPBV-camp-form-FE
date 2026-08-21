import { useState, useEffect } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import { registerLog } from '@/services/logs';
import { getFormStage, updateFormStage } from '@/services/formStage';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';

const STAGES = [
  {
    key: 'form-on',
    label: 'Aberto',
    description: 'Inscrições abertas — o formulário está disponível para todos.',
    icon: 'form',
    tone: 'success',
  },
  {
    key: 'form-off',
    label: 'Fechado',
    description: 'Exibe a tela "as inscrições começarão em breve".',
    icon: 'clock',
    tone: 'secondary',
  },
  {
    key: 'form-waiting',
    label: 'Esperando Início',
    description: 'Inscrições encerradas — mostra a tela de espera do acampamento.',
    icon: 'clock',
    tone: 'warning',
  },
  {
    key: 'form-closed',
    label: 'Restrito',
    description: 'Acesso restrito ao formulário de inscrição.',
    icon: 'roles',
    tone: 'danger',
  },
  {
    key: 'maintenance',
    label: 'Manutenção',
    description: 'Site em manutenção — indisponível para os inscritos.',
    icon: 'settings',
    tone: 'danger',
  },
  {
    key: 'google-forms',
    label: 'Google Forms',
    description: 'Redireciona os inscritos para um Google Forms externo.',
    icon: 'form-context',
    tone: 'info',
  },
];

const AdminFormStage = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(true);
  const [formStage, setFormStage] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [showModal, setShowModal] = useState(false);

  scrollUp();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFormStage();
        setFormStage(data.formStage);
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
        toast.error('Erro ao carregar contexto do formulário');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const current = STAGES.find((s) => s.key === formStage);
  const target = STAGES.find((s) => s.key === selectedStage);

  const openConfirm = (key) => {
    if (key === formStage || loading) return;
    setSelectedStage(key);
    setShowModal(true);
  };

  const handleConfirmChange = async () => {
    setFormStage(selectedStage);
    setShowModal(false);
    setLoading(true);
    try {
      await updateFormStage(selectedStage);
      toast.success('Estágio do formulário atualizado com sucesso');
      registerLog(`Alterou o estágio do formulário para ${target?.label}`, loggedUsername);
    } catch (error) {
      console.error('Erro ao atualizar contexto:', error);
      toast.error('Erro ao atualizar o estágio do formulário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-subpage admin-subpage--settings form-stage">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Estágio do Formulário"
        subtitle="Estado atual do formulário de inscrição"
        typeIcon="form-context"
      />

      <div className="admin-subpage__content">
        {current && (
          <div className={`stage-current stage-current--${current.tone}`}>
            <span className="stage-current__icon">
              <Icons typeIcon={current.icon} iconSize={30} fill="#fff" />
            </span>
            <div className="stage-current__body">
              <Badge bg={current.tone} text={current.tone === 'warning' ? 'dark' : undefined}>
                Estado atual
              </Badge>
              <h3 className="stage-current__title">{current.label}</h3>
              <p className="stage-current__desc">{current.description}</p>
            </div>
          </div>
        )}

        <h4 className="stage-heading">Alterar estágio</h4>

        <div className="stage-grid">
          {STAGES.map((stage) => {
            const active = stage.key === formStage;
            return (
              <button
                key={stage.key}
                type="button"
                className={`stage-card ${active ? 'is-active' : ''}`}
                onClick={() => openConfirm(stage.key)}
                disabled={loading}
              >
                <span className="stage-card__icon">
                  <Icons typeIcon={stage.icon} iconSize={26} fill={active ? '#fff' : '#007185'} />
                </span>
                <span className="stage-card__title">{stage.label}</span>
                <span className="stage-card__desc">{stage.description}</span>
                {active && <span className="stage-card__badge">Atual</span>}
              </button>
            );
          })}
        </div>

        <CustomModal
          show={showModal}
          onHide={() => setShowModal(false)}
          variant="confirm"
          title="Confirmar Alteração"
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" className="btn-confirm" onClick={handleConfirmChange}>
                Confirmar
              </Button>
            </>
          }
        >
          Alterar o estágio do formulário de <b>{current?.label}</b> para <b>{target?.label}</b>?
        </CustomModal>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminFormStage.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminFormStage;
