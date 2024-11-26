import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/fetchers/userLogs';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/adminHeader';

const AdminSeatManagement = ({ loggedUsername }) => {
  const [totalPackages, setTotalPackages] = useState({});
  const [inputSeats, setInputSeats] = useState();
  const [totalBusVacancies, setTotalBusVacancies] = useState();
  const [loading, setLoading] = useState(false);

  const packageLabels = {
    schoolIndividual: 'Colégio Individual',
    schoolFamily: 'Colégio Família',
    schoolCamping: 'Colégio Camping',
    seminary: 'Seminário',
    other: 'Outra Acomodação Externa',
  };

  const packageOrder = ['schoolIndividual', 'schoolFamily', 'schoolCamping', 'seminary', 'other'];

  scrollUp();

  useEffect(() => {
    fetchAvailableSeats();
  }, []);

  const fetchAvailableSeats = async () => {
    setLoading(true);
    try {
      const response = await fetcher.get('package-count');
      setInputSeats(response.data.totalSeats);
      setTotalBusVacancies(response.data.totalBusVacancies);
      setTotalPackages(response.data.totalPackages);
    } catch (error) {
      console.error(error);
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateSeats = async () => {
    const currentTotalPackages = Object.values(totalPackages).reduce((acc, curr) => acc + curr, 0);

    if (inputSeats < currentTotalPackages) {
      toast.error(
        `A quantidade de vagas totais não pode ser inferior à soma das vagas por pacotes que é de ${currentTotalPackages}!`,
      );
      return;
    }

    try {
      await fetcher.put('package-count', {
        totalSeats: inputSeats,
        totalPackages,
      });
      toast.success(`Quantidade de vagas totais e por pacote ajustadas com sucesso`);
      registerLog(`Ajustou a quantidade de vagas totais e por pacote`, loggedUsername);
    } catch (error) {
      console.error(error);
      toast.error(error);
    }
  };

  const updateBusVacancies = async () => {
    if (totalBusVacancies < 0) {
      toast.error(`A quantidade de vagas de ônibus não pode ser menor que 0!`);
      return;
    }

    try {
      await fetcher.put('package-count/total-bus-vacancies', {
        totalBusVacancies: totalBusVacancies,
      });
      toast.success(`Quantidade de vagas totais do ônibus ajustadas com sucesso`);
      registerLog(`Ajustou a quantidade de vagas totais do ônibus para ${totalBusVacancies}`, loggedUsername);
    } catch (error) {
      console.error(error);
      toast.error(error);
    }
  };

  const handlePackageChange = (packageType, newPackageValue) => {
    setTotalPackages((prevTotalPackages) => ({
      ...prevTotalPackages,
      [packageType]: newPackageValue,
    }));
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
                value={inputSeats}
                onChange={(e) => setInputSeats(Number(e.target.value))}
              />
            </Form.Group>

            {packageOrder.map((packageType) => (
              <Form.Group className="mt-2" controlId={`input-${packageType}`} key={packageType}>
                <Form.Label>{packageLabels[packageType]}:</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={totalPackages[packageType]}
                  onChange={(e) => handlePackageChange(packageType, Number(e.target.value))}
                />
              </Form.Group>
            ))}

            <div className="d-flex mt-3 justify-content-end">
              <Button variant="primary" onClick={updateSeats}>
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
                onChange={(e) => setTotalBusVacancies(Number(e.target.value))}
              />
            </Form.Group>

            <div className="d-flex mt-3 justify-content-end">
              <Button variant="primary" onClick={updateBusVacancies}>
                Ajustar Vagas Ônibus
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
      <Loading loading={loading} />
    </Container>
  );
};

AdminSeatManagement.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminSeatManagement;
