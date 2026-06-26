import { useCallback, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

import CustomModal from '@/components/Global/CustomModal';
import { handleCamperFormChange } from '@/Pages/Admin/Campers/utils/handleFormChange';
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

  const handleChange = useCallback((event) => handleCamperFormChange(event, setFormData), []);

  const handleSubmit = async () => {
    setFormSubmitted(true);
    await onSubmit(formData);
  };

  return (
    <CustomModal
      show={show}
      size="xl"
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
        />
      </Form>
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
