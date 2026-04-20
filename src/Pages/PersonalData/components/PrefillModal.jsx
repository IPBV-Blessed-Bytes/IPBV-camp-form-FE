import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

import CustomModal from '@/components/Global/CustomModal';

const PrefillModal = ({ show, onClose, onConfirm, onReject }) => (
  <CustomModal
    show={show}
    onHide={onClose}
    variant="info"
    title="Preencher Dados"
    footer={
      <>
        <Button variant="outline-secondary" onClick={onReject}>
          Não
        </Button>
        <Button variant="primary" className="btn-inf" onClick={onConfirm}>
          Sim
        </Button>
      </>
    }
  >
    Identificamos que você participou do evento no ano passado. Deseja reutilizar suas informações para agilizar
    sua inscrição?{' '}
    <b>Seus dados só serão preenchidos após sua confirmação e não serão utilizados para nenhuma outra finalidade.</b>{' '}
    Caso opte por não reutilizar, eles serão excluídos da nossa base de dados, essa ação é irreversível.{' '}
    <em>Caso opte por utilizar, você ainda poderá editar os campos do formulário</em>, caso deseje fazer alguma
    alteração.
  </CustomModal>
);

PrefillModal.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  onReject: PropTypes.func,
};

export default PrefillModal;
