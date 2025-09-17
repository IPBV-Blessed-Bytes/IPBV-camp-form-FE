import { Modal, Button, Form } from 'react-bootstrap';
import Columns from './Columns';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';

const EditAndAddCamperModal = ({
  name,
  showEditModal,
  setShowEditModal,
  showAddModal,
  setShowAddModal,
  showDeleteModal,
  modalType,
  formSubmitted,
  editFormData,
  currentDate,
  handleSaveEdit,
  addFormData,
  handleFormChange,
  handleAddSubmit,
  handleCloseDeleteModal,
  handleConfirmDeleteAll,
  handleConfirmDeleteSpecific,
}) => {
  return (
    <>
      <Modal className="custom-modal" show={showEditModal} size="xl" onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton className="custom-modal__header--confirm">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="edit" iconSize={25} />
            <b>Editar Inscrição</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Columns
              editFormData={editFormData}
              handleFormChange={(e) => handleFormChange(e, 'edit')}
              formSubmitted={formSubmitted}
              currentDate={currentDate}
              editForm
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" className="btn-confirm" onClick={handleSaveEdit}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal className="custom-modal" show={showAddModal} size="xl" onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton className="custom-modal__header--confirm">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="plus" iconSize={25} fill={'#057c05'} />
            <b>Nova Inscrição</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Columns
              addFormData={addFormData}
              handleFormChange={(e) => handleFormChange(e, 'add')}
              formSubmitted={formSubmitted}
              currentDate={currentDate}
              addForm
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" className="btn-confirm" onClick={handleAddSubmit}>
            Adicionar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal className="custom-modal" show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton className="custom-modal__header--cancel">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="info" iconSize={25} fill={'#dc3545'} />
            <b>Confirmar Exclusão</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'delete-all'
            ? 'Tem certeza que deseja excluir as inscrições selecionadas?'
            : `Tem certeza que deseja excluir a inscrição de ${name}?`}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            className="btn-cancel"
            onClick={modalType === 'delete-all' ? handleConfirmDeleteAll : handleConfirmDeleteSpecific}
          >
            Deletar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

EditAndAddCamperModal.propTypes = {
  name: PropTypes.string,
  showEditModal: PropTypes.bool,
  setShowEditModal: PropTypes.func,
  showAddModal: PropTypes.bool,
  setShowAddModal: PropTypes.func,
  showDeleteModal: PropTypes.bool,
  modalType: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  formSubmitted: PropTypes.bool,
  editFormData: PropTypes.object,
  currentDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  handleSaveEdit: PropTypes.func,
  addFormData: PropTypes.object,
  handleFormChange: PropTypes.func,
  handleAddSubmit: PropTypes.func,
  handleCloseDeleteModal: PropTypes.func,
  handleConfirmDeleteAll: PropTypes.func,
  handleConfirmDeleteSpecific: PropTypes.func,
};

export default EditAndAddCamperModal;
