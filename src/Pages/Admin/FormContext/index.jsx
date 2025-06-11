import { useState, useEffect } from 'react';
import { Container, Form, Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import { registerLog } from '@/fetchers/userLogs';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/Header/AdminHeader';

const AdminFormContext = ({ loggedUsername }) => {
  const [loading, setLoading] = useState(true);
  const [formContext, setFormContext] = useState('');
  const [selectedContext, setSelectedContext] = useState('');
  const [showModal, setShowModal] = useState(false);

  scrollUp();

  const contextLabels = {
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
        const response = await fetcher.get('form-context');
        setFormContext(response.data.formContext);
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
    setSelectedContext(event.target.value);
    setShowModal(true);
  };

  const handleConfirmChange = async () => {
    setFormContext(selectedContext);
    setShowModal(false);
    setLoading(true);
    try {
      await fetcher.put('form-context', { formContext: selectedContext });
      toast.success('Contexto do formulário atualizado com sucesso');
      registerLog(`Alterou o contexto do formulário para ${contextLabels[selectedContext]}`, loggedUsername);
    } catch (error) {
      console.error('Erro ao atualizar contexto:', error);
      toast.error('Erro ao atualizar contexto do formulário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid>
      <AdminHeader pageName="Contexto do Formulário" sessionTypeIcon="form-context" iconSize={80} fill={'#204691'} />

      <Form>
        <Form.Group controlId="formContextSelect">
          <Form.Label>Selecione o contexto do formulário:</Form.Label>
          <Form.Select value={formContext} onChange={handleChange} disabled={loading}>
            <option value="form-on">Aberto</option>
            <option value="form-off">Fechado</option>
            <option value="form-waiting">Esperando Início do Acampamento</option>
            <option value="form-closed">Restrito</option>
            <option value="maintenance">Manutenção</option>
            <option value="google-forms">Google Forms</option>
          </Form.Select>
        </Form.Group>
      </Form>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Alteração</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza de que deseja alterar o contexto do formulário para <b>{contextLabels[selectedContext]}</b>?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmChange}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>

      <Loading loading={loading} />
    </Container>
  );
};

AdminFormContext.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminFormContext;
