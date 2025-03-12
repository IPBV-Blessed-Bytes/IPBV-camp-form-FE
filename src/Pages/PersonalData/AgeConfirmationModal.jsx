import { Button, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

const AgeConfirmationModal = ({ showModal, currentAge, handleCancelAge, handleConfirmAge }) => {
  return (
    <Modal show={showModal} onHide={handleCancelAge}>
      <Modal.Header closeButton>
        <Modal.Title>
          <b>Confirmação de Idade</b>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        A sua idade no período do acampamento será de <strong>{currentAge} anos</strong>. Confirma essa idade?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancelAge}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleConfirmAge}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

AgeConfirmationModal.propTypes = {
  showModal: PropTypes.bool,
  currentAge: PropTypes.number,
  handleCancelAge: PropTypes.func,
  handleConfirmAge: PropTypes.func,
};

export default AgeConfirmationModal;
