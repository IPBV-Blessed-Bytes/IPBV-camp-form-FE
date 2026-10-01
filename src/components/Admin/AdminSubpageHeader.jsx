import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import useAuth from '@/hooks/useAuth';
import Icons from '@/components/Global/Icons';
import { useAdminSessions } from '@/hooks/useAdminSessions';
import { resolveSession } from '@/config/adminSessions';
import AdminTopbar from './AdminTopbar';
import '../Style/adminSubpage.scss';

const AdminSubpageHeader = ({ username, title, subtitle, typeIcon, iconSize = 32, sessionKey }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout, user, displayName: authDisplayName } = useAuth();
  const { configs } = useAdminSessions();
  const topbarName = authDisplayName || username || user || t('admin.ui.userFallback');

  const resolved = sessionKey
    ? resolveSession(sessionKey, configs[sessionKey], { title, description: subtitle, icon: typeIcon })
    : null;
  const displayTitle = resolved?.title || title;
  const displaySubtitle = resolved ? resolved.description || subtitle : subtitle;
  const displayIcon = resolved?.icon || typeIcon;

  return (
    <>
      <AdminTopbar username={topbarName} logout={logout} />

      <div className="admin-subpage__hero">
        <div className="admin-subpage__hero-main">
          {displayIcon && (
            <span className="admin-subpage__hero-icon">
              <Icons typeIcon={displayIcon} iconSize={iconSize} fill="#fff" />
            </span>
          )}
          <div className="admin-subpage__hero-text">
            <h1 className="admin-subpage__title">{displayTitle}</h1>
            {displaySubtitle && <p className="admin-subpage__subtitle">{displaySubtitle}</p>}
          </div>
        </div>

        <button type="button" className="admin-subpage__back" onClick={() => navigate(-1)}>
          <Icons typeIcon="arrow-left" iconSize={18} fill="#555050" />
          <span>{t('admin.ui.back')}</span>
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
  sessionKey: PropTypes.string,
};

export default AdminSubpageHeader;
