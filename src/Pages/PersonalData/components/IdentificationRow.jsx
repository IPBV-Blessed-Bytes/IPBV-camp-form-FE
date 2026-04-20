import { Row, Col, Form } from 'react-bootstrap';
import { useFormikContext } from 'formik';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import InputMask from 'react-input-mask';
import { ptBR } from 'date-fns/locale';

import Tips from '@/components/Global/Tips';
import { extractNumbers, parseDate } from '../utils/fieldHelpers';

const IdentificationRow = ({ onDateChange, onDateBlur }) => {
  const { values, errors, handleChange } = useFormikContext();

  return (
    <Row>
      <Col md={6} className="mb-3">
        <Form.Group>
          <Form.Label>
            <b>CPF:</b>
          </Form.Label>
          <Form.Control
            as={InputMask}
            isInvalid={!!errors.cpf}
            mask="999.999.999-99"
            name="cpf"
            id="cpf"
            className="cpf-container"
            value={values.cpf}
            onChange={(event) =>
              handleChange({
                target: {
                  name: 'cpf',
                  value: extractNumbers(event.target.value),
                },
              })
            }
            placeholder="000.000000-00"
            title="Preencher CPF válido"
          />
          <Form.Control.Feedback type="invalid">{errors.cpf}</Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6} className="mb-3">
        <Form.Group>
          <div className="d-flex gap-2">
            <Form.Label>
              <b>Data de Nascimento:</b>
            </Form.Label>
            <Tips
              placement="top"
              typeIcon="info"
              size={18}
              color={'#7f7878'}
              text="A idade considerada será a idade na data do acampamento, para fins de cálculo de pacotes"
            />
          </div>
          <div className="custom-datepicker-wrapper">
            <Form.Control
              isInvalid={!!errors.birthday}
              as={DatePicker}
              selected={parseDate(values.birthday)}
              onChange={onDateChange}
              onBlur={onDateBlur}
              locale={ptBR}
              autoComplete="off"
              dateFormat="dd/MM/yyyy"
              dropdownMode="select"
              id="birthday"
              name="birthday"
              maxDate={new Date()}
              placeholderText="dd/mm/aaaa"
              showMonthDropdown
              showYearDropdown
              customInput={
                <InputMask mask="99/99/9999">{(inputProps) => <Form.Control {...inputProps} />}</InputMask>
              }
            />
          </div>
          <Form.Control.Feedback className="d-block" type="invalid">
            {errors.birthday}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
    </Row>
  );
};

IdentificationRow.propTypes = {
  onDateChange: PropTypes.func.isRequired,
  onDateBlur: PropTypes.func.isRequired,
};

export default IdentificationRow;
