import { useCallback, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

import CustomModal from '@/components/Global/CustomModal';
import SpinnerButton from '@/components/Global/SpinnerButton';
import CheckinQrModal from '@/components/Global/CheckinQrModal';
import { handleCamperFormChange } from '@/Pages/Admin/Campers/utils/handleFormChange';
import { useProductCatalog } from '@/Pages/Admin/Campers/hooks/useProductCatalog';
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
  submitting,
}) => {
  const [formData, setFormData] = useState(initialData || {});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const catalog = useProductCatalog();

  const cpfDigits = String(formData?.personalInformation?.cpf || '').replace(/\D/g, '');

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
          <SpinnerButton variant="primary" className="btn-confirm" onClick={handleSubmit} loading={submitting}>
            {submitLabel}
          </SpinnerButton>
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
      {isEdit && cpfDigits && (
        <div className="camper-form-qr mt-3">
          <h6 className="mb-2">
            <b>QR de Check-in:</b>
          </h6>
          <Button variant="outline-teal-blue" size="sm" onClick={() => setQrOpen(true)}>
            Ver QR de Check-in
          </Button>
          <p className="text-secondary small mt-1 mb-0">
            Contém o CPF do inscrito, usado no check-in. Também enviado por e-mail na inscrição.
          </p>
        </div>
      )}
      <CheckinQrModal
        show={qrOpen}
        onHide={() => setQrOpen(false)}
        cpf={cpfDigits}
        name={formData?.personalInformation?.name}
      />
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
  submitting: PropTypes.bool,
};

export default CamperFormModal;
