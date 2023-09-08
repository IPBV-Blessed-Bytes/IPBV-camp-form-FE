import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { FormGroup, FormLabel } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import InputMask from 'react-input-mask';

import { additionalInformationSchema } from '../../form/validations/schema';

function FormContact({ nextStep, backStep, initialValues, updateForm }) {
  const { values, handleChange, errors, submitForm } = useFormik({
    initialValues,
    onSubmit: () => {
      nextStep();
      updateForm(values);
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: additionalInformationSchema,
  });

  return (
    <Card className="bbp-general-height">
      <Card.Body>
        <Container>
          <Card.Title>Informações de Contato</Card.Title>

          <Card.Text>Nos informe como poderemos te contactar</Card.Text>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Telefone:</Form.Label>

                  <Form.Control
                    type="text"
                    as={InputMask}
                    isInvalid={!!errors.cellPhone}
                    mask="(99) 99999-9999"
                    id="cellPhone"
                    value={values.cellPhone}
                    onChange={(event) => {
                      handleChange({
                        target: {
                          name: 'cellPhone',
                          value: event.target.value.replace(/\D/g, ''),
                        },
                      });
                    }}
                    placeholder="(00) 00000-0000"
                  ></Form.Control>

                  <Form.Control.Feedback type="invalid">{errors.cellPhone}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>É whatsApp?</Form.Label>

                  <Form.Select
                    name="isWhatsApp"
                    isInvalid={!!errors.isWhatsApp}
                    value={values.isWhatsApp}
                    onChange={(event) =>
                      handleChange({
                        target: {
                          name: 'isWhatsApp',
                          value: event.target.value === 'true',
                        },
                      })
                    }
                  >
                    <option value="">Selecione uma opção</option>
                    <option value={true}>Sim</option>
                    <option value={false}>Não</option>
                  </Form.Select>

                  <Form.Control.Feedback type="invalid">{errors.isWhatsApp}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email:</Form.Label>
              <Form.Control
                isInvalid={!!errors.email}
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
              />

              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={values.hasAllergy ? 4 : 6}>
                <FormGroup>
                  <FormLabel>Você possui algum tipo de alergia?</FormLabel>

                  <Form.Select
                    id="email"
                    name="hasAllergy"
                    isInvalid={!!errors.hasAllergy}
                    value={values.hasAllergy}
                    onChange={(event) =>
                      handleChange({
                        target: {
                          name: 'hasAllergy',
                          value: event.target.value === 'true',
                        },
                      })
                    }
                  >
                    <option value="">Selecione uma opção</option>
                    <option value={false}>Não</option>
                    <option value={true}>Sim</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.hasAllergy}</Form.Control.Feedback>
                </FormGroup>
              </Col>

              <Col md={values.hasAllergy ? 8 : 6}>
                {values.hasAllergy && (
                  <FormGroup>
                    <FormLabel>Descreva as suas alergias aqui:</FormLabel>

                    <Form.Control
                      isInvalid={!!errors.allergy}
                      as="textarea"
                      name="allergy"
                      placeholder="Nos fale mais sobre sua alergia"
                      value={values.allergy}
                      onChange={handleChange}
                      style={{ resize: 'none' }}
                    />

                    <Form.Control.Feedback type="invalid">{errors.allergy}</Form.Control.Feedback>
                  </FormGroup>
                )}
              </Col>
            </Row>
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

FormContact.propTypes = {
  nextStep: PropTypes.func,
  backStep: PropTypes.func,
  updateForm: PropTypes.func,
  initialValues: PropTypes.shape({
    cellPhone: PropTypes.string,
    email: PropTypes.string,
    isWhatsApp: PropTypes.bool,
    hasAllergy: PropTypes.bool,
    allergy: PropTypes.string,
  }),
};

export default FormContact;
