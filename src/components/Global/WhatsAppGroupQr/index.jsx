import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode';
import { WHATSAPP_GROUP_LINK } from '@/config/whatsappGroup';

const WhatsAppGroupQr = ({ size }) => {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(WHATSAPP_GROUP_LINK, { width: 320, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(''));
  }, []);

  if (!dataUrl) return null;

  return (
    <img
      src={dataUrl}
      alt="QR do grupo do WhatsApp do evento"
      style={{ width: size, maxWidth: '100%' }}
    />
  );
};

WhatsAppGroupQr.propTypes = {
  size: PropTypes.number,
};

WhatsAppGroupQr.defaultProps = {
  size: 220,
};

export default WhatsAppGroupQr;
