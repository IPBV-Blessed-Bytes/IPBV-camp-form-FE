import 'bootstrap/dist/css/bootstrap.min.css';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from '@/components/Global/Icons';

const SideButtons = ({ primaryPermission, secondaryPermission }) => {
  const [showSettingsButtons, setShowSettingsButtons] = useState(false);
  const settingsButtonsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsButtonsRef.current && !settingsButtonsRef.current.contains(event.target)) {
        setShowSettingsButtons(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsButtonsRef]);

  const toggleSettingsButtons = () => {
    setShowSettingsButtons((prevState) => !prevState);
  };

  return (
    <>
      {primaryPermission && (
        <button className="data-panel-btn" onClick={() => navigate('/admin/painel')}>
          <Icons typeIcon="chart" iconSize={45} fill={'#ffc107'} />
        </button>
      )}

      {secondaryPermission && (
        <button ref={settingsButtonsRef} className="settings-btn" onClick={toggleSettingsButtons}>
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

        <button className="settings-message-button" onClick={() => navigate('/admin/lotes')}>
          Controle de Lotes&nbsp;
          <Icons className="settings-icons" typeIcon="calendar" iconSize={22} fill={'#fff'} />
        </button>

        <button className="settings-message-button" onClick={() => navigate('/admin/usuarios')}>
          Controle de Usuários&nbsp;
          <Icons className="settings-icons" typeIcon="add-person" iconSize={25} fill={'#fff'} />
        </button>

        <button className="settings-message-button" onClick={() => navigate('/admin/contexto')}>
          Contexto do Formulário&nbsp;
          <Icons className="settings-icons" typeIcon="form-context" iconSize={25} fill={'#fff'} />
        </button>
      </div>
    </>
  );
};

SideButtons.propTypes = {
  primaryPermission: PropTypes.bool,
  secondaryPermission: PropTypes.bool,
};

export default SideButtons;
