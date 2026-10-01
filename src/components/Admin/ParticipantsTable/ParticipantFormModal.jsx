import { useCallback, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import CustomModal from '@/components/Global/CustomModal';
import SpinnerButton from '@/components/Global/SpinnerButton';
import CheckinQrModal from '@/components/Global/CheckinQrModal';
import { handleCamperFormChange } from '@/Pages/Admin/Participants/utils/handleFormChange';
import { useProductCatalog } from '@/Pages/Admin/Participants/hooks/useProductCatalog';
import Columns from './Columns';

const ParticipantFormModal = ({
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
  const { t } = useTranslation();
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
            {t('admin.participantsTable.cancel')}
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
            <b>{t('admin.participantsTable.qrTitle')}</b>
          </h6>
          <Button variant="outline-teal-blue" size="sm" onClick={() => setQrOpen(true)}>
            {t('admin.participantsTable.qrButton')}
          </Button>
          <p className="text-secondary small mt-1 mb-0">{t('admin.participantsTable.qrHint')}</p>
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

ParticipantFormModal.propTypes = {
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

export default ParticipantFormModal;
