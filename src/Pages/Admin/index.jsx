import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import Icons from '../../components/Icons';

const API_URL = 'https://ipbv-camp-form-be-production-2b7d.up.railway.app';
const PACKAGES_ENDPOINT = `${API_URL}/package-count`;
const CREDENTIALS_ENDPOINT = `${API_URL}/credentials`;
const SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/1Fxb0cYp42SNixTJC8VshUpN1IuZkiDADxO9hWHQ9exw/edit?usp=sharing';
const OLD_SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/1PdM9oq7uESYWXM2BzVQunSu5-FmpZXswLvAxt4So8rc/edit#gid=1419229141';
const PAGARME = 'https://id.pagar.me/signin';
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
            <b>{filledVacancies || '0'}</b>
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
              <strong>PLANILHA INSCRIÇÕES</strong>
            </Button>
            <Button variant="info" href={PAGARME} target="_blank">
              <strong>PAGAR.ME</strong>
            </Button>
            <Button variant="warning" href={OLD_SPREADSHEET_URL} target="_blank">
              <strong>PLANILHA ANTIGA</strong>
            </Button>
            {/* <Button variant="info" href={FILTERS_URL} target="_blank">
              <strong>PLANILHA FILTROS</strong>
            </Button> */}
          </div>
        </Card.Body>
      </Card>
    </Col>
  </Row>
);

