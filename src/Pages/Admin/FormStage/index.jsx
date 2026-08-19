import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import { registerLog } from '@/services/logs';
import { getFormStage, updateFormStage } from '@/services/formStage';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';

const AdminFormStage = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(true);
  const [formStage, setFormStage] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [showModal, setShowModal] = useState(false);

  scrollUp();

  const stageLabels = {
    'form-on': 'Aberto',
    'form-off': 'Fechado',
    'form-waiting': 'Esperando Início do Acampamento',
    'form-closed': 'Restrito',
    maintenance: 'Manutenção',
    'google-forms': 'Google Forms',
  };

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

  const handleChange = (event) => {
    setSelectedStage(event.target.value);
    setShowModal(true);
  };

  const handleConfirmChange = async () => {
    setFormStage(selectedStage);
    setShowModal(false);
    setLoading(true);
    try {
      await updateFormStage(selectedStage);
      toast.success('Contexto do formulário atualizado com sucesso');
      registerLog(`Alterou o contexto do formulário para ${stageLabels[selectedStage]}`, loggedUsername);
    } catch (error) {
      console.error('Erro ao atualizar contexto:', error);
      toast.error('Erro ao atualizar contexto do formulário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-subpage admin-subpage--settings">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Contexto do Formulário"
        subtitle="Estado atual do formulário de inscrição"
        typeIcon="form-context"
      />

      <div className="admin-subpage__content">
        <Form className="admin-panel">
        <Form.Group controlId="formStageSelect">
          <Form.Label>
            <strong>Selecione o contexto do formulário:</strong>
          </Form.Label>
          <Form.Select value={formStage} onChange={handleChange} disabled={loading}>
            <option value="form-on">Aberto</option>
            <option value="form-off">Fechado</option>
            <option value="form-waiting">Esperando Início do Acampamento</option>
            <option value="form-closed">Restrito</option>
            <option value="maintenance">Manutenção</option>
            <option value="google-forms">Google Forms</option>
          </Form.Select>
        </Form.Group>
      </Form>

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
        Tem certeza de que deseja alterar o contexto do formulário para <b>{stageLabels[selectedStage]}</b>?
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
