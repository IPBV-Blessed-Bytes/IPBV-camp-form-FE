import { useEffect, useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import ptBR from 'date-fns/locale/pt';
import { parse, format, isValid } from 'date-fns';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import MaskedDateInput from '@/components/Global/MaskedDateInput';
import { uploadRegistrationFile, registrationFileUrl } from '@/services/uploads';
import { getMinorTemplateExists, minorTemplateDownloadUrl } from '@/services/minorTemplate';
import { getApiErrorMessage } from '@/fetchers/helpers';

const SCALAR_INPUT_TYPES = {
  text: 'text',
  number: 'number',
  email: 'email',
  phone: 'tel',
};

const MAX_FILE_MB = 5;
const isImageFile = (file) => Boolean(file.type) && file.type.startsWith('image/');
const isAllowedFile = (file) =>
  isImageFile(file) || file.type === 'application/pdf' || /\.(pdf|docx?|png|jpe?g|webp|gif)$/i.test(file.name);

const DynamicField = ({ field, value, onChange, error }) => {
  const { key, label, type, required, placeholder, helpText, options = [], config } = field;
  const controlId = `field-${key}`;
  const [uploading, setUploading] = useState(false);
  const [templateExists, setTemplateExists] = useState(false);

  useEffect(() => {
    if (type !== 'file') return;
    getMinorTemplateExists()
      .then(setTemplateExists)
      .catch(() => setTemplateExists(false));
  }, [type]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!isAllowedFile(file)) {
      toast.error(`"${file.name}" não é um formato aceito. Envie uma foto (JPG, PNG), PDF ou DOC.`);
      return;
    }
    if (!isImageFile(file) && file.size > MAX_FILE_MB * 1024 * 1024) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      toast.error(`"${file.name}" tem ${mb} MB e passa do limite de ${MAX_FILE_MB} MB. Envie um arquivo menor.`);
      return;
    }
    setUploading(true);
    try {
      const data = await uploadRegistrationFile(file);
      onChange({ id: data.id, name: data.name });
    } catch (err) {
      const apiMessage = getApiErrorMessage(err);
      if (err?.response?.status === 413) {
        toast.error(`O arquivo é maior que o limite de ${MAX_FILE_MB} MB. Tente um arquivo menor.`);
      } else if (apiMessage) {
        toast.error(apiMessage);
      } else if (err?.code === 'ECONNABORTED') {
        toast.error('O envio demorou demais e foi cancelado. Tente novamente com um arquivo menor.');
      } else if (!err?.response) {
        toast.error(
          'O servidor recusou o envio (arquivo pode estar grande demais) ou a conexão caiu. Tente um arquivo menor e verifique sua internet.',
        );
      } else {
        toast.error('Não foi possível enviar o arquivo. Tente novamente.');
      }
    } finally {
      setUploading(false);
    }
  };

  const renderControl = () => {
    if (type === 'textarea') {
      return (
        <Form.Control
          id={controlId}
          as="textarea"
          rows={3}
          value={value || ''}
          placeholder={placeholder || ''}
          isInvalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }

    if (type === 'select') {
      return (
        <Form.Select id={controlId} value={value || ''} isInvalid={Boolean(error)} onChange={(e) => onChange(e.target.value)}>
          <option value="">Selecione...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Form.Select>
      );
    }

    if (type === 'radio') {
      return (
        <div>
          {options.map((opt) => (
            <Form.Check
              key={opt.value}
              type="radio"
              id={`${controlId}-${opt.value}`}
              name={controlId}
              label={opt.label}
              checked={value === opt.value}
              isInvalid={Boolean(error)}
              onChange={() => onChange(opt.value)}
            />
          ))}
        </div>
      );
    }

    if (type === 'checkbox') {
      const selected = Array.isArray(value) ? value : [];
      const toggle = (optValue) =>
        onChange(selected.includes(optValue) ? selected.filter((v) => v !== optValue) : [...selected, optValue]);

      return (
        <div>
          {options.map((opt) => (
            <Form.Check
              key={opt.value}
              type="checkbox"
              id={`${controlId}-${opt.value}`}
              label={opt.label}
              checked={selected.includes(opt.value)}
              isInvalid={Boolean(error)}
              onChange={() => toggle(opt.value)}
            />
          ))}
        </div>
      );
    }

    if (type === 'date') {
      const parsed = value ? parse(value, 'dd/MM/yyyy', new Date()) : null;
      const selected = parsed && isValid(parsed) ? parsed : null;
      return (
        <Form.Control
          as={DatePicker}
          selected={selected}
          onChange={(date) => onChange(date ? format(date, 'dd/MM/yyyy') : '')}
          locale={ptBR}
          dateFormat="dd/MM/yyyy"
          dropdownMode="select"
          maxDate={new Date()}
          showMonthDropdown
          showYearDropdown
          autoComplete="off"
          placeholderText="dd/mm/aaaa"
          isInvalid={Boolean(error)}
          customInput={<MaskedDateInput />}
        />
      );
    }

    if (type === 'file') {
      return (
        <div className="dynamic-file">
          {templateExists && (
            <a
              className="dynamic-file__template"
              href={minorTemplateDownloadUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Baixar modelo
            </a>
          )}
          <Form.Control
            id={controlId}
            type="file"
            accept=".pdf,.doc,.docx,image/*"
            isInvalid={Boolean(error)}
            disabled={uploading}
            onChange={handleFileChange}
          />
          <Form.Text className="text-muted d-block">
            Formatos: foto (JPG, PNG), PDF ou DOC • Tamanho máximo: {MAX_FILE_MB} MB. As fotos são otimizadas
            automaticamente.
          </Form.Text>
          {uploading && (
            <span className="dynamic-file__status">
              <Spinner animation="border" size="sm" /> Enviando...
            </span>
          )}
          {!uploading && value?.name && (
            <span className="dynamic-file__status">
              Enviado:{' '}
              {value.id ? (
                <a href={registrationFileUrl(value.id)} target="_blank" rel="noopener noreferrer">
                  {value.name}
                </a>
              ) : (
                value.name
              )}
            </span>
          )}
        </div>
      );
    }

    if (type === 'consent') {
      return (
        <Form.Check
          type="checkbox"
          id={controlId}
          checked={value === true}
          isInvalid={Boolean(error)}
          onChange={(e) => onChange(e.target.checked)}
          label={
            <span>
              {config?.text}{' '}
              {config?.link && /^https?:\/\//i.test(config.link) && (
                <a href={config.link} target="_blank" rel="noreferrer">
                  (saiba mais)
                </a>
              )}
            </span>
          }
        />
      );
    }

    return (
      <Form.Control
        id={controlId}
        type={SCALAR_INPUT_TYPES[type] || 'text'}
        value={value || ''}
        placeholder={placeholder || ''}
        isInvalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };

  return (
    <Form.Group className="mb-3">
      {type !== 'consent' && (
        <Form.Label htmlFor={controlId}>
          {label}
          {required && <span className="text-danger"> *</span>}
        </Form.Label>
      )}
      {renderControl()}
      {helpText && <Form.Text className="text-muted d-block">{helpText}</Form.Text>}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </Form.Group>
  );
};

DynamicField.propTypes = {
  field: PropTypes.object.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default DynamicField;
