import { Button, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

import Icons from '@/components/Global/Icons';

const PrefillModal = ({ show, onClose, onConfirm, onReject }) => (
  <Modal className="custom-modal" show={show} onHide={onClose} centered>
    <Modal.Header closeButton className="custom-modal__header--inf">
      <Modal.Title className="d-flex align-items-center gap-2">
        <Icons typeIcon="info" iconSize={25} fill={'#2E5AAC'} />
        <b>Preencher Dados</b>
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      Identificamos que você participou do evento no ano passado. Deseja reutilizar suas informações para agilizar
      sua inscrição?{' '}
      <b>
        Seus dados só serão preenchidos após sua confirmação e não serão utilizados para nenhuma outra finalidade.
      </b>{' '}
      Caso opte por não reutilizar, eles serão excluídos da nossa base de dados, essa ação é irreversível.{' '}
      <em>Caso opte por utilizar, você ainda poderá editar os campos do formulário</em>, caso deseje fazer alguma
      alteração.
    </Modal.Body>
    <Modal.Footer>
      <Button variant="outline-secondary" onClick={onReject}>
        Não
      </Button>
      <Button variant="primary" className="btn-inf" onClick={onConfirm}>
        Sim
      </Button>
    </Modal.Footer>
  </Modal>
);

PrefillModal.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  onReject: PropTypes.func,
};

export default PrefillModal;
