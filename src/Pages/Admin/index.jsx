import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Icon from '../../components/Icon';

const API_URL = 'https://ipbv-camp-form-be-production.up.railway.app';
const PACKAGES_ENDPOINT = `${API_URL}/package-count`;
const CREDENTIALS_ENDPOINT = `${API_URL}/credentials`;
const SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/1BY0Owcj99nG9DtTx6XLHioZEQnY7Ffb7inX2gBd11WY/edit?usp=sharing';
const FILTERS_URL = 'https://docs.google.com/spreadsheets/d/1MPYASaBbk6XM3ecGwNEAMBSUpWx_MPlio6D1RZAUdrM/edit#gid=0';
const PackageCard = ({ title, remainingVacancies, filledVacancies, background, titleColor }) => (
  <Col className="mb-4" xs={12} md={6} lg={4}>
    <Card className={`h-100 ${background}`}>
      <Card.Body>
        <Card.Title className={`fw-bold ${titleColor}`}>{title}</Card.Title>
        <Card.Text>
          Vagas Restantes:{' '}
          <em>
            <b>{remainingVacancies} </b>
          </em>
          <br />
          Vagas Preenchidas:{' '}
          <em>
            <b>{filledVacancies || '-'}</b>
          </em>
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
);

const ExternalLinkRow = () => (
  <Row className="mt-4 p-0">
    <Col xs={12} className="text-center" style={{ padding: '0 0 0 1.25rem' }}>
      <Card>
        <Card.Body>
          <Card.Title className="fw-bold text-success">Link da Planilha</Card.Title>
          <Card.Text>Clique no botão abaixo para acessar a planilha das inscrições em tempo real!</Card.Text>
          <div className="btn-wrapper">
            <Button variant="success" href={SPREADSHEET_URL} target="_blank">
              {/* <Button variant="success" href="NOVO LINK DO DRIVE" target="_blank"> */}
              <strong>PLANILHA INSCRIÇÕES</strong>
            </Button>
            <Button variant="info" href={FILTERS_URL} target="_blank">
              <strong>PLANILHA FILTROS</strong>
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  </Row>
);

