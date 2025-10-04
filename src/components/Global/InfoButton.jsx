import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from '@/components/Global/Icons';
import PropTypes from 'prop-types';

const InfoButton = ({ timeout, time }) => {
  const [showWhatsAppIcon, setShowWhatsAppIcon] = useState(false);
  const [showWhatsAppButtons, setShowWhatsAppButtons] = useState(false);
  const whatsappButtonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (timeout) {
      const timer = setTimeout(() => {
        setShowWhatsAppIcon(true);
      }, time || 6000);

      return () => clearTimeout(timer);
    } else {
      setShowWhatsAppIcon(true);
    }
  }, [timeout]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (whatsappButtonRef.current && !whatsappButtonRef.current.contains(event.target)) {
        setShowWhatsAppButtons(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [whatsappButtonRef]);

  const toggleWhatsAppButtons = () => {
    setShowWhatsAppButtons(!showWhatsAppButtons);
  };

  return (
    <>
      {showWhatsAppIcon && (
        <button ref={whatsappButtonRef} className="info-btn" onClick={toggleWhatsAppButtons}>
          <Icons typeIcon="info" iconSize={25} fill={'#ffc107'} />
        </button>
      )}

      <div className={`info-floating-buttons ${showWhatsAppButtons ? 'show' : ''}`}>
        <button
          className="whatsapp-message-button"
          onClick={() => window.open('https://wa.me/5581998390194', '_blank')}
        >
          Fale Conosco&nbsp;
          <Icons className="info-icons" typeIcon="whatsapp" iconSize={25} fill={'#000'} />
        </button>
        <button
          className="whatsapp-share-button"
          onClick={() =>
            window.open(
              'https://wa.me/?text=Faça%20sua%20inscrição%20no%20acampamento%20da%20IPBV%202025%3A%20https://inscricaoipbv.com.br/',
              '_blank',
            )
          }
        >
          Compartilhar&nbsp;
          <Icons className="info-icons" typeIcon="share" iconSize={25} fill={'#000'} />
        </button>
        <button className="verify-registration-button" onClick={() => navigate('/verificacao')}>
          Verificar Inscrição&nbsp;
          <Icons className="info-icons" typeIcon="refresh" iconSize={25} fill={'#000'} />
        </button>
        <button className="verify-registration-button" onClick={() => navigate('/perguntas')}>
          Perguntas Frequentes&nbsp;
          <Icons className="info-icons" typeIcon="question" iconSize={25} fill={'#000'} />
        </button>
      </div>
    </>
  );
};

InfoButton.propTypes = {
  timeout: PropTypes.bool,
};

export default InfoButton;
