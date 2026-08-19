import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from '@/components/Global/Icons';
import PropTypes from 'prop-types';
import '../Style/InfoButton.scss';
import { eventPath } from '@/config/eventScope';
import { useEventBranding } from '@/contexts/EventBrandingContext';

const InfoButton = ({ timeout, time }) => {
  const [showWhatsAppIcon, setShowWhatsAppIcon] = useState(false);
  const [showWhatsAppButtons, setShowWhatsAppButtons] = useState(false);
  const whatsappButtonRef = useRef(null);
  const navigate = useNavigate();
  const { contact, secondaryColor, contactMessage, shareMessage } = useEventBranding();
  const whatsappNumber = `55${(contact || '81999997767').replace(/\D/g, '')}`;
  const iconFill = secondaryColor || '#ffc107';
  const defaultShareMessage = 'Faça sua inscrição no acampamento da IPBV : https://inscricaoipbv.com.br/';
  const contactUrl = contactMessage
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(contactMessage)}`
    : `https://wa.me/${whatsappNumber}`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage || defaultShareMessage)}`;

  useEffect(() => {
    if (timeout) {
      const timer = setTimeout(() => {
        setShowWhatsAppIcon(true);
      }, time || 6000);

      return () => clearTimeout(timer);
    } else {
      setShowWhatsAppIcon(true);
    }
  }, [timeout, time]);

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
          <Icons typeIcon="info" iconSize={25} fill={iconFill} />
        </button>
      )}

      <div className={`info-floating-buttons ${showWhatsAppButtons ? 'show' : ''}`}>
        <button className="whatsapp-message-button" onClick={() => window.open(contactUrl, '_blank')}>
          Fale Conosco&nbsp;
          <Icons className="info-icons" typeIcon="whatsapp" iconSize={25} fill={'#000'} />
        </button>
        <button className="whatsapp-share-button" onClick={() => window.open(shareUrl, '_blank')}>
          Compartilhar&nbsp;
          <Icons className="info-icons" typeIcon="share" iconSize={25} fill={'#000'} />
        </button>
        <button className="verify-registration-button" onClick={() => navigate(eventPath('/verificacao'))}>
          Verificar Inscrição&nbsp;
          <Icons className="info-icons" typeIcon="refresh" iconSize={25} fill={'#000'} />
        </button>
        <button className="verify-registration-button" onClick={() => navigate(eventPath('/perguntas'))}>
          Perguntas Frequentes&nbsp;
          <Icons className="info-icons" typeIcon="question" iconSize={25} fill={'#000'} />
        </button>
      </div>
    </>
  );
};

InfoButton.propTypes = {
  timeout: PropTypes.bool,
  time: PropTypes.number,
};

export default InfoButton;
