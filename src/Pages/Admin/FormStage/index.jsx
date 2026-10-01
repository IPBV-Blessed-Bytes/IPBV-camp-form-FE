import { useState, useEffect } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
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
  { key: 'form-on', icon: 'form', tone: 'success' },
  { key: 'form-off', icon: 'clock', tone: 'secondary' },
  { key: 'form-waiting', icon: 'clock', tone: 'warning' },
  { key: 'form-closed', icon: 'roles', tone: 'danger' },
  { key: 'maintenance', icon: 'settings', tone: 'danger' },
];

const AdminFormStage = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [formStage, setFormStage] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const stageLabel = (key) => t(`admin.formStage.stages.${key}.label`);
  const stageDesc = (key) => t(`admin.formStage.stages.${key}.description`);

  scrollUp();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFormStage();
        setFormStage(data.formStage);
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
        toast.error(t('admin.formStage.loadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

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
      toast.success(t('admin.formStage.updateSuccess'));
      registerLog(`Alterou o estágio do formulário para ${target ? stageLabel(target.key) : ''}`, loggedUsername);
    } catch (error) {
      console.error('Erro ao atualizar contexto:', error);
      toast.error(t('admin.formStage.updateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-subpage admin-subpage--settings form-stage">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.formStage.title')}
        subtitle={t('admin.formStage.subtitle')}
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
                {t('admin.formStage.currentBadge')}
              </Badge>
              <h3 className="stage-current__title">{stageLabel(current.key)}</h3>
              <p className="stage-current__desc">{stageDesc(current.key)}</p>
            </div>
          </div>
        )}

        <h4 className="stage-heading">{t('admin.formStage.changeHeading')}</h4>

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
                <span className="stage-card__title">{stageLabel(stage.key)}</span>
                <span className="stage-card__desc">{stageDesc(stage.key)}</span>
                {active && <span className="stage-card__badge">{t('admin.formStage.currentTag')}</span>}
              </button>
            );
          })}
        </div>

        <CustomModal
          show={showModal}
          onHide={() => setShowModal(false)}
          variant="confirm"
          title={t('admin.formStage.modalTitle')}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                {t('admin.formStage.cancel')}
              </Button>
              <Button variant="primary" className="btn-confirm" onClick={handleConfirmChange}>
                {t('admin.formStage.confirm')}
              </Button>
            </>
          }
        >
          <Trans
            i18nKey="admin.formStage.modalBody"
            components={{ b: <b /> }}
            values={{ from: current ? stageLabel(current.key) : '', to: target ? stageLabel(target.key) : '' }}
          />
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
