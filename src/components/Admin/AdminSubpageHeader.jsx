import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '@/hooks/useAuth';
import Icons from '@/components/Global/Icons';
import AdminTopbar from './AdminTopbar';
import '../Style/adminSubpage.scss'

const AdminSubpageHeader = ({ username, title, subtitle, typeIcon, iconSize = 32 }) => {
  const navigate = useNavigate();
  const { formContext, logout, user } = useAuth();
  const homePath = formContext === 'maintenance' ? '/dev' : '/admin';
  const displayName = (username || user || 'Usuário').split('@')[0];

  return (
    <>
      <AdminTopbar username={displayName} logout={logout} />

      <div className="admin-subpage__hero">
        <div className="admin-subpage__hero-main">
          {typeIcon && (
            <span className="admin-subpage__hero-icon">
              <Icons typeIcon={typeIcon} iconSize={iconSize} fill="#fff" />
            </span>
          )}
          <div className="admin-subpage__hero-text">
            <h1 className="admin-subpage__title">{title}</h1>
            {subtitle && <p className="admin-subpage__subtitle">{subtitle}</p>}
          </div>
        </div>

        <button type="button" className="admin-subpage__back" onClick={() => navigate(homePath)}>
          <Icons typeIcon="arrow-left" iconSize={18} fill="#555050" />
          <span>Voltar</span>
        </button>
      </div>
    </>
  );
};

AdminSubpageHeader.propTypes = {
  username: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  typeIcon: PropTypes.string,
  iconSize: PropTypes.number,
};

export default AdminSubpageHeader;
