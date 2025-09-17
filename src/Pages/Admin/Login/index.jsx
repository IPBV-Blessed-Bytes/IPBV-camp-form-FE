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
  availablePackages,
  spinnerLoading,
  totalBusVacancies,
  totalRegistrations,
  totalSeats,
  totalValidWithBus,
  userRole,
}) => {
  const isAdminPathname = window.location.pathname === '/admin';
  const [showPassword, setShowPassword] = useState(false);
  const navigateTo = useNavigate();
  const { login, logout, user, isLoggedIn, loading } = useAuth();
  const [loginData, setLoginData] = useState({ login: '', password: '' });
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
              handleKeyDown={handleKeyDown}
              handleLogin={handleLogin}
              handleShowPassword={handleShowPassword}
              loginData={loginData}
              navigateTo={navigateTo}
              setLoginData={setLoginData}
              showPassword={showPassword}
            />
          )}

          {isLoggedIn && (
            <AdminLoggedIn
              availablePackages={availablePackages}
              loggedInUsername={user || 'Usuário não identificado'}
              logout={logout}
              sendLoggedMessage={sendLoggedMessage}
              setSendLoggedMessage={setSendLoggedMessage}
              spinnerLoading={spinnerLoading}
              totalBusVacancies={totalBusVacancies}
              totalRegistrations={totalRegistrations}
              totalSeats={totalSeats}
              totalValidWithBus={totalValidWithBus}
              user={user}
              userRole={userRole}
            />
          )}

          <Loading loading={loading} />
        </Container>
      )}
    </>
  );
};

Login.propTypes = {
  totalRegistrations: PropTypes.object.isRequired,
  userRole: PropTypes.string,
  totalValidWithBus: PropTypes.number,
  availablePackages: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  totalSeats: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  totalBusVacancies: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  spinnerLoading: PropTypes.bool,
};

export default Login;
