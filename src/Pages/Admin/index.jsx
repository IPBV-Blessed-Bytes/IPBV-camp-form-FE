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

const PackageCard = ({ title, remainingVacancies, filledVacancies }) => (
  <Col className="mb-4" xs={12} md={6} lg={4}>
    <Card>
      <Card.Body>
        <Card.Title className="fw-bold">{title}</Card.Title>
        <Card.Text>
          {`Vagas Restantes: ${remainingVacancies}`}
          <br />
          {`Vagas Preenchidas: ${filledVacancies || '-'}`}
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
);

const ExternalLinkRow = () => (
  <Row className="mt-4 p-0">
    <Col xs={12} className="text-center">
      <Card>
        <Card.Body>
          <Card.Title className="fw-bold">Link da Planilha</Card.Title>
          <Card.Text>Clique no botão abaixo para acessar a planilha das inscrições em tempo real!</Card.Text>
          <Button
            variant="success"
            href="https://docs.google.com/spreadsheets/d/1BY0Owcj99nG9DtTx6XLHioZEQnY7Ffb7inX2gBd11WY/edit?usp=sharing"
            target="_blank"
          >
            <strong>PLANILHA INSCRIÇÕES</strong>
          </Button>
        </Card.Body>
      </Card>
    </Col>
  </Row>
);

const Admin = () => {
  const isNotChurchPathname = window.location.pathname !== '/igreja/admin';
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
        const response = await axios.get('https://ipbv-camp-form-be-production.up.railway.app/contagem-pacotes');
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
      const response = await axios.get('https://ipbv-camp-form-be-production.up.railway.app/credentials');
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

  const calculateVacancies = (usedPackages, totalPackages, withBus, withoutBus) => {
    const filledVacancies = usedPackages ? usedPackages[withBus] + usedPackages[withoutBus] : '-';
    const remainingVacancies = usedPackages ? totalPackages - usedPackages[withBus] - usedPackages[withoutBus] : '-';
    return { filledVacancies, remainingVacancies };
  };

  const createCardData = (title, usedPackages, totalPackages, withBus, withoutBus) => {
    const { filledVacancies, remainingVacancies } = calculateVacancies(
      availablePackages.usedPackages,
      availablePackages.totalPackages,
      usedPackages,
      totalPackages,
    );

    return {
      title,
      remainingVacancies,
      filledVacancies,
    };
  };

  const cards = [
    createCardData(
      'Colégio XV - Individual',
      'colegioIndividualComOnibus',
      'colegioIndividual',
      'colegioIndividualComOnibus',
      'colegioIndividualSemOnibus',
    ),
    createCardData(
      'Colégio XV - Família',
      'colegioFamiliaComOnibus',
      'colegioFamilia',
      'colegioFamiliaComOnibus',
      'colegioFamiliaSemOnibus',
    ),
    createCardData(
      'Seminário São José',
      'seminarioIndividualComOnibus',
      'seminario',
      'seminarioIndividualComOnibus',
      'seminarioIndividualSemOnibus',
    ),
    createCardData('Hotel Íbis', 'hotelDuplaComOnibus', 'hotel', 'hotelDuplaComOnibus', 'hotelDuplaSemOnibus'),
    createCardData('Outra Acomodação', 'outroComOnibus', 'outro', 'outroComOnibus', 'outroSemOnibus'),
    createCardData(
      'Ônibus Preenchidos',
      'colegioFamiliaComOnibus',
      'colegioIndividualComOnibus',
      'colegioFamiliaComOnibus',
      'colegioIndividualComOnibus',
      'hotelDuplaComOnibus',
      'seminarioIndividualComOnibus',
      'outroComOnibus',
    ),
    createCardData(
      'Total de Inscritos',
      'colegioFamiliaComOnibus',
      'colegioIndividualComOnibus',
      'colegioFamiliaComOnibus',
      'colegioIndividualComOnibus',
      'hotelDuplaComOnibus',
      'seminarioIndividualComOnibus',
      'outroComOnibus',
    ),
  ];

  const firstRowCards = cards.slice(0, 5);
  const secondRowCards = cards.slice(5, 6);
  const thirdRowCards = cards.slice(6);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`p-4 admin ${isNotChurchPathname && 'd-none'}`}>
      <Container fluid>
        {!isLoggedIn ? (
          <Row className="justify-content-center">
            <Row>
              <Col xs={12} className="text-end mb-2">
                <p>Clique para voltar ao Formulário de inscrição:</p>
                <a onClick={() => navigateTo('/')}>
                  <Button variant="danger" onClick={handleLogout}>
                    Voltar
                  </Button>
                </a>
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
              {secondRowCards.map((card) => (
                <PackageCard key={card.title} {...card} />
              ))}

              {thirdRowCards.map((card) => (
                <PackageCard key={card.title} {...card} />
              ))}
            </Row>
            <Row>
              <ExternalLinkRow />
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default Admin;
