import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/fetchers/userLogs';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/Header/AdminHeader';

const AdminLotManagement = ({ loading, loggedUsername }) => {
  const [loadingContent, setLoadingContent] = useState(false);
  const [lots, setLots] = useState([]);

  scrollUp();

  const fetchLots = async () => {
    try {
      setLoadingContent(true);
      const response = await fetcher.get('lots');
      setLots(response.lots || []);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar lotes');
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const handleLotChange = (id, field, value) => {
    setLots((prevLots) =>
      prevLots.map((lot) =>
        lot.id === id ? { ...lot, [field]: value } : lot
      )
    );
  };

  const updateLot = async (lot) => {
    try {
      setLoadingContent(true);
      await fetcher.patch(`lots/${lot.id}`, {
        price: Number(lot.price),
        startDate: lot.startDate,
        endDate: lot.endDate,
      });
      toast.success(`Lote ${lot.name} atualizado com sucesso`);
      registerLog(`Atualizou o ${lot.name}`, loggedUsername);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar lote');
    } finally {
      setLoadingContent(false);
    }
  };

  return (
    <Container fluid>
      <AdminHeader pageName="Gerenciamento de Lotes" sessionTypeIcon="calendar" iconSize={65} fill={'#204691'} />

      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Form className="my-4">
            {lots.map((lot) => (
              <div key={lot.id} className="border rounded p-3 mb-3">
                <h5>{lot.name}</h5>
                <Row>
                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label>Preço</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={lot.price || ''}
                        onChange={(e) =>
                          handleLotChange(lot.id, 'price', e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label>Data Início</Form.Label>
                      <Form.Control
                        type="date"
                        value={lot.startDate || ''}
                        onChange={(e) =>
                          handleLotChange(lot.id, 'startDate', e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label>Data Fim</Form.Label>
                      <Form.Control
                        type="date"
                        value={lot.endDate || ''}
                        onChange={(e) =>
                          handleLotChange(lot.id, 'endDate', e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex mt-3 justify-content-end">
                  <Button variant="success" onClick={() => updateLot(lot)}>
                    Salvar {lot.name}
                  </Button>
                </div>
              </div>
            ))}
          </Form>
        </Col>
      </Row>
      <Loading loading={loading || loadingContent} />
    </Container>
  );
};

AdminLotManagement.propTypes = {
  loggedUsername: PropTypes.string,
  loading: PropTypes.bool.isRequired,
};

export default AdminLotManagement;
