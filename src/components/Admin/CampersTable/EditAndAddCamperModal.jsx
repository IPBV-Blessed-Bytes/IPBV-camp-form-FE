import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

import CustomModal from '@/components/Global/CustomModal';
import CamperFormModal from './CamperFormModal';

const EditAndAddCamperModal = ({
  name,
  showEditModal,
  setShowEditModal,
  showAddModal,
  setShowAddModal,
  showDeleteModal,
  modalType,
  editInitialData,
  editRowIndex,
  currentDate,
  onSaveEdit,
  onAddSubmit,
  handleCloseDeleteModal,
  handleConfirmDeleteAll,
  handleConfirmDeleteSpecific,
}) => (
  <>
    <CamperFormModal
      key={`edit-${editRowIndex}-${showEditModal}`}
      show={showEditModal}
      onHide={() => setShowEditModal(false)}
      title="Editar Inscrição"
      icon="edit"
      iconFill=""
      submitLabel="Salvar"
      initialData={editInitialData}
      currentDate={currentDate}
      isEdit
      onSubmit={onSaveEdit}
    />

    <CamperFormModal
      key={`add-${showAddModal}`}
      show={showAddModal}
      onHide={() => setShowAddModal(false)}
      title="Nova Inscrição"
      icon="plus"
      submitLabel="Adicionar"
      initialData={{}}
      currentDate={currentDate}
      onSubmit={onAddSubmit}
    />

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
  editInitialData: PropTypes.object,
  editRowIndex: PropTypes.number,
  currentDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  onSaveEdit: PropTypes.func,
  onAddSubmit: PropTypes.func,
  handleCloseDeleteModal: PropTypes.func,
  handleConfirmDeleteAll: PropTypes.func,
  handleConfirmDeleteSpecific: PropTypes.func,
};

export default EditAndAddCamperModal;
