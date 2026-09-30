import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';
import '../Style/AdminTopbar.scss';
import { eventPath, getEventSlug, setSelectedEvent, setSelectedEventName } from '@/config/eventScope';
import { listMyEvents } from '@/services/events';
import ChangePasswordModal from '@/components/Global/ChangePasswordModal';
import LanguageSwitcher from '@/components/Global/LanguageSwitcher';

const getInitials = (name) => {
  if (!name) return '?';
  if (name.includes('@')) return name.split('@')[0].slice(0, 2).toUpperCase();
  const parts = name.replace(/[._-]/g, ' ').split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AdminTopbar = ({ username, logout }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const currentSlug = getEventSlug();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    listMyEvents()
      .then((list) => {
        const arr = Array.isArray(list) ? list : list?.events || [];
        setEvents(arr);
        const current = arr.find((event) => event.slug === currentSlug);
        if (current?.name) setSelectedEventName(current.name);
      })
      .catch(() => setEvents([]));
  }, [currentSlug]);

  const handleEventChange = (slug) => {
    if (!slug || slug === currentSlug) return;
    const chosen = events.find((event) => event.slug === slug);
    setSelectedEvent(slug, chosen?.name);
    // Re-scope the whole admin to the chosen event (fetchers read the selected slug).
    window.location.assign('/admin');
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__brand">
        <span className="admin-topbar__brand-dot" />
        <h1 className="admin-topbar__brand-title">{t('common.adminPanel')}</h1>
      </div>

      {events.length > 0 && (
        <div className="admin-topbar__event">
          <span className="admin-topbar__event-label">{t('common.event')}</span>
          <select
            className="admin-topbar__event-select"
            value={currentSlug || ''}
            onChange={(e) => handleEventChange(e.target.value)}
            aria-label={t('common.selectEvent')}
          >
            {!currentSlug && (
              <option value="" disabled>
                Selecione um evento…
              </option>
            )}
            {events.map((event) => (
              <option key={event.slug} value={event.slug}>
                {event.name || event.slug}
              </option>
            ))}
          </select>
        </div>
      )}

      <LanguageSwitcher />

      <div className="admin-topbar__actions" ref={menuRef}>
        <button
          type="button"
          className="admin-topbar__user"
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="admin-topbar__avatar">{getInitials(username)}</span>
          <span className="admin-topbar__user-name">{username?.includes('@') ? username.split('@')[0] : username}</span>
          <span className={`admin-topbar__chevron ${open ? 'is-open' : ''}`}>▾</span>
        </button>

        {open && (
          <div className="admin-topbar__menu" role="menu">
            <button
              type="button"
              className="admin-topbar__menu-item"
              onClick={() => {
                setOpen(false);
                navigate(eventPath('/'));
              }}
            >
              <Icons typeIcon="arrow-left" iconSize={18} fill="#555050" />
              <span>{t('common.backToForm')}</span>
            </button>
            <button
              type="button"
              className="admin-topbar__menu-item"
              onClick={() => {
                setOpen(false);
                navigate('/admin/manual');
              }}
            >
              <Icons typeIcon="info" iconSize={18} fill="#555050" />
              <span>{t('common.manualHelp')}</span>
            </button>
            <button
              type="button"
              className="admin-topbar__menu-item"
              onClick={() => {
                setOpen(false);
                setShowChangePassword(true);
              }}
            >
              <Icons typeIcon="refresh" iconSize={18} fill="#555050" />
              <span>{t('common.changePassword')}</span>
            </button>
            <div className="admin-topbar__menu-divider" />
            <button
              type="button"
              className="admin-topbar__menu-item admin-topbar__menu-item--danger"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              <Icons typeIcon="logout" iconSize={18} fill="#d32f2f" />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        )}
      </div>

      <ChangePasswordModal show={showChangePassword} onHide={() => setShowChangePassword(false)} />
    </header>
  );
};

AdminTopbar.propTypes = {
  username: PropTypes.string.isRequired,
  logout: PropTypes.func.isRequired,
};

export default AdminTopbar;
