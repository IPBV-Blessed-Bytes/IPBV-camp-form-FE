import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import CustomModal from '@/components/Global/CustomModal';
import SpinnerButton from '@/components/Global/SpinnerButton';
import ParticipantFormModal from './ParticipantFormModal';

const EditAndAddParticipantModal = ({
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
  savingEdit,
  savingAdd,
  deleting,
  handleCloseDeleteModal,
  handleConfirmDeleteAll,
  handleConfirmDeleteSpecific,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <ParticipantFormModal
        key={`edit-${editRowIndex}-${showEditModal}`}
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        title={t('admin.participantsTable.editTitle')}
        icon="edit"
        iconFill=""
        submitLabel={t('admin.participantsTable.save')}
        initialData={editInitialData}
        currentDate={currentDate}
        isEdit
        onSubmit={onSaveEdit}
        submitting={savingEdit}
      />

      <ParticipantFormModal
        key={`add-${showAddModal}`}
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        title={t('admin.participantsTable.addTitle')}
        icon="plus"
        submitLabel={t('admin.participantsTable.add')}
        initialData={{}}
        currentDate={currentDate}
        onSubmit={onAddSubmit}
        submitting={savingAdd}
      />

      <CustomModal
        show={showDeleteModal}
        onHide={handleCloseDeleteModal}
        variant="cancel"
        title={t('admin.participantsTable.deleteTitle')}
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseDeleteModal}>
              {t('admin.participantsTable.cancel')}
            </Button>
            <SpinnerButton
              variant="danger"
              className="btn-cancel"
              onClick={modalType === 'delete-all' ? handleConfirmDeleteAll : handleConfirmDeleteSpecific}
              loading={deleting}
            >
              {t('admin.participantsTable.delete')}
            </SpinnerButton>
          </>
        }
      >
        {modalType === 'delete-all'
          ? t('admin.participantsTable.deleteAllConfirm')
          : t('admin.participantsTable.deleteOneConfirm', { name })}
      </CustomModal>
    </>
  );
};

EditAndAddParticipantModal.propTypes = {
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
  savingEdit: PropTypes.bool,
  savingAdd: PropTypes.bool,
  deleting: PropTypes.bool,
  handleCloseDeleteModal: PropTypes.func,
  handleConfirmDeleteAll: PropTypes.func,
  handleConfirmDeleteSpecific: PropTypes.func,
};

export default EditAndAddParticipantModal;
