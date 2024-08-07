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
                  />
                  <Form.Control.Feedback type="invalid">{errors.cellPhone}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>É WhatsApp?</Form.Label>
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
                    <option value="" disabled>
                      Selecione uma opção
                    </option>
                    <option value="Boa Viagem">IP. Boa Viagem</option>
                    <option value="Outra">Outra</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.church}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3 info-text-wrapper">
                  <Form.Label>Vai de carro e possui vagas de carona?</Form.Label>
                  <Form.Select id="car" name="car" isInvalid={!!errors.car} value={values.car} onChange={handleChange}>
                    <option value="" disabled>
                      Selecione uma opção
                    </option>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.car}</Form.Control.Feedback>
                  <Card.Text className="mt-2 mb-0">
                    Possui vagas disponíveis para ceder a outros irmãos que precisam?
                  </Card.Text>
                </Form.Group>
              </Col>

              {values.car === 'sim' ? (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantas vagas?</Form.Label>
                    <Form.Select
                      id="numberVacancies"
                      name="numberVacancies"
                      isInvalid={!!errors.numberVacancies}
                      value={values.numberVacancies}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Selecione uma opção
                      </option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.numberVacancies}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              ) : values.car === 'nao' ? (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Precisa de carona?</Form.Label>
                    <Form.Select
                      id="needRide"
                      name="needRide"
                      isInvalid={!!errors.needRide}
                      value={values.needRide}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Selecione uma opção
                      </option>
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.needRide}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              ) : (
                ''
              )}
            </Row>

            {(values.car === 'sim' || (values.car === 'nao' && values.needRide === 'sim')) && (
              <Row className="mb-3">
                <Col>
                  <FormGroup>
                    <FormLabel>
                      Deseja fazer alguma observação sobre a carona{' '}
                      {values.car === 'sim'
                        ? 'oferecida'
                        : values.car === 'nao' && values.needRide === 'sim'
                        ? 'requisitada'
                        : ''}
                      ?
                    </FormLabel>
                    <Form.Control
                      as="textarea"
                      name="rideObservation"
                      placeholder="Descreva sua observação sobre a carona"
                      value={values.rideObservation}
                      onChange={handleChange}
                      style={{ resize: 'none' }}
                    />
                  </FormGroup>
                </Col>
              </Row>
            )}

            <Row className="mb-3">
              <Col md={values.hasAllergy ? 6 : 6}>
                <FormGroup>
                  <FormLabel>Você possui algum tipo de alergia?</FormLabel>
                  <Form.Select
                    id="hasAllergy"
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

              {values.hasAllergy && (
                <Col md={values.hasAllergy ? 6 : 6}>
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
                </Col>
              )}
            </Row>
            <Row>
              <Col md={values.hasAggregate ? 6 : 6}>
                <FormGroup className="info-text-wrapper">
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
                  <Form.Control.Feedback type="invalid">{errors.hasAggregate}</Form.Control.Feedback>
                  <Card.Text className="mt-2 mb-0">
                    Nos informe se você possui algum agregado que irá dividir quarto com você (esposo, esposa, filhos,
                    etc).
                  </Card.Text>
                </FormGroup>
              </Col>

              {values.hasAggregate && (
                <Col md={values.hasAggregate ? 6 : 6}>
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
                </Col>
              )}
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
    hasAggregate: PropTypes.bool,
    aggregate: PropTypes.string,
  }),
};

export default FormContact;
