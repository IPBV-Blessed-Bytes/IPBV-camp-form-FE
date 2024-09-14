import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import AdminLoggedOut from './adminComponents/adminLoggedOut';
import AdminLoggedIn from './adminComponents/adminLoggedIn';
import useAuth from '@/hooks/useAuth';

const AdminHome = ({ totalRegistrationsGlobal }) => {
  const isAdminPathname = window.location.pathname === '/admin';
  const [availablePackages, setAvailablePackages] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const navigateTo = useNavigate();
  const { login, logout, user, isLoggedIn } = useAuth();
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = () => {
    login(loginData.login, loginData.password);

    scrollUp();

    setLoginData((prevLoginData) => ({
      ...prevLoginData,

      password: '',
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const totalRegistrations = totalRegistrationsGlobal.totalRegistrations;
  const totalValidRegistrationsPaied = totalRegistrationsGlobal.totalValidRegistrationsPaied;
  const totalValidRegistrationsGlobal = totalRegistrationsGlobal.totalValidRegistrationsGlobal;
  const totalChildren = totalRegistrationsGlobal.totalChildren;
  const totalNonPaied = totalRegistrationsGlobal.totalNonPaied;
  const availablePackagesTotal = availablePackages.totalPackages || {};
  const availablePackagesUsed = availablePackages.usedPackages || {};

  const schoolIndividualTotal = availablePackagesTotal?.colegioIndividual || 0;
  const schoolFamilyTotal = availablePackagesTotal?.colegioFamilia || 0;
  const schoolCampingTotal = availablePackagesTotal?.colegioCamping || 0;
  const seminaryTotal = availablePackagesTotal?.seminario || 0;
  const otherTotal = availablePackagesTotal?.outro || 0;

  const schoolIndividualWithBus = availablePackagesUsed.colegioIndividualComOnibus;
  const schoolFamilyWithBus = availablePackagesUsed.colegioFamiliaComOnibus;
  const seminaryWithBus = availablePackagesUsed.seminarioIndividualComOnibus;
  const otherWithBus = availablePackagesUsed.outroComOnibus;

  const totalVacanciesWithBuses = schoolIndividualWithBus + schoolFamilyWithBus + seminaryWithBus + otherWithBus;

  const calculateVacancies = (usedPackages, usedValidPackages, totalPackages, withBus, withoutBus, specificTotals) => {
    if (
      usedPackages &&
      usedValidPackages &&
      totalPackages &&
      Object.keys(usedPackages).length > 0 &&
      Object.keys(usedValidPackages).length > 0 &&
      Object.keys(totalPackages).length > 0
    ) {
      const filledVacancies = usedValidPackages[withBus] + usedValidPackages[withoutBus];
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
    const usedValidPackages = availablePackages.usedValidPackages || {};

    const { filledVacancies, remainingVacancies } = calculateVacancies(
      usedPackages,
      usedValidPackages,
      totalPackages,
      withBusKey,
      withoutBusKey,
      {
        colegioIndividualComOnibus: schoolIndividualTotal,
        colegioFamiliaComOnibus: schoolFamilyTotal,
        colegioCampingSemAlimentacao: schoolCampingTotal,
        seminarioIndividualComOnibus: seminaryTotal,
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
      'bg-light',
      'text-success',
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
      'bg-light',
      'text-success',
    ),
    createCardData(
      'Seminário São José',
      'seminarioIndividualComOnibus',
      'seminarioIndividualSemOnibus',
      'bg-light',
      'text-success',
    ),
    createCardData('Outra Acomodação', 'outroComOnibus', 'outroSemOnibusSemAlimentacao', 'bg-light', 'text-success'),
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
            <AdminLoggedOut
              handleLogout={logout}
              loginData={loginData}
              handleKeyDown={handleKeyDown}
              showPassword={showPassword}
              handleShowPassword={handleShowPassword}
              handleLogin={handleLogin}
              navigateTo={navigateTo}
              setLoginData={setLoginData}
            />
          ) : (
            <AdminLoggedIn
              loggedInUsername={user ? user : 'Usuário não identificado'}
              handleLogout={logout}
              firstRowCards={firstRowCards}
              totalValidRegistrationsPaied={totalValidRegistrationsPaied}
              totalValidRegistrationsGlobal={totalValidRegistrationsGlobal}
              totalRegistrations={totalRegistrations}
              totalChildren={totalChildren}
              totalNonPaied={totalNonPaied}
              totalVacanciesWithBuses={totalVacanciesWithBuses}
            />
          )}
        </Container>
      )}
    </>
  );
};

AdminHome.propTypes = {
  totalRegistrationsGlobal: PropTypes.func,
};

export default AdminHome;
