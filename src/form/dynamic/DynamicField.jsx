import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import ptBR from 'date-fns/locale/pt';
import { parse, format, isValid } from 'date-fns';
import PropTypes from 'prop-types';

import MaskedDateInput from '@/components/Global/MaskedDateInput';

const SCALAR_INPUT_TYPES = {
  text: 'text',
  number: 'number',
  email: 'email',
  phone: 'tel',
};

const DynamicField = ({ field, value, onChange, error }) => {
  const { key, label, type, required, placeholder, helpText, options = [], config } = field;
  const controlId = `field-${key}`;

  const renderControl = () => {
    if (type === 'textarea') {
      return (
        <Form.Control
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
        <Form.Select value={value || ''} isInvalid={Boolean(error)} onChange={(e) => onChange(e.target.value)}>
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
              {config?.link && (
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
        type={SCALAR_INPUT_TYPES[type] || 'text'}
        value={value || ''}
        placeholder={placeholder || ''}
        isInvalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };

  return (
    <Form.Group className="mb-3" controlId={controlId}>
      {type !== 'consent' && (
        <Form.Label>
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
