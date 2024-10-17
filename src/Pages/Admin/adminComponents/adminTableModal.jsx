import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import AdminTableColumns from './adminTableColumns';

const AdminTableModal = ({
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
      <Modal show={showEditModal} size="xl" onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>Editar Inscrição</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <AdminTableColumns
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
          <Button variant="primary" onClick={handleSaveEdit}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddModal} size="xl" onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>Nova Inscrição</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <AdminTableColumns
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
          <Button variant="primary" onClick={handleAddSubmit}>
            Adicionar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>
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
            onClick={modalType === 'delete-all' ? handleConfirmDeleteAll : handleConfirmDeleteSpecific}
          >
            Deletar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminTableModal;
