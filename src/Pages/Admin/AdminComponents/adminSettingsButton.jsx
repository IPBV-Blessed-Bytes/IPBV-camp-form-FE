import 'bootstrap/dist/css/bootstrap.min.css';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from '@/components/Icons';

const AdminSettingsButton = ({ permission }) => {
  const [showSettingsButtons, setShowSettingsButtons] = useState(false);
  const settingsButtonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsButtonRef.current && !settingsButtonRef.current.contains(event.target)) {
        setShowSettingsButtons(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsButtonRef]);

  const toggleSettingsButtons = () => {
    setShowSettingsButtons((prevState) => !prevState);
  };

  return (
    <>
      {permission && (
        <button ref={settingsButtonRef} className="settings-btn" onClick={toggleSettingsButtons}>
          <Icons typeIcon="settings" iconSize={45} fill={'#fff'} />
        </button>
      )}

      <div className={`settings-floating-buttons ${showSettingsButtons ? 'show' : ''}`}>
        <button className="settings-message-button" onClick={() => navigate('/admin/logs')}>
          Logs de Usuários&nbsp;
          <Icons className="settings-icons" typeIcon="logs" iconSize={25} fill={'#fff'} />
        </button>

        <button className="settings-message-button" onClick={() => navigate('/admin/vagas')}>
          Controle de Vagas&nbsp;
          <Icons className="settings-icons" typeIcon="camp" iconSize={25} fill={'#fff'} />
        </button>

        <button className="settings-message-button" onClick={() => navigate('/admin/usuarios')}>
          Controle de Usuários&nbsp;
          <Icons className="settings-icons" typeIcon="add-person" iconSize={25} fill={'#fff'} />
        </button>
      </div>
    </>
  );
};

AdminSettingsButton.propTypes = {
  permission: PropTypes.bool,
};

export default AdminSettingsButton;
