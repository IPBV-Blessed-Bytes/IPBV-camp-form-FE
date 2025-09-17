import { useEffect } from 'react';
import { useFormik } from 'formik';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import InputMask from 'react-input-mask';
import { additionalInformationSchema } from '@/form/validations/schema';
import './style.scss';

const Contact = ({ backStep, handlePreFill, initialValues, nextStep, updateForm }) => {
  const { values, handleChange, errors, submitForm, setValues } = useFormik({
    initialValues,
    onSubmit: () => {
      nextStep();
      updateForm(values);
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: additionalInformationSchema,
  });
  useEffect(() => {
    const storedData = sessionStorage.getItem('previousUserData');

    if (storedData) {
      const parsedPreviousUserData = JSON.parse(storedData);

      const {
        cellPhone,
        isWhatsApp,
        email,
        church,
        car,
        numberVacancies,
        needRide,
        rideObservation,
        hasAllergy,
        allergy,
        hasAggregate,
        aggregate,
      } = parsedPreviousUserData.contact;

      setValues((prevValues) => ({
        ...prevValues,
        cellPhone,
        isWhatsApp,
        email,
        church,
        car,
        numberVacancies,
        needRide,
        rideObservation,
        hasAllergy,
        allergy,
        hasAggregate,
        aggregate,
      }));
    }
  }, []);

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
                  <Form.Label>
                    <b>Telefone:</b>
                  </Form.Label>
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
                  <Form.Label>
                    <b>É WhatsApp?</b>
                  </Form.Label>
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
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>
                    <b>Email:</b>
                  </Form.Label>
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
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>
                    <b>Igreja:</b>
                  </Form.Label>
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
              <Col md={6} className="mb-3">
                <Form.Group className="info-text-wrapper">
                  <Form.Label>
                    <b>Tem vagas de carona a oferecer?</b>
                  </Form.Label>
                  <Form.Select
                    id="car"
                    name="car"
                    isInvalid={!!errors.car}
                    value={values.car}
                    onChange={(event) =>
                      handleChange({
                        target: {
                          name: 'car',
                          value: event.target.value === 'true',
                        },
                      })
                    }
                  >
                    <option value="" disabled>
                      Selecione uma opção
                    </option>
                    <option value={false}>Não</option>
                    <option value={true}>Sim</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.car}</Form.Control.Feedback>
                  <Card.Text className="mt-2 mb-0">
                    <em>Possui vagas disponíveis para ceder a outros irmãos que precisam?</em>
                  </Card.Text>
                </Form.Group>
              </Col>

              {values.car === true ? (
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      <b>Quantas vagas?</b>
                    </Form.Label>
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
              ) : values.car === false ? (
                <Col md={6} className="mb-3">
                  <Form.Group className="info-text-wrapper">
                    <Form.Label>
                      <b>Precisa de carona?</b>
                    </Form.Label>
                    <Form.Select
                      id="needRide"
                      name="needRide"
                      isInvalid={!!errors.needRide}
                      value={values.needRide}
                      onChange={(event) =>
                        handleChange({
                          target: {
                            name: 'needRide',
                            value: event.target.value === 'true',
                          },
                        })
                      }
                    >
                      <option value="" disabled>
                        Selecione uma opção
                      </option>
                      <option value={false}>Não</option>
                      <option value={true}>Sim</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.needRide}</Form.Control.Feedback>
                    <Card.Text className="mt-2 mb-0">
                      <em>Se você optou por um pacote COM ÔNIBUS, não é necessário solicitar uma carona.</em>
                    </Card.Text>
                  </Form.Group>
                </Col>
              ) : (
                ''
              )}
            </Row>

            {(values.car || values.needRide) && (
              <Row>
                <Col className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      <b>
                        Deseja fazer alguma observação sobre a carona{' '}
                        {values.car ? 'oferecida' : !values.car && values.needRide ? 'requisitada' : ''}?
                      </b>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="rideObservation"
                      placeholder="Descreva sua observação sobre a carona"
                      value={values.rideObservation}
                      onChange={handleChange}
                      style={{ resize: 'none' }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            <Row>
              <Col md={values.hasAllergy ? 6 : 6} className="mb-3">
                <Form.Group>
                  <Form.Label>
                    <b>Você possui algum tipo de alergia?</b>
                  </Form.Label>
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
                </Form.Group>
              </Col>

              {values.hasAllergy && (
                <Col md={values.hasAllergy ? 6 : 6} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      <b>Descreva as suas alergias aqui:</b>
                    </Form.Label>
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
                  </Form.Group>
                </Col>
              )}
            </Row>
            <Row>
              <Col md={values.hasAggregate ? 5 : 6} className="mb-3">
                <Form.Group className="info-text-wrapper">
                  <Form.Label>
                    <b>Você possui algum acompanhante?</b>
                  </Form.Label>
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
                    <em>
                      Nos informe se você possui algum acompanhante que irá dividir quarto com você (esposo, esposa,
                      filhos, etc).
                    </em>
                  </Card.Text>
                </Form.Group>
              </Col>

              {values.hasAggregate && (
                <Col md={values.hasAggregate ? 7 : 6} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      <b>Nos informe quem são seus acompanhantes:</b>
                    </Form.Label>
                    <Form.Control
                      isInvalid={!!errors.aggregate}
                      as="textarea"
                      name="aggregate"
                      placeholder="NOME e SOBRENOME dos acompanhantes APENAS QUE IRÃO DORMIR NO MESMO QUARTO para fins de alocação e organização"
                      value={values.aggregate}
                      onChange={handleChange}
                      style={{ resize: 'none' }}
                    />
                    <Form.Control.Feedback type="invalid">{errors.aggregate}</Form.Control.Feedback>
                  </Form.Group>
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
            handlePreFill(false);
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

Contact.propTypes = {
  backStep: PropTypes.func,
  handlePreFill: PropTypes.func,
  initialValues: PropTypes.shape({
    cellPhone: PropTypes.string,
    email: PropTypes.string,
    isWhatsApp: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    hasAllergy: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    allergy: PropTypes.string,
    hasAggregate: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    aggregate: PropTypes.string,
  }),
  nextStep: PropTypes.func,
  updateForm: PropTypes.func,
};

export default Contact;
