import { useCallback, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

import CustomModal from '@/components/Global/CustomModal';
import SpinnerButton from '@/components/Global/SpinnerButton';
import CheckinQrModal from '@/components/Global/CheckinQrModal';
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
    if (!isEdit && formData.preSale) {
      const name = formData?.personalInformation?.name?.trim();
      const cpf = formData?.personalInformation?.cpf?.trim();
      const amount = String(formData?.prePaidAmount ?? '').trim();
      if (!name || !cpf || !amount) {
        return;
      }
    }
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
        {!isEdit && (
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="preSaleSwitch"
              label="Inscrição de pré-venda (lote 0) — informar apenas nome, CPF e valor pago"
              checked={!!formData.preSale}
              onChange={(e) => setFormData((prev) => ({ ...prev, preSale: e.target.checked }))}
            />
          </Form.Group>
        )}
        {!isEdit && formData.preSale ? (
          <>
            <Form.Group className="mb-3">
              <Form.Label>
                <b>Nome:</b>
              </Form.Label>
              <Form.Control
                name="personalInformation.name"
                value={formData?.personalInformation?.name || ''}
                onChange={handleChange}
                isInvalid={formSubmitted && !formData?.personalInformation?.name?.trim()}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <b>CPF:</b>
              </Form.Label>
              <Form.Control
                name="personalInformation.cpf"
                value={formData?.personalInformation?.cpf || ''}
                onChange={handleChange}
                isInvalid={formSubmitted && !formData?.personalInformation?.cpf?.trim()}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <b>Valor pago na pré-venda (R$):</b>
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={formData?.prePaidAmount || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, prePaidAmount: e.target.value, totalPrice: e.target.value }))}
                isInvalid={formSubmitted && !String(formData?.prePaidAmount ?? '').trim()}
              />
              <Form.Text className="text-secondary">
                Valor já pago na pré-venda. Será deduzido automaticamente quando a pessoa escolher
                hospedagem e transporte no formulário.
              </Form.Text>
            </Form.Group>
          </>
        ) : (
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
        )}
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
  submitting: PropTypes.bool,
};

export default CamperFormModal;
