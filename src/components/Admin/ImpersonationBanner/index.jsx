import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getImpersonation, endImpersonation } from '@/config/impersonation';
import { stopImpersonation } from '@/services/platform';
import './style.scss';

const ImpersonationBanner = () => {
  const { t } = useTranslation();
  const meta = getImpersonation();
  const [leaving, setLeaving] = useState(false);

  if (!meta) return null;

  const handleExit = async () => {
    setLeaving(true);
    const restored = endImpersonation();
    try {
      if (restored?.logId) {
        await stopImpersonation(restored.logId);
      }
    } catch {
      /* best-effort: closing the audit entry should not block leaving */
    }
    window.location.assign('/platform');
  };

  return (
    <div className="impersonation-banner" role="status">
      <span className="impersonation-banner__text">
        {t('admin.impersonation.viewingAs', {
          org: meta.organizationName,
          user: meta.targetDisplayName || meta.targetLogin,
        })}
      </span>
      <button type="button" className="impersonation-banner__exit" onClick={handleExit} disabled={leaving}>
        {leaving ? t('admin.impersonation.leaving') : t('admin.impersonation.exit')}
      </button>
    </div>
  );
};

export default ImpersonationBanner;
