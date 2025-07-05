import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { Container, Row, Col, Card, Form, Button, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Tips from '@/components/Global/Tips';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import InputMask from 'react-input-mask';
import { cpf } from 'cpf-cnpj-validator';
import { personalInformationSchema } from '../../form/validations/schema';
import { issuingState, rgShipper } from '../../utils/constants';
import calculateAge from '../Packages/utils/calculateAge';
import { BASE_URL } from '@/config';
import fetcher from '@/fetchers';
import './style.scss';
import AgeConfirmationModal from './AgeConfirmationModal';

const PersonalData = ({
  backStep,
  currentFormIndex,
  formValues,
  handleDiscountChange,
  initialValues,
  nextStep,
  preFill,
  setBackStepFlag,
  setPreFill,
  updateForm,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showPrefillModal, setShowPrefillModal] = useState(false);
  const [previousUserData, setPreviousUserData] = useState(null);
  const [currentAge, setCurrentAge] = useState(null);
  const [showLegalGuardianFields, setShowLegalGuardianFields] = useState(false);

  const { values, errors, handleChange, submitForm, setFieldValue, setValues } = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async () => {
      if (cpf.isValid(values.cpf)) {
        const cpfIsEqualToLegualGuardianCpf = values.cpf === values.legalGuardianCpf;
        const cpfAlreadyExists = formValues?.some((user, index) => {
          if (index === currentFormIndex) return false;
          return user?.personalInformation?.cpf === values.cpf;
        });

        if (cpfIsEqualToLegualGuardianCpf) {
          toast.error('CPF do acampante não pode ser igual ao CPF do responsável legal');
          return;
        }

        if (cpfAlreadyExists) {
          toast.error('Este CPF já foi adicionado ao carrinho');
          return;
        }

        try {
          const response = await fetcher.post(`${BASE_URL}/coupon/check`, {
            cpf: values.cpf,
            birthday: values.birthday,
          });

          if (handleDiscountChange) {
            handleDiscountChange(response.data.discount);
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

  const isFullyValidDate = (date) => {
    return date instanceof Date && !isNaN(date.getTime()) && date.getFullYear() > 1900;
  };

  const formatDate = (date) => {
    if (!(date instanceof Date)) date = new Date(date);
    return format(date, 'dd/MM/yyyy');
  };

  useEffect(() => {
    const fetchPreviousData = async () => {
      if (cpf.isValid(values.cpf) && preFill === true) {
        try {
          const response = await fetcher.post(`${BASE_URL}/camper/user-previous-year`, {
            cpf: values.cpf,
            birthday: formatDate(values.birthday),
          });

          const fullUserData = response.data;

          const filteredUserData = {
            personalInformation: fullUserData.personalInformation,
            contact: fullUserData.contact,
          };

          sessionStorage.setItem('previousUserData', JSON.stringify(filteredUserData));
          setPreviousUserData(filteredUserData);
          setShowPrefillModal(true);
        } catch (error) {
          console.error('Erro ao buscar dados do ano anterior:', error);
        }
      }
    };

    if (values.cpf && values.cpf.length === 11 && isFullyValidDate(values.birthday)) {
      fetchPreviousData();
      setPreFill(true);
    }
  }, [values.cpf, values.birthday]);

  useEffect(() => {
    if (values.cpf && values.cpf.length === 11 && !cpf.isValid(values.cpf)) {
      toast.error('CPF inválido. Verifique o número e tente novamente.');
    }
  }, [values.cpf]);

  useEffect(() => {
    setBackStepFlag(true);
  }, []);

  const handlePrefillConfirm = () => {
    if (previousUserData.personalInformation) {
      const { name, rg, rgShipper, rgShipperState, gender } = previousUserData.personalInformation;
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
      } = previousUserData.contact;

      setValues((prevValues) => ({
        ...prevValues,
        name,
        rg,
        rgShipper,
        rgShipperState,
        gender,
      }));

      updateForm({
        ...values,
        name,
        rg,
        rgShipper,
        rgShipperState,
        gender,
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
      });
    }
    setShowPrefillModal(false);
  };

  const handlePrefillReject = async () => {
    if (!previousUserData) {
      toast.error('Não foi possível encontrar o usuário para exclusão.');
      return;
    }

    try {
      await fetcher.delete(`${BASE_URL}/camper/user-previous-year/${previousUserData.personalInformation.cpf}`);

      toast.success('Usuário removido da base de dados com sucesso.');
      setPreviousUserData(null);
      setShowPrefillModal(false);
    } catch (error) {
      console.error('Erro ao excluir usuário anterior:', error);
      toast.error('Erro ao excluir usuário da base de dados.');
    }
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

  useEffect(() => {
    if (values.birthday) {
      const age = calculateAge(values.birthday);

      setCurrentAge(age);
      setShowLegalGuardianFields(age < 18);
    } else {
      setShowLegalGuardianFields(false);
    }
  }, [values.birthday]);

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
        `Como a idade informada na data do acampamento é de ${currentAge} anos, sendo inferior a 18 anos, é necessário informar os dados de um responsável legal que estará presente no acampamento.`,
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

  const restoreScrollWhenMobile = () => {
    setTimeout(() => {
      document.body.style.removeProperty('overflow');
    }, 1);
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
                  <Form.Group>
                    <div className="d-flex gap-2">
                      <Form.Label>
                        <b>Data de Nascimento:</b>
                      </Form.Label>
                      <Tips
                        placement="top"
                        typeIcon="info"
                        size={25}
                        colour={'#000'}
                        text="A idade considerada será a idade na data do acampamento, para fins de cálculo de pacotes"
                      />
                    </div>
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
              </Row>

              <Row>
                <Col md={6} className="mb-3">
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

              <Row>
                <Col md={6} className="mb-3">
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

                {showLegalGuardianFields && (
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <div className="d-flex gap-2">
                        <Form.Label>
                          <b>Nome do Responsável Legal:</b>
                        </Form.Label>
                        <Tips
                          placement="top"
                          typeIcon="info"
                          size={20}
                          colour={'#000'}
                          text="Como a idade informada é menor que 18 anos, é necessário informar os dados de um responsável legal QUE ESTARÁ NO ACAMPAMENTO"
                        />
                      </div>
                      <Form.Control
                        type="text"
                        id="legalGuardianName"
                        isInvalid={!!errors.legalGuardianName}
                        value={values.legalGuardianName}
                        onChange={(e) => {
                          handleChange(e);
                          updateForm({ ...values, legalGuardianName: e.target.value });
                        }}
                      />
                      <Form.Control.Feedback style={{ display: 'block' }} type="invalid">
                        {errors.legalGuardianName}
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
                        isInvalid={!!errors.legalGuardianCpf}
                        mask="999.999.999-99"
                        name="legalGuardianCpf"
                        id="legalGuardianCpf"
                        className="cpf-container"
                        value={values.legalGuardianCpf}
                        onChange={(event) =>
                          handleChange({
                            target: {
                              name: 'legalGuardianCpf',
                              value: event.target.value.replace(/\D/g, ''),
                            },
                          })
                        }
                        placeholder="000.000000-00"
                        title="Preencher CPF válido"
                      ></Form.Control>
                      <Form.Control.Feedback type="invalid">{errors.legalGuardianCpf}</Form.Control.Feedback>
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
                        isInvalid={!!errors.legalGuardianCellPhone}
                        mask="(99) 99999-9999"
                        id="legalGuardianCellPhone"
                        value={values.legalGuardianCellPhone}
                        onChange={(event) => {
                          handleChange({
                            target: {
                              name: 'legalGuardianCellPhone',
                              value: event.target.value.replace(/\D/g, ''),
                            },
                          });
                        }}
                        placeholder="(00) 00000-0000"
                      />
                      <Form.Control.Feedback type="invalid">{errors.legalGuardianCellPhone}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              )}
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
        restoreScrollWhenMobile={restoreScrollWhenMobile}
      />
      <Modal show={showPrefillModal} onHide={() => setShowPrefillModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>Pré-preenchimento dos dados:</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Identificamos que você participou do evento no ano passado. Deseja reutilizar suas informações para agilizar
          sua inscrição?{' '}
          <b>
            Seus dados só serão preenchidos após sua confirmação e não serão utilizados para nenhuma outra finalidade.
          </b>{' '}
          Caso opte por não reutilizar, eles serão excluídos da nossa base de dados, essa ação é irreversível.{' '}
          <em>Caso opte por utilizar, você ainda poderá editar os campos do formulário</em>, caso deseje fazer alguma
          alteração.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handlePrefillReject}>
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
  handleDiscountChange: PropTypes.func,
  initialValues: PropTypes.shape({
    name: PropTypes.string,
    birthday: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    cpf: PropTypes.string,
    rg: PropTypes.string,
    rgShipper: PropTypes.string,
    rgShipperState: PropTypes.string,
    gender: PropTypes.string,
    legalGuardianName: PropTypes.string,
    legalGuardianCpf: PropTypes.string,
    legalGuardianCellPhone: PropTypes.string,
  }),
  formValues: PropTypes.arrayOf(
    PropTypes.shape({
      personalInformation: PropTypes.shape({
        cpf: PropTypes.string,
      }),
    }),
  ),
  currentFormIndex: PropTypes.number,
};

export default PersonalData;