const Admin = ({ totalRegistrationsGlobal }) => {
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

  const totalRegistrations = totalRegistrationsGlobal.totalRegistrations;
  const totalValidRegistrations = totalRegistrationsGlobal.totalValidRegistrations;
  const totalPaiedPlusChildren = totalRegistrationsGlobal.totalPaiedPlusChildren;
  const totalChildren = totalRegistrationsGlobal.totalChildren;
  const totalNonPaied = totalRegistrationsGlobal.totalNonPaied;
  const availablePackagesTotal = availablePackages.totalPackages || {};
  const availablePackagesUsed = availablePackages.usedPackages || {};

  const schoolIndividualTotal = availablePackagesTotal?.colegioIndividual || 0;
  const schoolFamilyTotal = availablePackagesTotal?.colegioFamilia || 0;
  const schoolCampingTotal = availablePackagesTotal?.colegioCamping || 0;
  const seminaryTotal = availablePackagesTotal?.seminario || 0;
  const hotelTotal = availablePackagesTotal?.hotel || 0;
  const otherTotal = availablePackagesTotal?.outro || 0;

  const schoolIndividualWithBus = availablePackagesUsed.colegioIndividualComOnibus;
  const schoolFamilyWithBus = availablePackagesUsed.colegioFamiliaComOnibus;
  const seminaryWithBus = availablePackagesUsed.seminarioIndividualComOnibus;
  const hotelWithBus = availablePackagesUsed.hotelDuplaComOnibus;
  const otherWithBus = availablePackagesUsed.outroComOnibus;

  const totalVacanciesWithBuses =
    schoolIndividualWithBus +
    schoolFamilyWithBus +
    seminaryWithBus +
    hotelWithBus +
    otherWithBus;

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
      return { filledVacancies: '0', remainingVacancies: '0' };
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
        colegioCampingSemAlimentacao: schoolCampingTotal,
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
      'Colégio XV - Camping',
      'colegioCampingSemAlimentacao',
      'colegioCampingComAlimentacao',
      'bg-dark',
      'text-warning',
    ),
    createCardData(
      'Seminário São José',
      'seminarioIndividualComOnibus',
      'seminarioIndividualSemOnibus',
      'bg-light',
      'text-success',
    ),
    createCardData('Hotel Íbis', 'hotelDuplaComOnibus', 'hotelDuplaSemOnibus', 'bg-dark', 'text-warning'),
    createCardData('Outra Acomodação', 'outroComOnibus', 'outroSemOnibus', 'bg-light', 'text-success'),
  ];

  const firstRowCards = cards.slice(0, 6);

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
                <Col xs={12} className="text-end mb-4">
                  <p className="d-none d-sm-block">Clique para voltar ao Formulário de inscrição:</p>
                  <Button className="fw-bold" variant="danger" onClick={(handleLogout, () => navigateTo('/'))}>
                    Voltar para Formulário
                  </Button>
                </Col>
              </Row>
              <Row className="justify-content-center">
                <Col xs={12} md={6} className="d-flex justify-content-center">
                  <Form className="login-admin-card">
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
                      <Icons
                        className="login-icon"
                        typeIcon={showPassword ? 'visible-password' : 'hidden-password'}
                        onClick={handleShowPassword}
                      />
                    </Form.Group>

                    <div className="input-login-btn-wrapper d-flex justify-content-end">
                      <Button className="fw-bold" variant="primary" onClick={handleLogin}>
                        Entrar
                      </Button>
                    </div>
                  </Form>
                </Col>
              </Row>
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
                <h4 className="text-center fw-bold mb-4">PACOTES:</h4>
                {firstRowCards.map((card) => (
                  <PackageCard key={card.title} {...card} />
                ))}
              </Row>

              <Row className="mt-4">
                <h4 className="text-center fw-bold mb-4">TOTAL:</h4>
              </Row>

              <Row>
                <Col className="mb-4" xs={12} md={6} lg={4}>
                  <Card className="h-100 bg-dark">
                    <Card.Body>
                      <Card.Title className="fw-bold text-warning">Total de Inscritos VÁLIDOS (adultos)</Card.Title>
                      <Card.Text>
                        Vagas Totais Preenchidas:{' '}
                        <em>
                          <b>{isNaN(totalValidRegistrations) ? 'Indefinido' : totalValidRegistrations.toString()}</b>
                        </em>
                        <br />
                        Vagas Totais Restantes:{' '}
                        <em>
                          <b>
                            {isNaN(300 - totalValidRegistrations)
                              ? 'Indefinido'
                              : (300 - totalValidRegistrations).toString()}
                          </b>
                        </em>
                        <br />
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col className="mb-4" xs={12} md={6} lg={4}>
                  <Card className="h-100 bg-light">
                    <Card.Body>
                      <Card.Title className="fw-bold text-success">Total de Inscritos + Crianças</Card.Title>
                      <Card.Text>
                        Vagas Totais Preenchidas:{' '}
                        <em>
                          <b>{isNaN(totalPaiedPlusChildren) ? 'Indefinido' : totalPaiedPlusChildren.toString()}</b>
                        </em>
                        <br />
                        Vagas Totais Restantes:{' '}
                        <em>
                          <b>
                            {isNaN(300 - totalPaiedPlusChildren)
                              ? 'Indefinido'
                              : (300 - totalPaiedPlusChildren).toString()}
                          </b>
                        </em>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col className="mb-4" xs={12} md={6} lg={4}>
                  <Card className="h-100 bg-dark">
                    <Card.Body>
                      <Card.Title className="fw-bold text-warning">Total de Inscritos + Não pagantes</Card.Title>
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
                  <Card className="h-100 bg-light">
                    <Card.Body>
                      <Card.Title className="fw-bold text-success">Total de Crianças</Card.Title>
                      <Card.Text>
                        Vagas Totais Preenchidas:{' '}
                        <em>
                          <b>{isNaN(totalChildren) ? 'Indefinido' : totalChildren.toString()}</b>
                        </em>
                        <br />
                        Vagas Totais Restantes:{' '}
                        <em>
                          <b>{isNaN(300 - totalChildren) ? 'Indefinido' : (300 - totalChildren).toString()}</b>
                        </em>
                        <br />
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
                        <br />
                        Vagas Totais Restantes:{' '}
                        <em>
                          <b>{isNaN(300 - totalNonPaied) ? 'Indefinido' : (300 - totalNonPaied).toString()}</b>
                        </em>
                        <br />
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
                      <b>Inscritos + Crianças</b>
                    </em>{' '}
                    : Contagem de inscritos válidos e crianças
                  </li>
                  <li>
                    <em>
                      <b>Inscritos + Não pagantes</b>
                    </em>{' '}
                    : Contagem de inscritos válidos e não pagantes (day use)
                  </li>
                  <li>
                    <em>
                      <b>Ônibus Preenchidos</b>
                    </em>{' '}
                    : Contagem de pessoas inscritas nos ônibus
                  </li>
                </ul>
              </div>

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
