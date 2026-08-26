import { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Html5Qrcode } from 'html5-qrcode';
import PropTypes from 'prop-types';
import CustomModal from '@/components/Global/CustomModal';

const REGION_ID = 'qr-scanner-region';

const QrScannerModal = ({ show, onHide, onScan }) => {
  const [error, setError] = useState('');

  useEffect(() => {
    if (!show) return undefined;

    setError('');
    let cancelled = false;
    let scanner = null;

    const stop = async () => {
      if (!scanner) return;
      try {
        if (scanner.isScanning) await scanner.stop();
        scanner.clear();
      } catch {
        /* ignore stop errors */
      }
    };

    const timer = setTimeout(() => {
      scanner = new Html5Qrcode(REGION_ID, { verbose: false });
      scanner
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (cancelled) return;
            cancelled = true;
            stop().finally(() => onScan(decodedText));
          },
          () => {},
        )
        .catch(() =>
          setError(
            'Não foi possível acessar a câmera. Verifique as permissões do navegador e use uma conexão segura (HTTPS).',
          ),
        );
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      stop();
    };
  }, [show, onScan]);

  return (
    <CustomModal show={show} onHide={onHide} variant="info" icon="camera" title="Escanear QR de Check-in">
      {error ? (
        <Alert variant="danger" className="mb-0">
          {error}
        </Alert>
      ) : (
        <>
          <p className="text-secondary small">Aponte a câmera para o QR do acampante.</p>
          <div id={REGION_ID} style={{ width: '100%' }} />
        </>
      )}
    </CustomModal>
  );
};

QrScannerModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onScan: PropTypes.func.isRequired,
};

export default QrScannerModal;
