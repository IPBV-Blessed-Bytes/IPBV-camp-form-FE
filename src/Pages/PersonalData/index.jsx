import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { Container, Row, Col, Card, Form, Button, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { parse } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';
import InputMask from 'react-input-mask';
import { cpf } from 'cpf-cnpj-validator';
import { personalInformationSchema } from '../../form/validations/schema';
import { issuingState, rgShipper } from '../Routes/constants';
import calculateAge from '../Packages/utils/calculateAge';
import { BASE_URL } from '@/config';
import axios from 'axios';
import './style.scss';
import AgeConfirmationModal from './AgeConfirmationModal';

const PersonalData = ({ nextStep, backStep, updateForm, initialValues, onDiscountChange, formUsername }) => {
  const [showModal, setShowModal] = useState(false);
  const [showPrefillModal, setShowPrefillModal] = useState(false);
  const [previousUserData, setPreviousUserData] = useState(null);
  const [currentAge, setCurrentAge] = useState(null);
  const [showLegalGuardianFields, setShowLegalGuardianFields] = useState(false);

  const { values, errors, handleChange, submitForm, setFieldValue, setValues } = useFormik({
    initialValues,
    onSubmit: async () => {
      if (cpf.isValid(values.cpf)) {
        try {
          const response = await axios.post(`${BASE_URL}/coupon/check`, { cpf: values.cpf });

          if (onDiscountChange) {
            onDiscountChange(response.data.discount);
          }

          if (response.data.discount && response.data.discount !== 0) {
            const fetchCoupons = async () => {
              try {
                const couponResponse = await axios.get(`${BASE_URL}/coupon`);
                const coupons = couponResponse.data.coupons;

                if (coupons && coupons.length > 0) {
                  const matchingCoupon = coupons.find((coupon) => coupon.cpf === values.cpf);

                  if (matchingCoupon) {
                    if (!matchingCoupon.user) {
                      await axios.put(`${BASE_URL}/coupon/${matchingCoupon.id}`, {
                        ...matchingCoupon,
                        user: formUsername,
                      });
                    }
                  }
                }
              } catch (error) {
                console.error('Erro ao verificar os descontos:', error);
              }
            };

            await fetchCoupons();
          }

          nextStep();
          updateForm(values);
        } catch (error) {
          console.error('Erro ao verificar o CPF:', error);
          toast.error('Erro ao verificar o CPF. Por favor, tente novamente.');
        }
      } else {
        toast.error('CPF inválido! Por favor, insira um CPF válido.');
      }
    },
    validationSchema: personalInformationSchema,
    validateOnBlur: false,
    validateOnChange: false,
  });

  useEffect(() => {
    const fetchPreviousData = async () => {
      if (cpf.isValid(values.cpf)) {

        try {
          const response = await axios.post(`${BASE_URL}/user-previous-year`, {
            cpf: values.cpf,
          });

          const userData = response.data;
          sessionStorage.setItem('previousUserData', JSON.stringify(userData));
          setPreviousUserData(userData);
          setShowPrefillModal(true);
        } catch (error) {
          console.error('Erro ao buscar dados do ano anterior:', error);
        }
      }
    };

    if (values.cpf && values.cpf.length === 11) {
      fetchPreviousData();
    }
  }, [values.cpf]);

  const handlePrefillConfirm = () => {
    if (previousUserData) {
      setValues((prevValues) => ({
        ...prevValues,
        ...previousUserData,
      }));
      updateForm(previousUserData);
    }
    setShowPrefillModal(false);
  };

  const handleDateChange = (date) => {
    setFieldValue('birthday', date);
  };

  const parseDate = (value) => {
    if (value instanceof Date && !isNaN(value)) {
      return value;
    }

    const parsedDate = value ? parse(value, 'dd/MM/yyyy', new Date()) : null;

    return isNaN(parsedDate) ? null : parsedDate;
  };

  const checkAge = () => {
    if (values.birthday) {
      const age = calculateAge(values.birthday);

      if (age !== null) {
        setCurrentAge(age);
        setShowModal(true);
      }
    }
  };

  const handleConfirmAge = () => {
    setShowModal(false);

    if (currentAge < 18) {
      toast.warn(
        `Como a idade informada na data do acampamento é inferior a 18 anos (${currentAge}), é necessário informar os dados de um responsável legal que estará presente no acampamento.`,
      );

      setShowLegalGuardianFields(true);
    } else {
      setShowLegalGuardianFields(false);
    }
  };

  const handleCancelAge = () => {
    setFieldValue('birthday', '');
    toast.info(
      'Como você não confirmou sua idade na data do acampamento, o campo foi resetado para que possa preenchê-lo corretamente.',
    );
    setShowModal(false);
    setShowLegalGuardianFields(false);
  };

  return (
    <>
      <Card className="form__container__general-height">
        <Card.Body>
          <Container>
            <Card.Title>Informações Pessoais</Card.Title>

            <Card.Text>
              Informe seus dados pessoais, pois eles são essenciais para a administração de sua inscrição.
            </Card.Text>
            <Form>
              <Row>
                <Col md={7} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      <b>Nome Completo:</b>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      id="name"
                      isInvalid={!!errors.name}
                      value={values.name}
                      onChange={(e) => {
                        handleChange(e);
                        updateForm({ ...values, name: e.target.value });
                      }}
                    />
                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={5} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      <b>Categoria de Acampante:</b>
                    </Form.Label>
                    <Form.Select
                      isInvalid={!!errors.gender}
                      value={values.gender}
                      name="gender"
                      id="gender"
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Selecione uma opção
                      </option>
                      <option value="Crianca">Criança (até 10 anos)</option>
                      <option value="Homem">Adulto Masculino</option>
                      <option value="Mulher">Adulto Feminimo</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      <b>Data de Nascimento:</b>
                    </Form.Label>
                    <div className="custom-datepicker-wrapper">
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                        <DatePicker
                          value={values.birthday ? parseDate(values.birthday) : null}
                          className="custom-datepicker"
                          onChange={handleDateChange}
                          onAccept={() => checkAge()}
                          format="dd/MM/yyyy"
                          id="birthday"
                          name="birthday"
                          maxDate={new Date()}
                          openTo="year"
                          views={['year', 'month', 'day']}
                        />
                      </LocalizationProvider>
                    </div>
                    <Form.Control.Feedback style={{ display: 'block' }} type="invalid">
                      {errors.birthday}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                {showLegalGuardianFields && (
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        <b>Nome do Responsável Legal:</b>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        id="legalGuardianName"
                        isInvalid={!!errors.name}
                        value={values.legalGuardianName}
                        onChange={(e) => {
                          handleChange(e);
                          updateForm({ ...values, name: e.target.value });
                        }}
                      />
                      <Form.Control.Feedback style={{ display: 'block' }} type="invalid">
                        {errors.birthday}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                )}
              </Row>

              {showLegalGuardianFields && (
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        <b>CPF do Responsável Legal:</b>
                      </Form.Label>
                      <Form.Control
                        as={InputMask}
                        isInvalid={!!errors.cpf}
                        mask="999.999.999-99"
                        name="legalGuardianCpf"
                        id="legalGuardianCpf"
                        className="cpf-container"
                        value={values.legalGuardianCpf}
                        onChange={(event) =>
                          handleChange({
                            target: {
                              name: 'cpf',
                              value: event.target.value.replace(/\D/g, ''),
                            },
                          })
                        }
                        placeholder="000.000000-00"
                        title="Preencher CPF válido"
                      ></Form.Control>
                      <Form.Control.Feedback type="invalid">{errors.cpf}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        <b>Telefone do Responsável Legal:</b>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        as={InputMask}
                        isInvalid={!!errors.cellPhone}
                        mask="(99) 99999-9999"
                        id="legalGuardianCellPhone"
                        value={values.legalGuardianCellPhone}
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
                </Row>
              )}

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
                            value: event.target.value.replace(/\D/g, ''),
                          },
                        })
                      }
                      placeholder="000.000000-00"
                      title="Preencher CPF válido"
                    ></Form.Control>
                    <Form.Control.Feedback type="invalid">{errors.cpf}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group className="info-text-wrapper">
                    <Form.Label>
                      <b>RG:</b>
                    </Form.Label>
                    <Form.Control
                      isInvalid={!!errors.rg}
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
                      title="Preencher RG válido. Caso não possua, preencher 0000000!"
                    />

                    <Form.Control.Feedback type="invalid">{errors.rg}</Form.Control.Feedback>
                    <Card.Text className="mt-2 mb-0">
                      <em>Caso não possua RG, preencher 0000000</em>
                    </Card.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      <b>Órgão Expedidor RG:</b>
                    </Form.Label>
                    <Form.Select
                      isInvalid={!!errors.rgShipper}
                      value={values.rgShipper}
                      name="rgShipper"
                      id="rgShipper"
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Selecione uma opção
                      </option>
                      {rgShipper.map((org) => (
                        <option key={org.value} value={org.value}>
                          {org.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.rgShipper}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      <b>Estado de emissão órgão Expedidor:</b>
                    </Form.Label>
                    <Form.Select
                      value={values.rgShipperState}
                      isInvalid={!!errors.rgShipperState}
                      name="rgShipperState"
                      id="rgShipperState"
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Selecione uma opção
                      </option>
                      {issuingState.map((orgState) => (
                        <option key={orgState.value} value={orgState.value}>
                          {orgState.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.rgShipperState}</Form.Control.Feedback>
                  </Form.Group>
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

      <AgeConfirmationModal
        showModal={showModal}
        currentAge={currentAge}
        handleCancelAge={handleCancelAge}
        handleConfirmAge={handleConfirmAge}
      />
      <Modal show={showPrefillModal} onHide={() => setShowPrefillModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Seus Dados do Último Acampamento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Encontramos dados do ano anterior para esse CPF. Deseja preenchê-los automaticamente? Você ainda poderá editar
          caso queira mudar algo!
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrefillModal(false)}>
            Não
          </Button>
          <Button variant="primary" onClick={handlePrefillConfirm}>
            Sim
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

PersonalData.propTypes = {
  nextStep: PropTypes.func,
  backStep: PropTypes.func,
  updateForm: PropTypes.func,
  formUsername: PropTypes.string,
  onDiscountChange: PropTypes.bool,
  initialValues: PropTypes.shape({
    name: PropTypes.string,
    birthday: PropTypes.string,
    cpf: PropTypes.string,
    rg: PropTypes.string,
    rgShipper: PropTypes.string,
    rgShipperState: PropTypes.string,
    gender: PropTypes.string,
  }),
};

export default PersonalData;
