import ptBR from 'date-fns/locale/pt';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import DatePicker from 'react-datepicker';
import InputMask from 'react-input-mask';

import { personalInformationSchema } from '../../form/validations/schema';
import { issuingState, rgShipper } from './data';

function FormPersonalData({ nextStep, backStep, updateForm, initialValues }) {
  const { values, errors, handleChange, submitForm } = useFormik({
    initialValues,
    onSubmit: () => {
      nextStep();
      updateForm(values);
    },
    validationSchema: personalInformationSchema,
    validateOnBlur: false,
    validateOnChange: false,
  });

  return (
    <Card className="bbp-general-height">
      <Card.Body>
        <Container>
          <Card.Title>Informações Pessoais</Card.Title>

          <Card.Text>
            Favor, informe os seus dados pessoais pois serão de extrema importância para a administração de sua
            inscrição
          </Card.Text>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nome Completo:</Form.Label>
              <Form.Control
                type="text"
                id="name"
                isInvalid={!!errors.name}
                value={values.name}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Data de Nascimento:</Form.Label>
                  <Form.Control
                    isInvalid={!!errors.birthday}
                    as={DatePicker}
                    selected={values.birthday}
                    onChange={(date) =>
                      handleChange({
                        target: {
                          name: 'birthday',
                          value: date,
                        },
                      })
                    }
                    locale={ptBR}
                    autoComplete="off"
                    dateFormat="dd/MM/yyyy"
                    dropdownMode="select"
                    id="birthDay"
                    maxDate={new Date()}
                    name="birthDay"
                    placeholderText="dd/mm/aaaa"
                    showMonthDropdown={true}
                    showYearDropdown={true}
                  />
                  <Form.Control.Feedback style={{ display: 'block' }} type="invalid">
                    {errors.birthday}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>CPF:</Form.Label>
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
                          value: event.target.value.replace(/\D/g, ''),
                        },
                      })
                    }
                    placeholder="000.000000-00"
                  ></Form.Control>
                  <Form.Control.Feedback type="invalid">{errors.cpf}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>RG:</Form.Label>
                  <Form.Control
                    as={InputMask}
                    isInvalid={!!errors.rg}
                    mask="9.999-999"
                    id="rg"
                    name="rg"
                    value={values.rg}
                    onChange={(event) =>
                      handleChange({
                        target: {
                          name: 'rg',
                          value: event.target.value.replace(/\D/g, ''),
                        },
                      })
                    }
                    placeholder="0.000-000"
                  />

                  <Form.Control.Feedback type="invalid">{errors.rg}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Órgão Expedidor RG:</Form.Label>
              <Form.Select
                isInvalid={!!errors.rgShipper}
                value={values.rgShipper}
                name="rgShipper"
                id="rgShipper"
                onChange={handleChange}
              >
                <option>Selecione uma opção</option>
                {rgShipper.map((org) => (
                  <option key={org.value} value={org.value}>
                    {org.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.rgShipper}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
              <Form.Label>Estado de emissão órgão Expedidor:</Form.Label>
              <Form.Select
                value={values.rgShipperState}
                isInvalid={!!errors.rgShipperState}
                name="rgShipperState"
                id="rgShipperState"
                onChange={handleChange}
              >
                <option>Selecione uma opção</option>
                {issuingState.map((orgState) => (
                  <option key={orgState.value} value={orgState.value}>
                    {orgState.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.rgShipperState}</Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Container>
      </Card.Body>

      <div className="form-footer-container">
        <Button
          variant="light"
          onClick={() => {
            backStep();
            updateForm(values);
          }}
          size="lg"
        >
          Voltar
        </Button>

        <Button variant="warning" onClick={submitForm} size="lg">
          Avançar
        </Button>
      </div>
    </Card>
  );
}

FormPersonalData.propTypes = {
  nextStep: PropTypes.func,
  backStep: PropTypes.func,
  updateForm: PropTypes.func,
  initialValues: PropTypes.shape({
    name: PropTypes.string,
    birthday: PropTypes.instanceOf(Date),
    cpf: PropTypes.string,
    rg: PropTypes.string,
    rgShipper: PropTypes.string,
    rgShipperState: PropTypes.string,
  }),
};

export default FormPersonalData;
