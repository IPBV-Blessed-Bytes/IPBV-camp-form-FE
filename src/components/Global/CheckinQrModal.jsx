import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import QRCode from 'qrcode';
import PropTypes from 'prop-types';
import CustomModal from '@/components/Global/CustomModal';
import { buildCheckoutQr } from '@/utils/checkinQr';

const formatCpf = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const CheckinQrModal = ({ show, onHide, cpf, name, orderNumber, count }) => {
  const [dataUrl, setDataUrl] = useState('');
  const isCheckout = Boolean(orderNumber);

  useEffect(() => {
    if (!show) return;

    const content = isCheckout ? buildCheckoutQr(orderNumber) : String(cpf ?? '').replace(/\D/g, '');

    if (!content) {
      setDataUrl('');
      return;
    }

    QRCode.toDataURL(content, { width: 320, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(''));
  }, [show, cpf, orderNumber, isCheckout]);

  return (
    <CustomModal
      show={show}
      onHide={onHide}
      variant="info"
      icon="camera"
      title={isCheckout ? 'QR de Check-in da Família' : 'QR de Check-in'}
    >
      <div className="text-center">
        <p className="text-secondary small mb-3">
          {isCheckout
            ? 'Mostre este código na entrada do evento para fazer o check-in de todos deste pedido de uma vez.'
            : 'Mostre este código na entrada do evento para agilizar seu check-in.'}
        </p>
        {dataUrl ? (
          <img src={dataUrl} alt="QR de check-in" style={{ width: 280, maxWidth: '100%' }} />
        ) : (
          <div className="py-5">
            <Spinner animation="border" />
          </div>
        )}
        {isCheckout ? (
          <>
            <p className="fw-bold mt-3 mb-0">Pedido {orderNumber}</p>
            {count > 0 && (
              <p className="text-secondary mb-0">
                {count} {count === 1 ? 'inscrito' : 'inscritos'}
              </p>
            )}
          </>
        ) : (
          <>
            {name && <p className="fw-bold mt-3 mb-0">{name}</p>}
            <p className="text-secondary mb-0">{formatCpf(cpf)}</p>
          </>
        )}
      </div>
    </CustomModal>
  );
};

CheckinQrModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  cpf: PropTypes.string,
  name: PropTypes.string,
  orderNumber: PropTypes.string,
  count: PropTypes.number,
};

export default CheckinQrModal;