const Admin = ({ totalRegistrations }) => {
  const isAdminPathname = window.location.pathname === '/admin';
  const [availablePackages, setAvailablePackages] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const navigateTo = useNavigate();
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(PACKAGES_ENDPOINT);
        setAvailablePackages(response.data);
      } catch (error) {
        console.error(error.message);
      }
    };

    if (isLoggedIn) {
      fetchPackages();
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    try {
      const response = await axios.get(CREDENTIALS_ENDPOINT);
      const credentialsData = response.data;

      const user = credentialsData.find((u) => u.login === loginData.username && u.password === loginData.password);

      if (user) {
        setIsLoggedIn(true);
        setLoggedInUsername(user.login);
        toast.success('Usuário logado com sucesso!');
      } else {
        toast.error('Credenciais Inválidas. Tente novamente!');
      }
    } catch (error) {
      console.error(error.message);
      toast.error('Erro ao buscar credenciais. Tente novamente mais tarde.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUsername('');
    setLoginData({ username: '', password: '' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const availablePackagesTotal = availablePackages.totalPackages || {};
  const availablePackagesUsed = availablePackages.usedPackages || {};

  const schoolIndividualTotal = availablePackagesTotal?.colegioIndividual || 0;
  const schoolFamilyTotal = availablePackagesTotal?.colegioFamilia || 0;
  const seminaryTotal = availablePackagesTotal?.seminario || 0;
  const hotelTotal = availablePackagesTotal?.hotel || 0;
  const otherTotal = availablePackagesTotal?.outro || 0;

  const schoolIndividualUsed =
    availablePackagesUsed.colegioIndividualComOnibus + availablePackagesUsed.colegioIndividualSemOnibus;
  const schoolFamilyUsed =
    availablePackagesUsed.colegioFamiliaComOnibus + availablePackagesUsed.colegioFamiliaSemOnibus;
  const schoolCampingUsed =
    availablePackagesUsed.colegioCampingComOnibus + availablePackagesUsed.colegioCampingSemOnibus;
  const seminaryUsed =
    availablePackagesUsed.seminarioIndividualComOnibus + availablePackagesUsed.seminarioIndividualSemOnibus;
  const hotelUsed = availablePackagesUsed.hotelDuplaComOnibus + availablePackagesUsed.hotelDuplaSemOnibus;
  const otherUsed = availablePackagesUsed.outroComOnibus + availablePackagesUsed.outroSemOnibus;

  const schoolIndividualWithBus = availablePackagesUsed.colegioIndividualComOnibus;
  const schoolFamilyWithBus = availablePackagesUsed.colegioFamiliaComOnibus;
  const schoolCampingWithBus = availablePackagesUsed.colegioCampingComOnibus;
  const seminaryWithBus = availablePackagesUsed.seminarioIndividualComOnibus;
  const hotelWithBus = availablePackagesUsed.hotelDuplaComOnibus;
  const otherWithBus = availablePackagesUsed.outroComOnibus;

  const totalVacanciesWithBuses =
    schoolIndividualWithBus +
    schoolFamilyWithBus +
    schoolCampingWithBus +
    seminaryWithBus +
    hotelWithBus +
    otherWithBus;
  const totalVacanciesFilled =
    schoolIndividualUsed + schoolFamilyUsed + schoolCampingUsed + seminaryUsed + hotelUsed + otherUsed;

  const calculateVacancies = (usedPackages, totalPackages, withBus, withoutBus, specificTotals) => {
    if (
      usedPackages &&
      totalPackages &&
      Object.keys(usedPackages).length > 0 &&
      Object.keys(totalPackages).length > 0
    ) {
      const filledVacancies = usedPackages[withBus] + usedPackages[withoutBus];

      const totalVacancies = specificTotals[withBus];

      const remainingVacancies = totalVacancies - filledVacancies;

      return { filledVacancies, remainingVacancies };
    } else {
      return { filledVacancies: '-', remainingVacancies: '-' };
    }
  };

  const createCardData = (title, withBusKey, withoutBusKey, background, titleColor) => {
    const usedPackages = availablePackages.usedPackages || {};
    const totalPackages = availablePackages.totalPackages || {};

    const { filledVacancies, remainingVacancies } = calculateVacancies(
      usedPackages,
      totalPackages,
      withBusKey,
      withoutBusKey,
      {
        colegioIndividualComOnibus: schoolIndividualTotal,
        colegioFamiliaComOnibus: schoolFamilyTotal,
        seminarioIndividualComOnibus: seminaryTotal,
        hotelDuplaComOnibus: hotelTotal,
        outroComOnibus: otherTotal,
      },
    );

    return {
      title,
      remainingVacancies,
      filledVacancies,
      background,
      titleColor,
    };
  };

  const cards = [
    createCardData(
      'Colégio XV - Individual',
      'colegioIndividualComOnibus',
      'colegioIndividualSemOnibus',
      'bg-dark',
      'text-warning',
    ),
    createCardData(
      'Colégio XV - Família',
      'colegioFamiliaComOnibus',
      'colegioFamiliaSemOnibus',
      'bg-light',
      'text-success',
    ),
    createCardData(
      'Seminário São José',
      'seminarioIndividualComOnibus',
      'seminarioIndividualSemOnibus',
      'bg-dark',
      'text-warning',
    ),
    createCardData('Hotel Íbis', 'hotelDuplaComOnibus', 'hotelDuplaSemOnibus', 'bg-light', 'text-success'),
    createCardData('Outra Acomodação', 'outroComOnibus', 'outroSemOnibus', 'bg-dark', 'text-warning'),
  ];

  const firstRowCards = cards.slice(0, 5);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {isAdminPathname && (
        <Container className="p-4 admin" fluid>
          {!isLoggedIn ? (
            <Row className="justify-content-center">
              <Row>
                <Col xs={12} className="text-end mb-2">
                  <p className="d-none d-sm-block">Clique para voltar ao Formulário de inscrição:</p>
                  <Button variant="danger" onClick={(handleLogout, () => navigateTo('/'))}>
                    Voltar
                  </Button>
                </Col>
              </Row>
              <Col xs={12} md={6}>
                <Form>
                  <h4 className="text-center fw-bold mb-5">LOGIN ADMIN</h4>

                  <Form.Group className="input-login-wrapper mb-3" controlId="username">
                    <Form.Label className="fw-bold">Nome de Usuário:</Form.Label>
                    <Form.Control
                      className="admin__user"
                      type="text"
                      placeholder="Digite seu nome de usuário"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      onKeyDown={handleKeyDown}
                    />
                  </Form.Group>

                  <Form.Group className="input-login-wrapper mb-3" controlId="password">
                    <Form.Label className="fw-bold">Senha:</Form.Label>
                    <Form.Control
                      className="admin__password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      onKeyDown={handleKeyDown}
                    />
                    <Icon
                      className="login-icon"
                      typeIcon={showPassword ? 'visible-password' : 'hidden-password'}
                      onClick={handleShowPassword}
                    />
                  </Form.Group>

                  <div className="input-login-btn-wrapper d-flex justify-content-end">
                    <Button variant="primary" onClick={handleLogin}>
                      Entrar
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          ) : (
            <>
              <Row>
                <Col xs={12} className="text-end mb-2">
                  <p>
                    Bem-vinda,
                    <span>
                      <strong className="text-uppercase"> {loggedInUsername}</strong>
                    </span>
                    !
                  </p>
                  <Button variant="danger" onClick={handleLogout}>
                    Sair
                  </Button>
                </Col>
              </Row>
              <Row>
                <h4 className="text-center text-info fw-bold mb-4">PACOTES</h4>
                {firstRowCards.map((card) => (
                  <PackageCard key={card.title} {...card} />
                ))}
              </Row>

              <div className="packages-horizontal-line" />

              <Row className="mt-4 d-none d-md-flex">
                <Col xs={12} md={6} lg={4}>
                  <h4 className="text-center text-info fw-bold mb-4">TRANSPORTE</h4>
                </Col>
                <Col xs={12} md={6} lg={4}>
                  <h4 className="text-center text-info fw-bold mb-4">TOTAL</h4>
                </Col>
              </Row>

              <Row className="mt-4 d-flex d-md-none">
                <Col xs={12}>
                  <h4 className="text-center text-info fw-bold mb-4">TRANSPORTE E TOTAL</h4>
                </Col>
              </Row>

              <Row>
                <Col className="mb-4" xs={12} md={6} lg={4}>
                  <Card className="h-100 bg-dark">
                    <Card.Body>
                      <Card.Title className="fw-bold text-warning">Ônibus Preenchidos</Card.Title>
                      <Card.Text>
                        Vagas Preenchidas com Ônibus:{' '}
                        <em>
                          <b>{isNaN(totalVacanciesWithBuses) ? 'Indefinido' : totalVacanciesWithBuses.toString()}</b>
                        </em>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col className="mb-4" xs={12} md={6} lg={4}>
                  <Card className="bg-light">
                    <Card.Body>
                      <Card.Title className="fw-bold text-success">Total de Inscritos Apenas Adultos</Card.Title>
                      <Card.Text>
                        Vagas Totais Preenchidas:{' '}
                        <em>
                          <b>{isNaN(totalRegistrations) ? 'Indefinido' : totalRegistrations.toString()}</b>
                        </em>
                        <br />
                        Vagas Totais Restantes:{' '}
                        <em>
                          <b>
                            {isNaN(300 - totalRegistrations) ? 'Indefinido' : (300 - totalRegistrations).toString()}
                          </b>
                        </em>
                        <br />
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col className="mb-4" xs={12} md={6} lg={4}>
                  <Card className="bg-dark">
                    <Card.Body>
                      <Card.Title className="fw-bold text-warning">Total de Inscritos Geral</Card.Title>
                      <Card.Text>
                        Vagas Totais Preenchidas:{' '}
                        <em>
                          <b>{isNaN(totalVacanciesFilled) ? 'Indefinido' : totalVacanciesFilled.toString()}</b>
                        </em>
                        <br />
                        Vagas Totais Restantes: Vagas Totais Restantes (Adultos):{' '}
                        <em>
                          <b>
                            {isNaN(300 - totalVacanciesFilled) ? 'Indefinido' : (300 - totalVacanciesFilled).toString()}
                          </b>
                        </em>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="packages-horizontal-line" />

              <Row>
                <ExternalLinkRow />
              </Row>
            </>
          )}
        </Container>
      )}
    </>
  );
};

export default Admin;
