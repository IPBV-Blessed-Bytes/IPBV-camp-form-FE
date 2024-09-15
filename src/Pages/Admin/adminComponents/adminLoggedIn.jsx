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
import Icons from '../../../components/Icons';

const AdminLoggedIn = ({ loggedInUsername, handleLogout, totalRegistrationsGlobal }) => {
  const [loading, setLoading] = useState(true);
  const [availablePackages, setAvailablePackages] = useState(true);
  const navigate = useNavigate();
  const splitedUsername = loggedInUsername.split('@')[0];

  const handleTableClick = () => {
    navigate('/admin/tabela');
  };

  const handleRideClick = () => {
    navigate('/admin/carona');
  };

  // const handleCouponsClick = () => {
  //   navigate('/admin/cupom');
  // };

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

  const totalRegistrations = totalRegistrationsGlobal.totalRegistrations;
  const totalValidRegistrations = totalRegistrationsGlobal.totalValidRegistrations;
  const totalChildren = totalRegistrationsGlobal.totalChildren;
  const availablePackagesTotal = availablePackages.totalPackages || {};
  const availablePackagesUsed = availablePackages.usedPackages || {};
  const totalVacanciesWithBuses =
    availablePackagesUsed.colegioFamiliaComOnibusComAlimentacao +
      availablePackagesUsed.colegioFamiliaComOnibusSemAlimentacao +
      availablePackagesUsed.colegioIndividualComOnibusComAlimentacao +
      availablePackagesUsed.colegioIndividualComOnibusSemAlimentacao +
      availablePackagesUsed.outroComOnibusComAlimentacao +
      availablePackagesUsed.seminarioIndividualComOnibusComAlimentacao || {};

  const packageCardsData = [
    {
      title: 'Colégio Individual',
      remainingVacancies: availablePackagesTotal?.colegioIndividual || '0',
      filledVacancies:
        availablePackagesUsed?.colegioIndividualComOnibusComAlimentacao +
          availablePackagesUsed?.colegioIndividualComOnibusSemAlimentacao +
          availablePackagesUsed?.colegioIndividualSemOnibusComAlimentacao +
          availablePackagesUsed?.colegioIndividualSemOnibusSemAlimentacao || '0',
      showRemainingVacancies: true,
    },
    {
      title: 'Colégio Família',
      remainingVacancies: availablePackagesTotal?.colegioFamilia || '0',
      filledVacancies:
        availablePackagesUsed?.colegioFamiliaComOnibusComAlimentacao +
          availablePackagesUsed?.colegioFamiliaComOnibusSemAlimentacao +
          availablePackagesUsed?.colegioFamiliaSemOnibusComAlimentacao +
          availablePackagesUsed?.colegioFamiliaSemOnibusSemAlimentacao || '0',
      showRemainingVacancies: true,
    },
    {
      title: 'Colégio Camping',
      remainingVacancies: availablePackagesTotal?.colegioCamping || '0',
      filledVacancies:
        availablePackagesUsed?.colegioCampingSemOnibusComAlimentacao +
          availablePackagesUsed?.colegioCampingSemOnibusSemAlimentacao || '0',
      showRemainingVacancies: true,
    },
    {
      title: 'Seminário',
      remainingVacancies: availablePackagesTotal?.seminario || '0',
      filledVacancies:
        availablePackagesUsed?.seminarioIndividualComOnibusComAlimentacao +
          availablePackagesUsed?.seminarioIndividualSemOnibusComAlimentacao || '0',
      showRemainingVacancies: true,
    },
    {
      title: 'Outra Acomodação',
      remainingVacancies: availablePackagesTotal?.outro || '0',
      filledVacancies:
        availablePackagesUsed?.outroComOnibusComAlimentacao + availablePackagesUsed?.outroSemOnibusSemAlimentacao ||
        '0',
      showRemainingVacancies: true,
    },
    {
      title: 'Usuário Sem Custo',
      remainingVacancies: availablePackagesTotal?.usuarioSemCusto || '0',
      filledVacancies: availablePackagesUsed?.usuarioSemCusto || '0',
      showRemainingVacancies: true,
    },
  ];

  const totalCardsData = [
    {
      title: 'Total de Inscritos Válidos',
      remainingVacancies: 600 - totalValidRegistrations || '0',
      filledVacancies: totalValidRegistrations || '0',
      showRemainingVacancies: true,
    },
    {
      title: 'Total de Inscritos Geral',
      filledVacancies: totalRegistrations || '0',
      showRemainingVacancies: false,
    },
    {
      title: 'Total de Inscritos com Ônibus',
      remainingVacancies: 98 - totalVacanciesWithBuses || '0',
      filledVacancies: totalVacanciesWithBuses || '0',
      showRemainingVacancies: true,
    },
    {
      title: 'Total de Crianças',
      filledVacancies: totalChildren || '0',
      showRemainingVacancies: false,
    },
  ];

  return (
    <>
      <Row className="mb-5 justify-content-center navigation-header">
        <Col xs={12} md={6} lg={4} className="mb-3 mb-lg-0">
          <Card className="h-100" onClick={handleTableClick}>
            <Card.Body className="navigation-header__registered-card">
              <Card.Title className="text-center mb-0">
                <div className="navigation-header__registered-card__content-wrapper">
                  <em>
                    <b>Inscritos</b>
                  </em>
                  <Icons typeIcon="add-person" iconSize={40} fill={'#204691'} />
                </div>
              </Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4} className="mb-3 mb-lg-0">
          <Card className="h-100" onClick={handleRideClick}>
            <Card.Body className="navigation-header__ride-card">
              <Card.Title className="text-center mb-0">
                <div className="navigation-header__ride-card__content-wrapper">
                  <em>
                    <b>Caronas</b>
                  </em>
                  <Icons typeIcon="ride" iconSize={50} fill={'#204691'} />
                </div>
              </Card.Title>
            </Card.Body>
          </Card>
        </Col>
        {/* <Col xs={12} md={6} lg={3} className="mb-3 mb-md-0">
          <Card className="h-100" onClick={handleCouponsClick}>
            <Card.Body className="navigation-header__coupons-card">
              <Card.Title className="text-center mb-0">
                <div className="navigation-header__coupons-card__content-wrapper">
                  <em>
                    <b>Cupons</b>
                  </em>
                  <Icons typeIcon="coupon" iconSize={50} fill={'#204691'} />
                </div>
              </Card.Title>
            </Card.Body>
          </Card>
        </Col> */}
        {/* <Col xs={12} md={6} lg={2}>
          <Card className="h-100">
            <Card.Body className="navigation-header__new-card">
              <Card.Title className="text-center">
                <div className="naviagion-header__new-card__content-wrapper">
                  <em>
                    <b>Novo Card</b>
                  </em>
                  <Icons typeIcon="add-person" iconSize={50} fill={'#204691'} />
                </div>
              </Card.Title>
            </Card.Body>
          </Card>
        </Col> */}
        <Col xs={12} md={12} lg={4} className="text-end mb-2 mt-3 mt-lg-0">
          <p>
            Bem vindo(a),
            <span>
              <strong className="text-uppercase"> {splitedUsername}</strong>
            </span>
            !
          </p>
          <Button variant="danger" onClick={handleLogout}>
            Desconectar
          </Button>
        </Col>
      </Row>

      {!loading && (
        <>
          <Row>
            <h4 className="text-center fw-bold mb-4">PACOTES:</h4>
            {packageCardsData.map((card) => (
              <AdminPackageCard key={card.title} {...card} cardType="package-card" />
            ))}
          </Row>

          <Row className="mt-4">
            <h4 className="text-center fw-bold mb-4">TOTAL:</h4>
            {totalCardsData.map((card) => (
              <AdminPackageCard key={card.title} {...card} cardType="total-card" />
            ))}
          </Row>
        </>
      )}

      <div className="packages-horizontal-line" />
      <h4>Notas:</h4>
      <div>
        <ul>
          <li>
            <em>
              <b>Total de Inscritos Válidos</b>
            </em>
            : Contagem de adultos pagantes
          </li>
          <li>
            <em>
              <b>Total de Inscritos Geral</b>
            </em>
            : Contagem de adultos e crianças
          </li>
          <li>
            <em>
              <b>Total de Inscritos Com Ônibus</b>
            </em>
            : Contagem de pessoas válidas que irão de ônibus
          </li>
          <li>
            <em>
              <b>Total de Crianças</b>
            </em>
            : Contagem de crianças
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
  loggedInUsername: PropTypes.string.isRequired,
  handleLogout: PropTypes.func.isRequired,
  totalRegistrationsGlobal: PropTypes.shape({
    totalRegistrations: PropTypes.number,
    totalChildren: PropTypes.number,
    totalFilledVacancies: PropTypes.number,
    totalValidRegistrations: PropTypes.number,
  }).isRequired,
};

export default AdminLoggedIn;
