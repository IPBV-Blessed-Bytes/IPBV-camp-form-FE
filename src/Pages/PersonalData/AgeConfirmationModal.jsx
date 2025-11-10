import { Button, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';

const AgeConfirmationModal = ({
  showModal,
  currentAge,
  handleCancelAge,
  handleConfirmAge,
  restoreScrollWhenMobile,
}) => {
  return (
    <Modal className="custom-modal" show={showModal} onHide={handleCancelAge} onExited={restoreScrollWhenMobile}>
      <Modal.Header closeButton className="custom-modal__header--confirm">
        <Modal.Title className="d-flex align-items-center gap-2">
          <Icons typeIcon="checked" iconSize={25} fill={'#057c05'} />
          <b>Confirmação de Idade</b>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        A sua idade no período do acampamento será de <strong>{currentAge} anos</strong>. Confirma essa idade?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleCancelAge}>
          Cancelar
        </Button>
        <Button className='btn-confirm' onClick={handleConfirmAge}>
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
  restoreScrollWhenMobile: PropTypes.func,
};

export default AgeConfirmationModal;
