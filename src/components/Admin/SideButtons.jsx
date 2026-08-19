import 'bootstrap/dist/css/bootstrap.min.css';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';
import Icons from '@/components/Global/Icons';
import '../Style/SideButtons.scss';

const SideButtons = ({ secondaryPermission }) => {
  const [showSettingsButtons, setShowSettingsButtons] = useState(false);
  const settingsButtonsRef = useRef(null);
  const { formStage } = useContext(AuthContext);
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
      {secondaryPermission && (
        <button
          ref={settingsButtonsRef}
          className="settings-btn"
          onClick={toggleSettingsButtons}
          title="Ferramentas de Administrador"
        >
          <Icons typeIcon="settings" iconSize={45} fill={'#fff'} />
        </button>
      )}

      <div className={`settings-floating-buttons ${showSettingsButtons ? 'show' : ''}`}>
        <button
          className="settings-message-button"
          onClick={formStage === 'maintenance' ? () => navigate('/dev/logs') : () => navigate('/admin/logs')}
        >
          Logs de Usuários&nbsp;
          <Icons className="settings-icons" typeIcon="logs" iconSize={25} fill={'#fff'} />
        </button>

        <button
          className="settings-message-button"
          onClick={formStage === 'maintenance' ? () => navigate('/dev/vagas') : () => navigate('/admin/vagas')}
        >
          Vagas&nbsp;
          <Icons className="settings-icons" typeIcon="camp" iconSize={25} fill={'#fff'} />
        </button>

        <button
          className="settings-message-button"
          onClick={formStage === 'maintenance' ? () => navigate('/dev/lotes') : () => navigate('/admin/lotes')}
        >
          Lotes e Data&nbsp;
          <Icons className="settings-icons" typeIcon="calendar" iconSize={22} fill={'#fff'} />
        </button>

        <button
          className="settings-message-button"
          onClick={formStage === 'maintenance' ? () => navigate('/dev/produtos') : () => navigate('/admin/produtos')}
        >
          Produtos&nbsp;
          <Icons className="settings-icons" typeIcon="cart" iconSize={25} fill={'#fff'} />
        </button>

        <button
          className="settings-message-button"
          onClick={formStage === 'maintenance' ? () => navigate('/dev/usuarios') : () => navigate('/admin/usuarios')}
        >
          Usuários&nbsp;
          <Icons className="settings-icons" typeIcon="add-person" iconSize={25} fill={'#fff'} />
        </button>

        <button
          className="settings-message-button"
          onClick={formStage === 'maintenance' ? () => navigate('/dev/papeis') : () => navigate('/admin/papeis')}
        >
          Papéis e Permissões&nbsp;
          <Icons className="settings-icons" typeIcon="feedback" iconSize={25} fill={'#fff'} />
        </button>

        <button
          className="settings-message-button"
          onClick={
            formStage === 'maintenance' ? () => navigate('/dev/solicitacoes') : () => navigate('/admin/solicitacoes')
          }
        >
          Solicitações de Alteração&nbsp;
          <Icons className="settings-icons" typeIcon="refresh" iconSize={22} fill={'#fff'} />
        </button>

        <button
          className="settings-message-button"
          onClick={
            formStage === 'maintenance' ? () => navigate('/dev/pulseiras') : () => navigate('/admin/pulseiras')
          }
        >
          Pulseiras&nbsp;
          <Icons className="settings-icons" typeIcon="wristband" iconSize={25} fill={'#fff'} />
        </button>

         <button
          className="settings-message-button"
          onClick={
            formStage === 'maintenance' ? () => navigate('/dev/info') : () => navigate('/admin/info')
          }
        >
          Informações Iniciais Form&nbsp;
          <Icons className="settings-icons" typeIcon="info" iconSize={25} fill={'#fff'} />
        </button>

        <button
          className="settings-message-button"
          onClick={formStage === 'maintenance' ? () => navigate('/dev/estagio') : () => navigate('/admin/estagio')}
        >
          Estágio do Formulário&nbsp;
          <Icons className="settings-icons" typeIcon="form-context" iconSize={22} fill={'#fff'} />
        </button>
      </div>
    </>
  );
};

SideButtons.propTypes = {
  formStage: PropTypes.string,
  secondaryPermission: PropTypes.bool,
};

export default SideButtons;
