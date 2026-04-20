import { Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

import CustomModal from '@/components/Global/CustomModal';
import Columns from './Columns';

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
}) => (
  <>
    <CustomModal
      show={showEditModal}
      size="xl"
      onHide={() => setShowEditModal(false)}
      variant="confirm"
      icon="edit"
      iconFill=""
      title="Editar Inscrição"
      centered={false}
      footer={
        <>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" className="btn-confirm" onClick={handleSaveEdit}>
            Salvar
          </Button>
        </>
      }
    >
      <Form>
        <Columns
          editFormData={editFormData}
          handleFormChange={(e) => handleFormChange(e, 'edit')}
          formSubmitted={formSubmitted}
          currentDate={currentDate}
          editForm
        />
      </Form>
    </CustomModal>

    <CustomModal
      show={showAddModal}
      size="xl"
      onHide={() => setShowAddModal(false)}
      variant="confirm"
      icon="plus"
      title="Nova Inscrição"
      centered={false}
      footer={
        <>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" className="btn-confirm" onClick={handleAddSubmit}>
            Adicionar
          </Button>
        </>
      }
    >
      <Form>
        <Columns
          addFormData={addFormData}
          handleFormChange={(e) => handleFormChange(e, 'add')}
          formSubmitted={formSubmitted}
          currentDate={currentDate}
          addForm
        />
      </Form>
    </CustomModal>

    <CustomModal
      show={showDeleteModal}
      onHide={handleCloseDeleteModal}
      variant="cancel"
      title="Confirmar Exclusão"
      centered={false}
      footer={
        <>
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
        </>
      }
    >
      {modalType === 'delete-all'
        ? 'Tem certeza que deseja excluir as inscrições selecionadas?'
        : `Tem certeza que deseja excluir a inscrição de ${name}?`}
    </CustomModal>
  </>
);

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
