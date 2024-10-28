import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import AdminLoggedOut from './AdminPages/adminLoggedOut';
import AdminLoggedIn from './AdminPages/adminLoggedIn';
import useAuth from '@/hooks/useAuth';
import scrollUp from '@/hooks/useScrollUp';

const AdminHome = ({ totalRegistrationsGlobal, userRole, totalValidWithBus }) => {
  const isAdminPathname = window.location.pathname === '/admin';
  const [showPassword, setShowPassword] = useState(false);
  const navigateTo = useNavigate();
  const { login, logout, user, isLoggedIn } = useAuth();
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [sendLoggedMessage, setSendLoggedMessage] = useState(false);

  const handleLogin = () => {
    login(loginData.login, loginData.password);
    scrollUp();
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
            />
          )}
        </Container>
      )}
    </>
  );
};

AdminHome.propTypes = {
  totalRegistrationsGlobal: PropTypes.object.isRequired,
  permissions: PropTypes.array.isRequired,
  userRole: PropTypes.string,
  totalValidWithBus: PropTypes.number,
};

export default AdminHome;
