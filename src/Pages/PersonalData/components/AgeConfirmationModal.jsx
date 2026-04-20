import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

import CustomModal from '@/components/Global/CustomModal';

const AgeConfirmationModal = ({
  showModal,
  currentAge,
  handleCancelAge,
  handleConfirmAge,
  restoreScrollWhenMobile,
}) => (
  <CustomModal
    show={showModal}
    onHide={handleCancelAge}
    onExited={restoreScrollWhenMobile}
    variant="confirm"
    title="Confirmação de Idade"
    centered={false}
    footer={
      <>
        <Button variant="outline-secondary" onClick={handleCancelAge}>
          Cancelar
        </Button>
        <Button className="btn-confirm" onClick={handleConfirmAge}>
          Confirmar
        </Button>
      </>
    }
  >
    A sua idade no período do acampamento será de <strong>{currentAge} anos</strong>. Confirma essa idade?
  </CustomModal>
);

AgeConfirmationModal.propTypes = {
  showModal: PropTypes.bool,
  currentAge: PropTypes.number,
  handleCancelAge: PropTypes.func,
  handleConfirmAge: PropTypes.func,
  restoreScrollWhenMobile: PropTypes.func,
};

export default AgeConfirmationModal;
