import { useState } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/fetchers/userLogs';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/Header/AdminHeader';

const AdminSeatManagement = ({
  loading,
  loggedUsername,
  handleUpdateTotalBusVacancies,
  handleUpdateTotalPackages,
  handleUpdateTotalSeats,
  totalBusVacancies,
  totalPackages,
  totalSeats,
}) => {
  const [loadingContent, setLoadingContent] = useState(false);

  const packageLabels = {
    schoolIndividual: 'Colégio Individual',
    schoolFamily: 'Colégio Família',
    schoolCamping: 'Colégio Camping',
    seminary: 'Seminário',
    other: 'Outra Hospedagem Externa',
  };

  const packageOrder = ['schoolIndividual', 'schoolFamily', 'schoolCamping', 'seminary', 'other'];

  scrollUp();

  const updateSeats = async () => {
    const currentTotalPackages = Object.values(totalPackages).reduce((acc, curr) => acc + curr, 0);

    if (totalSeats < currentTotalPackages) {
      toast.error(
        `A quantidade de vagas totais não pode ser inferior à soma das vagas por pacotes que é de ${currentTotalPackages}!`,
      );
      return;
    }

    try {
      setLoadingContent(true);

      await fetcher.put('package-count', {
        totalSeats: totalSeats,
        totalPackages,
      });
      toast.success(`Quantidade de vagas totais e por pacote ajustadas com sucesso`);
      registerLog(`Ajustou a quantidade de vagas totais e por pacote`, loggedUsername);
    } catch (error) {
      console.error(error);
      toast.error(error);
    } finally {
      setLoadingContent(false);
    }
  };

  const updateBusVacancies = async () => {
    if (totalBusVacancies < 0) {
      toast.error(`A quantidade de vagas de ônibus não pode ser menor que 0!`);
      return;
    }

    try {
      setLoadingContent(true);

      await fetcher.put('package-count/total-bus-vacancies', {
        totalBusVacancies: totalBusVacancies,
      });
      toast.success(`Quantidade de vagas totais do ônibus ajustadas com sucesso`);
      registerLog(`Ajustou a quantidade de vagas totais do ônibus para ${totalBusVacancies}`, loggedUsername);
    } catch (error) {
      console.error(error);
      toast.error(error);
    } finally {
      setLoadingContent(false);
    }
  };

  const handlePackageChange = (packageType, newPackageValue) => {
    handleUpdateTotalPackages({
      ...totalPackages,
      [packageType]: newPackageValue,
    });
  };

  return (
    <Container fluid>
      <AdminHeader pageName="Gerenciamento de Vagas" sessionTypeIcon="camp" iconSize={80} fill={'#204691'} />

      <Row className="justify-content-center">
        <Col xs={12} md={6} lg={4}>
          <Form className="my-4">
            <Form.Group controlId="inputSeats">
              <Form.Label>
                <b>Vagas Totais Inscritos:</b>
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={totalSeats}
                onChange={(e) => handleUpdateTotalSeats(Number(e.target.value))}
              />
            </Form.Group>

            {packageOrder.map((packageType) => (
              <Form.Group className="mt-2" controlId={`input-${packageType}`} key={packageType}>
                <Form.Label>
                  <b>{packageLabels[packageType]}:</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={totalPackages[packageType] || 0}
                  onChange={(e) => handlePackageChange(packageType, Number(e.target.value))}
                />
              </Form.Group>
            ))}

            <div className="d-flex mt-3 justify-content-end">
              <Button variant="success" onClick={updateSeats}>
                Ajustar Vagas Pacotes
              </Button>
            </div>
          </Form>
        </Col>

        <Col xs={12} md={6} lg={4}>
          <Form className="my-4">
            <Form.Group controlId="inputSeats">
              <Form.Label>
                <b>Vagas Totais no Ônibus:</b>
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={totalBusVacancies}
                onChange={(e) => handleUpdateTotalBusVacancies(Number(e.target.value))}
              />
            </Form.Group>

            <div className="d-flex mt-3 justify-content-end">
              <Button variant="success" onClick={updateBusVacancies}>
                Ajustar Vagas Ônibus
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
      <Loading loading={loading || loadingContent} />
    </Container>
  );
};

AdminSeatManagement.propTypes = {
  loggedUsername: PropTypes.string,
  totalSeats: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  handleUpdateTotalSeats: PropTypes.func.isRequired,
  totalBusVacancies: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  handleUpdateTotalBusVacancies: PropTypes.func.isRequired,
  totalPackages: PropTypes.object.isRequired,
  handleUpdateTotalPackages: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default AdminSeatManagement;
