import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import QRCode from 'qrcode';
import PropTypes from 'prop-types';
import CustomModal from '@/components/Global/CustomModal';

const formatCpf = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const CheckinQrModal = ({ show, onHide, cpf, name }) => {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!show) return;
    const digits = String(cpf ?? '').replace(/\D/g, '');
    if (!digits) {
      setDataUrl('');
      return;
    }
    QRCode.toDataURL(digits, { width: 320, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(''));
  }, [show, cpf]);

  return (
    <CustomModal show={show} onHide={onHide} variant="info" icon="camera" title="QR de Check-in">
      <div className="text-center">
        <p className="text-secondary small mb-3">
          Mostre este código na entrada do evento para agilizar seu check-in.
        </p>
        {dataUrl ? (
          <img src={dataUrl} alt="QR de check-in" style={{ width: 280, maxWidth: '100%' }} />
        ) : (
          <div className="py-5">
            <Spinner animation="border" />
          </div>
        )}
        {name && <p className="fw-bold mt-3 mb-0">{name}</p>}
        <p className="text-secondary mb-0">{formatCpf(cpf)}</p>
      </div>
    </CustomModal>
  );
};

CheckinQrModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  cpf: PropTypes.string,
  name: PropTypes.string,
};

export default CheckinQrModal;
