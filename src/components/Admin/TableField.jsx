import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Col } from 'react-bootstrap';
import Icons from '@/components/Global/Icons';
import DatePicker from 'react-datepicker';
import ptBR from 'date-fns/locale/pt';
import { format, parse } from 'date-fns';

const TableField = ({
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
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (formSubmitted && required && !value) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [formSubmitted, value, required]);

  const handleDateChange = (date) => {
    const formattedDate = format(date, 'dd/MM/yyyy');
    onChange({
      target: {
        name,
        value: formattedDate,
      },
    });
  };

  const parseDate = (value) => {
    return value ? parse(value, 'dd/MM/yyyy', new Date()) : null;
  };

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
              showError && 'msg-error'
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
        ) : type === 'date' ? (
          <DatePicker
            selected={parseDate(value)}
            onChange={handleDateChange}
            className={`form-control form-control-lg form-control-bg ${addForm && 'custom-new-registration'} ${
              showError && 'msg-error'
            } admin-field${oddOrEven === 'odd' ? '--odd' : '--even'}`}
            placeholderText={placeholder}
            disabled={disabled}
            locale={ptBR}
            autoComplete="off"
            dateFormat="dd/MM/yyyy"
            dropdownMode="select"
            maxDate={new Date()}
            showMonthDropdown
            showYearDropdown
          />
        ) : (
          <>
            <Form.Control
              type={type}
              name={name}
              value={value}
              onBlur={addForm ? onChange : undefined}
              onChange={!addForm ? onChange : undefined}
              className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'} ${
                showError && 'msg-error'
              } admin-field${oddOrEven === 'odd' ? '--odd' : '--even'}`}
              placeholder={placeholder}
              disabled={disabled}
            />
          </>
        )}
        {showError && (
          <div className="invalid-feedback d-block">
            {errorMessage}&nbsp;
            <Icons typeIcon="error" iconSize={25} fill="#c92432" />
          </div>
        )}
      </Form.Group>
    </Col>
  );
};

TableField.propTypes = {
  type: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  addForm: PropTypes.bool,
  options: PropTypes.string,
  disabled: PropTypes.bool,
  formSubmitted: PropTypes.bool,
  oddOrEven: PropTypes.string,
  errorMessage: PropTypes.string,
  required: PropTypes.bool,
};

export default TableField;
