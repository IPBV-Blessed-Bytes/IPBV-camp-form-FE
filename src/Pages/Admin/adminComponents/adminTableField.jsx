import React from 'react';
import { Form, Col } from 'react-bootstrap';

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
}) => {
  return (
    <Col md={12} lg={4} className="mb-3">
      <Form.Group>
        <b>
          <Form.Label>{label}:</Form.Label>
        </b>
        {type === 'select' ? (
          <Form.Control
            as="select"
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Control>
        ) : (
          <Form.Control
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      </Form.Group>
    </Col>
  );
};

export default AdminTableField;
