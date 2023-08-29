import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import PropTypes from 'prop-types';

function Header() {
  const resolvedPath = useResolvedPath('/enviado');
  const isSubmittedPage = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <header className="bbp-header">
      <h2>ACAMPAMENTO IPBV 2024</h2>
      {!isSubmittedPage && (
        <>
          <p>Preencha o formulário abaixo para fazer sua inscrição</p>
          <nav>
            <ul>
              <Navbar to="/">Home</Navbar>
              <Navbar to="/dados">Dados Pessoais</Navbar>
              <Navbar to="/contato">Contato</Navbar>
              <Navbar to="/pacotes">Pacotes</Navbar>
              <Navbar to="/pagamento">Pagamento</Navbar>
            </ul>
          </nav>
        </>
      )}
    </header>
  );
}

export default Header;

function Navbar({ to, children }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li className={isActive ? 'active' : ''}>
      <Link to={to}>{children}</Link>
    </li>
  );
}

Navbar.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
