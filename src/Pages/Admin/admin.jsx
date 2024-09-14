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
  const [showPassword, setShowPassword] = useState(false);
  const navigateTo = useNavigate();
  const { login, logout, user, isLoggedIn } = useAuth();
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleLogin = () => {
    login(loginData.login, loginData.password);
    scrollUp();
    setLoginData((prevLoginData) => ({ ...prevLoginData, password: '' }));
  };

  const handleKeyDown = (e) => e.key === 'Enter' && handleLogin();

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
              totalRegistrationsGlobal={totalRegistrationsGlobal}
            />
          )}
        </Container>
      )}
    </>
  );
};

AdminHome.propTypes = {
  totalRegistrationsGlobal: PropTypes.object.isRequired,
};

export default AdminHome;
