import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__brand">
        <span className="admin-topbar__brand-dot" />
        <h1 className="admin-topbar__brand-title">Painel Administrativo</h1>
      </div>

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
                navigate('/');
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
