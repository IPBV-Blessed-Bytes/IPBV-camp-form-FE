import { useEffect, useState } from 'react';
import { Modal, Alert } from 'react-bootstrap';
import { Html5Qrcode } from 'html5-qrcode';
import PropTypes from 'prop-types';

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
          setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.'),
        );
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      stop();
    };
  }, [show, onScan]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Escanear QR de Check-in</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
      </Modal.Body>
    </Modal>
  );
};

QrScannerModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onScan: PropTypes.func.isRequired,
};

export default QrScannerModal;
