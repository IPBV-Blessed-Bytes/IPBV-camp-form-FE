import { Form, Col } from 'react-bootstrap';
import Icons from '../../../components/Icons';

const AdminTableField = ({
  type,
  label,
  name,
  value,
  onChange,
  placeholder,
  addForm,
  options = [],
  disabled = false,
  formSubmitted,
  oddOrEven,
  errorMessage,
  required,
}) => {
  const isFieldMissing = required && formSubmitted && !value;

  return (
    <Col md={12} lg={4} className="mb-3">
      <Form.Group>
        <b>
          <Form.Label>
            {label}: {required && <span className="text-danger">*</span>}
          </Form.Label>
        </b>
        {type === 'select' ? (
          <Form.Select
            name={name}
            size="lg"
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'} ${
              formSubmitted && isFieldMissing && 'msg-error'
            } admin-field${oddOrEven === 'odd' ? '--odd' : '--even'}`}
          >
            <option value="" disabled selected>
              {addForm ? placeholder : 'Selecione uma opção'}
            </option>
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        ) : (
          <Form.Control
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'} ${
              formSubmitted && isFieldMissing && 'msg-error'
            } admin-field${oddOrEven === 'odd' ? '--odd' : '--even'}`}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
        {formSubmitted && isFieldMissing && (
          <div className="invalid-feedback d-block">
            {errorMessage}&nbsp;
            <Icons typeIcon="error" iconSize={25} fill="#c92432" />
          </div>
        )}
      </Form.Group>
    </Col>
  );
};

export default AdminTableField;
