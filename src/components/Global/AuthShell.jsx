import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';
import '../Style/AuthShell.scss';

const AuthShell = ({ title, subtitle, icon = 'person', children }) => (
  <div className="auth-shell">
    <div className="auth-shell__card">
      <span className="auth-shell__brand">
        <Icons typeIcon={icon} iconSize={30} fill="#fff" />
      </span>
      {title && <h1 className="auth-shell__title">{title}</h1>}
      {subtitle && <p className="auth-shell__subtitle">{subtitle}</p>}
      <div className="auth-shell__body">{children}</div>
    </div>
  </div>
);

AuthShell.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.node,
  icon: PropTypes.string,
  children: PropTypes.node,
};

export default AuthShell;
