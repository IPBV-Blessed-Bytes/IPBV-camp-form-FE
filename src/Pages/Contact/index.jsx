import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { FormGroup, FormLabel, Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import InputMask from 'react-input-mask';

import { additionalInformationSchema } from '../../form/validations/schema';

const FormContact = ({ nextStep, backStep, initialValues, updateForm }) => {
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
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <Card.Title>Informações de Contato</Card.Title>

          <Card.Text>Nos informe como poderemos te contactar caso necessário.</Card.Text>
          <Form>
            <Row>
              <Col md={6} className="mb-3">
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
              <Col md={6} className="mb-3">
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
                    <option value="" disabled>
                      Selecione uma opção
                    </option>
                    <option value={true}>Sim</option>
                    <option value={false}>Não</option>
                  </Form.Select>

                  <Form.Control.Feedback type="invalid">{errors.isWhatsApp}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={8} className="mb-3">
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
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group className="mb-3">
                  <Form.Label>Igreja:</Form.Label>
                  <Form.Select
                    id="church"
                    name="church"
                    isInvalid={!!errors.church}
                    value={values.church}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Selecione uma opção</option>
                    <option value="Boa Viagem">IP. Boa Viagem</option>
                    <option value="Casa Caiada">IP. Casa Caiada</option>
                    <option value="Madalena">IP. Madalena</option>
                    <option value="Batista Reformada">IB. Reformada do Recife</option>
                    <option value="Outra">Outra</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.church}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={values.hasAllergy ? 6 : 6}>
                <FormGroup>
                  <FormLabel>Você possui algum tipo de alergia?</FormLabel>

                  <Form.Select
                    id="allergy"
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

              <Col md={values.hasAllergy ? 6 : 6}>
                {values.hasAllergy && (
                  <FormGroup>
                    <FormLabel>Descreva as suas alergias aqui:</FormLabel>

                    <Form.Control
                      isInvalid={!!errors.allergy}
                      as="textarea"
                      name="allergy"
                      placeholder="Descreva sua alergia"
                      value={values.allergy}
                      onChange={handleChange}
                      style={{ resize: 'none' }}
                    />

                    <Form.Control.Feedback type="invalid">{errors.allergy}</Form.Control.Feedback>
                  </FormGroup>
                )}
              </Col>
            </Row>
            <Row>
              <Col md={values.hasAggregate ? 6 : 6}>
                <FormGroup>
                  <FormLabel>Você possui algum agregado?</FormLabel>
                  <Form.Select
                    id="hasAggregate"
                    name="hasAggregate"
                    isInvalid={!!errors.hasAggregate}
                    value={values.hasAggregate}
                    onChange={(event) =>
                      handleChange({
                        target: {
                          name: 'hasAggregate',
                          value: event.target.value === 'true',
                        },
                      })
                    }
                  >
                    <option value="">Selecione uma opção</option>
                    <option value={false}>Não</option>
                    <option value={true}>Sim</option>
                  </Form.Select>
                  <Card.Text className="mt-2 mb-0">
                    Nos informe se você possui algum agregado que irá dividir quarto com você (esposo, esposa, filhos,
                    etc).
                  </Card.Text>
                  <Form.Control.Feedback type="invalid">{errors.hasAggregate}</Form.Control.Feedback>
                </FormGroup>
              </Col>

              <Col md={values.hasAggregate ? 6 : 6}>
                {values.hasAggregate && (
                  <FormGroup>
                    <FormLabel>Nos informe quem são seus agregados:</FormLabel>
                    <Form.Control
                      isInvalid={!!errors.aggregate}
                      as="textarea"
                      name="aggregate"
                      placeholder="Agregados APENAS QUE IRÃO DORMIR NO MESMO QUARTO, assim atrelaremos as suas inscrições para que fiquem juntos."
                      value={values.aggregate}
                      onChange={handleChange}
                      style={{ resize: 'none' }}
                    />

                    <Form.Control.Feedback type="invalid">{errors.aggregate}</Form.Control.Feedback>
                  </FormGroup>
                )}
              </Col>
            </Row>
          </Form>
        </Container>
      </Card.Body>

      <div className="form__container__buttons">
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
};

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
