import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';
import '../Style/AdminTopbar.scss';
import { eventPath, getEventSlug, setSelectedEvent } from '@/config/eventScope';
import { listAllEvents } from '@/services/events';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.replace(/[._-]/g, ' ').split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AdminTopbar = ({ username, logout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
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
    listAllEvents()
      .then((list) => setEvents(Array.isArray(list) ? list : list?.events || []))
      .catch(() => setEvents([]));
  }, []);

  const handleEventChange = (slug) => {
    if (!slug || slug === currentSlug) return;
    setSelectedEvent(slug);
    // Re-scope the whole admin to the chosen event (fetchers read the selected slug).
    window.location.assign('/admin');
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__brand">
        <span className="admin-topbar__brand-dot" />
        <h1 className="admin-topbar__brand-title">Painel Administrativo</h1>
      </div>

      {events.length > 0 && (
        <div className="admin-topbar__event">
          <span className="admin-topbar__event-label">Evento:</span>
          <select
            className="admin-topbar__event-select"
            value={currentSlug}
            onChange={(e) => handleEventChange(e.target.value)}
            aria-label="Selecionar evento"
          >
            {events.map((event) => (
              <option key={event.slug} value={event.slug}>
                {event.name || event.slug}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="admin-topbar__actions" ref={menuRef}>
        <button
          type="button"
          className="admin-topbar__user"
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="admin-topbar__avatar">{getInitials(username)}</span>
          <span className="admin-topbar__user-name">{username}</span>
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
              <span>Voltar ao formulário</span>
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
              <span>Desconectar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

AdminTopbar.propTypes = {
  username: PropTypes.string.isRequired,
  logout: PropTypes.func.isRequired,
};

export default AdminTopbar;
