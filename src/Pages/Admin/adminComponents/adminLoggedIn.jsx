import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import AdminPackageCard from './adminPackageCard';
import AdminExternalLinkRow from './adminExternalLinkRow';
import privateFetcher from '../../../fetchers/fetcherWithCredentials';
import { BASE_URL } from '../../../config/index';
import Loading from '../../../components/Loading';

const AdminLoggedIn = ({
  loggedInUsername,
  handleLogout,
  firstRowCards,
  totalValidRegistrationsPaied,
  totalValidRegistrationsGlobal,
  totalRegistrations,
  totalChildren,
  totalNonPaied,
  totalVacanciesWithBuses,
}) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const splitedUsername = loggedInUsername.split('@')[0];

  const handleTableClick = () => {
    navigate('/admin/tabela');
  };

  const handleRideClick = () => {
    navigate('/admin/carona');
  };

  const handleCouponsClick = () => {
    navigate('/admin/cupom');
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await privateFetcher.get(`${BASE_URL}/package-count`);
        setAvailablePackages(response.data);
      } catch (error) {
        console.error('Erro ao buscar os pacotes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return (
    <>
      <Row>
        <Col xs={8} md={10}>
          <Button variant="success" onClick={handleTableClick} className="mb-xs-3">
            Tabela de Inscritos
          </Button>
          &nbsp;
          <Button variant="warning" onClick={handleRideClick}>
            Gerenciador de Caronas
          </Button>
          &nbsp;
          <Button variant="primary" onClick={handleCouponsClick}>
            Cupons de Desconto
          </Button>
        </Col>
        <Col xs={4} md={2} className="text-end mb-2">
          <p>
            Bem vindo(a),
            <span>
              <strong className="text-uppercase"> {splitedUsername}</strong>
            </span>
            !
          </p>
          <Button variant="danger" onClick={handleLogout}>
            Sair
          </Button>
        </Col>
      </Row>
      <Row>
        <h4 className="text-center fw-bold mb-4">PACOTES:</h4>
        {firstRowCards.map((card) => (
          <AdminPackageCard key={card.title} {...card} />
        ))}
      </Row>

      <Row className="mt-4">
        <h4 className="text-center fw-bold mb-4">TOTAL:</h4>
      </Row>

      <Row>
        <Col className="mb-4" xs={12} md={6} lg={4}>
          <Card className="h-100 bg-dark">
            <Card.Body>
              <Card.Title className="fw-bold text-warning">Total de Inscritos válidos (pagantes)</Card.Title>
              <Card.Text>
                Vagas Totais Preenchidas:{' '}
                <em>
                  <b>{isNaN(totalValidRegistrationsPaied) ? 'Indefinido' : totalValidRegistrationsPaied.toString()}</b>
                </em>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="mb-4" xs={12} md={6} lg={4}>
          <Card className="h-100 bg-light">
            <Card.Body>
              <Card.Title className="fw-bold text-success">
                Total de Inscritos válidos <br />
                (pagantes e não pagantes)
              </Card.Title>
              <Card.Text>
                Vagas Totais Preenchidas:{' '}
                <em>
                  <b>
                    {isNaN(totalValidRegistrationsGlobal) ? 'Indefinido' : totalValidRegistrationsGlobal.toString()}
                  </b>
                </em>
                <br />
                Vagas Totais Restantes:{' '}
                <em>
                  <b>
                    {isNaN(375 - totalValidRegistrationsGlobal)
                      ? 'Indefinido'
                      : (375 - totalValidRegistrationsGlobal).toString()}
                  </b>
                </em>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="mb-4" xs={12} md={6} lg={4}>
          <Card className="h-100 bg-dark">
            <Card.Body>
              <Card.Title className="fw-bold text-warning">
                Total de Inscritos geral <br />
                (adultos e crianças)
              </Card.Title>
              <Card.Text>
                Vagas Totais Preenchidas:{' '}
                <em>
                  <b>{isNaN(totalRegistrations) ? 'Indefinido' : totalRegistrations.toString()}</b>
                </em>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="mb-4" xs={12} md={6} lg={4}>
          <Card className="h-100 bg-light">
            <Card.Body>
              <Card.Title className="fw-bold text-success">Total de Crianças</Card.Title>
              <Card.Text>
                Vagas Totais Preenchidas:{' '}
                <em>
                  <b>{isNaN(totalChildren) ? 'Indefinido' : totalChildren.toString()}</b>
                </em>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="mb-4" xs={12} md={6} lg={4}>
          <Card className="h-100 bg-dark">
            <Card.Body>
              <Card.Title className="fw-bold text-warning">Total de Não Pagantes (day use)</Card.Title>
              <Card.Text>
                Vagas Totais Preenchidas:{' '}
                <em>
                  <b>{isNaN(totalNonPaied) ? 'Indefinido' : totalNonPaied.toString()}</b>
                </em>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="mb-4" xs={12} md={6} lg={4}>
          <Card className="h-100 bg-warning">
            <Card.Body>
              <Card.Title className="fw-bold text-dark">Ônibus Preenchidos</Card.Title>
              <Card.Text>
                Vagas Preenchidas com Ônibus:{' '}
                <em>
                  <b>{isNaN(totalVacanciesWithBuses) ? 'Indefinido' : totalVacanciesWithBuses.toString()}</b>
                </em>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="packages-horizontal-line" />
      <h4>Notas:</h4>
      <div>
        <ul>
          <li>
            <em>
              <b>Inscritos Válidos</b>
            </em>{' '}
            : Contagem de adultos que contam como uma inscrição válida
          </li>
          <li>
            <em>
              <b>Não Pagantes (day use)</b>
            </em>{' '}
            : Pessoas que não irão dormir, comer ou se transportar no ônibus, apenas assistir aos cultos e(ou)
            participar das programações
          </li>
          <li>
            <em>
              <b>Total de inscritos geral</b>
            </em>{' '}
            : Contagem de inscritos válidos (pagantes ou não) e crianças
          </li>
          <li>
            <em>
              <b>Ônibus Preenchidos</b>
            </em>{' '}
            : Contagem de pessoas inscritas nos ônibus
          </li>
        </ul>
      </div>

      <Loading loading={loading} />
      
      <Row>
        <AdminExternalLinkRow />
      </Row>
    </>
  );
};

AdminLoggedIn.propTypes = {
  loggedInUsername: PropTypes.bool,
  handleLogout: PropTypes.func,
  firstRowCards: PropTypes.bool,
  totalValidRegistrationsPaied: PropTypes.bool,
  totalValidRegistrationsGlobal: PropTypes.bool,
  totalRegistrations: PropTypes.bool,
  totalChildren: PropTypes.bool,
  totalNonPaied: PropTypes.bool,
  totalVacanciesWithBuses: PropTypes.bool,
};

export default AdminLoggedIn;
