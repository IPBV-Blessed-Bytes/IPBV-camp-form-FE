import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import AdminLoggedOut from './adminComponents/adminLoggedOut';
import AdminLoggedIn from './adminComponents/adminLoggedIn';

const API_URL = 'https://ipbv-camp-form-be-production-2b7d.up.railway.app';
const PACKAGES_ENDPOINT = `${API_URL}/package-count`;
const LOGIN_ENDPOINT = `${API_URL}/login`;
const VERIFY_TOKEN_ENDPOINT = `${API_URL}/verify-token`;

const AdminHome = ({ totalRegistrationsGlobal }) => {
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
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.post(VERIFY_TOKEN_ENDPOINT, { token });
          if (response.data.valid) {
            setIsLoggedIn(true);
            setLoggedInUsername(response.data.username);
            fetchPackages();
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error(error.message);
          handleLogout();
        }
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(PACKAGES_ENDPOINT, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
      const response = await axios.post(LOGIN_ENDPOINT, loginData);
      const { token, username } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
        setLoggedInUsername(username);
        toast.success('Usuário logado com sucesso!');
        fetchPackages();
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
    localStorage.removeItem('token');
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
  const hotelTotal = availablePackagesTotal?.hotel || 0;
  const otherTotal = availablePackagesTotal?.outro || 0;

  const schoolIndividualWithBus = availablePackagesUsed.colegioIndividualComOnibus;
  const schoolFamilyWithBus = availablePackagesUsed.colegioFamiliaComOnibus;
  const seminaryWithBus = availablePackagesUsed.seminarioIndividualComOnibus;
  const hotelWithBus = availablePackagesUsed.hotelDuplaComOnibus;
  const otherWithBus = availablePackagesUsed.outroComOnibus;

  const totalVacanciesWithBuses =
    schoolIndividualWithBus + schoolFamilyWithBus + seminaryWithBus + hotelWithBus + otherWithBus;

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
            <AdminLoggedOut
              handleLogout={handleLogout}
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
              loggedInUsername={loggedInUsername}
              handleLogout={handleLogout}
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
  totalRegistrationsGlobal: PropTypes.func.isRequired,
};

export default AdminHome;
