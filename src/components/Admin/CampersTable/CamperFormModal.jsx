import { useCallback, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

import CustomModal from '@/components/Global/CustomModal';
import { handleCamperFormChange } from '@/Pages/Admin/Campers/utils/handleFormChange';
import { useProductCatalog } from '@/Pages/Admin/Campers/hooks/useProductCatalog';
import { openGuardianDocument } from '@/services/documents';
import Columns from './Columns';

const CamperFormModal = ({
  show,
  onHide,
  title,
  icon,
  iconFill,
  submitLabel,
  initialData,
  currentDate,
  isEdit,
  onSubmit,
}) => {
  const [formData, setFormData] = useState(initialData || {});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const catalog = useProductCatalog();

  const handleChange = useCallback((event) => handleCamperFormChange(event, setFormData, catalog), [catalog]);

  const handleSubmit = async () => {
    setFormSubmitted(true);
    await onSubmit(formData);
  };

  return (
    <CustomModal
      show={show}
      size="xl"
      dialogClassName="camper-form-modal"
      onHide={onHide}
      variant="confirm"
      icon={icon}
      iconFill={iconFill}
      title={title}
      centered={false}
      footer={
        <>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button variant="primary" className="btn-confirm" onClick={handleSubmit}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <Form>
        <Columns
          editFormData={isEdit ? formData : undefined}
          addFormData={isEdit ? undefined : formData}
          handleFormChange={handleChange}
          formSubmitted={formSubmitted}
          currentDate={currentDate}
          editForm={isEdit}
          addForm={!isEdit}
          catalog={catalog}
        />
      </Form>
      {isEdit && formData?.personalInformation?.guardianDocuments && (
        <div className="camper-form-docs mt-3">
          <h6 className="mb-2">
            <b>Documentos do Responsável (menor de idade):</b>
          </h6>
          <div className="d-flex flex-wrap gap-2">
            {formData.personalInformation.guardianDocuments
              .split(',')
              .map((id) => id.trim())
              .filter(Boolean)
              .map((id) => (
                <Button
                  key={id}
                  variant="outline-teal-blue"
                  size="sm"
                  onClick={() => openGuardianDocument(id)}
                >
                  Abrir documento #{id}
                </Button>
              ))}
          </div>
        </div>
      )}
    </CustomModal>
  );
};

CamperFormModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  title: PropTypes.string,
  icon: PropTypes.string,
  iconFill: PropTypes.string,
  submitLabel: PropTypes.string,
  initialData: PropTypes.object,
  currentDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  isEdit: PropTypes.bool,
  onSubmit: PropTypes.func,
};

export default CamperFormModal;
