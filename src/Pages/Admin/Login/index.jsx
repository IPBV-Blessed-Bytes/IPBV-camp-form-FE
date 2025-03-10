import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import useAuth from '@/hooks/useAuth';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminLoggedOut from '../LoggedOut';
import AdminLoggedIn from '../LoggedIn';

const Login = ({
  totalRegistrationsGlobal,
  userRole,
  totalValidWithBus,
  availablePackages,
  totalSeats,
  totalBusVacancies,
  spinnerLoading,
}) => {
  const isAdminPathname = window.location.pathname === '/admin';
  const [showPassword, setShowPassword] = useState(false);
  const navigateTo = useNavigate();
  const { login, logout, user, isLoggedIn, loading } = useAuth();
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [sendLoggedMessage, setSendLoggedMessage] = useState(false);
  
  scrollUp();

  const handleLogin = () => {
    login(loginData.login, loginData.password);
    setLoginData((prevLoginData) => ({ ...prevLoginData, password: '' }));
    setSendLoggedMessage(true);
  };

  const handleKeyDown = (e) => e.key === 'Enter' && handleLogin();

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {isAdminPathname && (
        <Container className="p-4 admin" fluid>
          {!isLoggedIn && (
            <AdminLoggedOut
              loginData={loginData}
              handleKeyDown={handleKeyDown}
              showPassword={showPassword}
              handleShowPassword={handleShowPassword}
              handleLogin={handleLogin}
              navigateTo={navigateTo}
              setLoginData={setLoginData}
            />
          )}

          {isLoggedIn && (
            <AdminLoggedIn
              loggedInUsername={user || 'Usuário não identificado'}
              handleLogout={logout}
              totalRegistrationsGlobal={totalRegistrationsGlobal}
              userRole={userRole}
              sendLoggedMessage={sendLoggedMessage}
              setSendLoggedMessage={setSendLoggedMessage}
              user={user}
              totalValidWithBus={totalValidWithBus}
              availablePackages={availablePackages}
              totalSeats={totalSeats}
              totalBusVacancies={totalBusVacancies}
              spinnerLoading={spinnerLoading}
            />
          )}

          <Loading loading={loading} />
        </Container>
      )}
    </>
  );
};

Login.propTypes = {
  totalRegistrationsGlobal: PropTypes.object.isRequired,
  userRole: PropTypes.string,
  totalValidWithBus: PropTypes.number,
  availablePackages: PropTypes.array,
  totalSeats: PropTypes.number,
  totalBusVacancies: PropTypes.number,
  spinnerLoading: PropTypes.bool,
};

export default Login;
