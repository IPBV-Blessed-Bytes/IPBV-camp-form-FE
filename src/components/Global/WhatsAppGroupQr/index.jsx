import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode';
import useWhatsAppGroupLink from '@/hooks/useWhatsAppGroupLink';

const WhatsAppGroupQr = ({ size }) => {
  const [dataUrl, setDataUrl] = useState('');
  const link = useWhatsAppGroupLink();

  useEffect(() => {
    if (!link) {
      setDataUrl('');
      return;
    }
    QRCode.toDataURL(link, { width: 320, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(''));
  }, [link]);

  if (!link || !dataUrl) return null;

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
