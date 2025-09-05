import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { Container, Row, Col, Card, Form, Button, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import InputMask from 'react-input-mask';
import Tips from '@/components/Global/Tips';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cpf } from 'cpf-cnpj-validator';
import { personalInformationSchema } from '../../form/validations/schema';
import { issuingState, rgShipper } from '../../utils/constants';
import calculateAge from '../Packages/utils/calculateAge';
import { BASE_URL } from '@/config';
import fetcher from '@/fetchers';
import './style.scss';
import AgeConfirmationModal from './AgeConfirmationModal';
import Icons from '@/components/Global/Icons';

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
  const [hasValidatedAge, setHasValidatedAge] = useState(false);

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
            handleDiscountChange(response.data.discount, currentFormIndex);
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
    sessionStorage.removeItem('previousUserData');
    const tempData = JSON.parse(sessionStorage.getItem('formTempData') || '{}');

    if (Object.keys(tempData).length > 0) {
      const mergedValues = {
        ...values,
        ...tempData.personalInformation,
      };

      setValues(mergedValues);
      updateForm(mergedValues);
    }
  }, []);

  const extractNumbers = (value) => value.replace(/\D/g, '');
  const isUnderage = (age) => age < 18;

  const formatDate = (date) => {
    const parsed = parseDate(date);
    return parsed ? format(parsed, 'dd/MM/yyyy') : '';
  };

  useEffect(() => {
    if (values.cpf && values.cpf.length === 11 && !cpf.isValid(values.cpf)) {
      toast.error('CPF inválido. Verifique o número e tente novamente.');
    }
  }, [values.cpf]);

  useEffect(() => {
    setBackStepFlag(true);
  }, []);

  const handlePrefillConfirm = () => {
    if (previousUserData) {
      const { name, rg, rgShipper, rgShipperState, gender } = previousUserData.personalInformation;
      const contactData = previousUserData.contact;

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
        ...contactData,
      });

      sessionStorage.setItem('previousUserData', JSON.stringify(previousUserData));
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
      sessionStorage.removeItem('previousUserData');
      setShowPrefillModal(false);
    } catch (error) {
      console.error('Erro ao excluir usuário anterior:', error);
      toast.error('Erro ao excluir usuário da base de dados.');
    }
  };

  const handleDateChange = (date) => {
    setFieldValue('birthday', date);
    setHasValidatedAge(false);
    handleAgeValidation(date);
  };

  const handleDateBlur = () => {
    const parsed = parseDate(values.birthday);
    handleAgeValidation(parsed);
  };

  const handleAgeValidation = (birthday) => {
    if (hasValidatedAge || !birthday) return;

    const age = calculateAge(birthday);

    if (age !== null) {
      setCurrentAge(age);
      setShowModal(true);
      setHasValidatedAge(true);
    }
  };

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

        setPreviousUserData(filteredUserData);

        return filteredUserData;
      } catch (error) {
        console.error('Erro ao buscar dados do ano anterior:', error);
        return null;
      }
    }
  };

  const handleConfirmAge = async () => {
    setShowModal(false);

    if (isUnderage(currentAge)) {
      toast.warn(
        `Como a idade informada na data do acampamento é de ${currentAge} anos, sendo inferior a 18 anos, é necessário informar os dados de um responsável legal que estará presente no acampamento.`,
      );
      setShowLegalGuardianFields(true);
    } else {
      setShowLegalGuardianFields(false);
    }

    if (cpf.isValid(values.cpf)) {
      try {
        const fetchedData = await fetchPreviousData();

        if (fetchedData) {
          setShowPrefillModal(true);
          setPreFill(true);
        }
      } catch (error) {
        console.error('Erro ao buscar dados anteriores após confirmação de idade', error);
      }
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

  const parseDate = (value) => {
    if (value instanceof Date && !isNaN(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const isoParsed = new Date(value);
      if (!isNaN(isoParsed)) {
        return isoParsed;
      }

      const parsed = parse(value, 'dd/MM/yyyy', new Date());
      return isNaN(parsed) ? null : parsed;
    }

    return null;
  };

  useEffect(() => {
    if (values.birthday) {
      const age = calculateAge(values.birthday);

      setCurrentAge(age);
      setShowLegalGuardianFields(isUnderage(age));
    } else {
      setShowLegalGuardianFields(false);
    }
  }, [values.birthday]);

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
                            value: extractNumbers(event.target.value),
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
                      <Form.Control
                        isInvalid={!!errors.birthday}
                        as={DatePicker}
                        selected={parseDate(values.birthday)}
                        onChange={handleDateChange}
                        onBlur={handleDateBlur}
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
                            value: extractNumbers(event.target.value),
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
                              value: extractNumbers(event.target.value),
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
                              value: extractNumbers(event.target.value),
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
      <Modal className="custom-modal" show={showPrefillModal} onHide={() => setShowPrefillModal(false)} centered>
        <Modal.Header closeButton className="custom-modal__header--confirm">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="form" iconSize={25} fill={'#057c05'} />
            <b>Preencher dados:</b>
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
          <Button variant="outline-secondary" onClick={handlePrefillReject}>
            Não
          </Button>
          <Button variant="primary" className='btn-confirm' onClick={handlePrefillConfirm}>
            Sim
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

PersonalData.propTypes = {
  backStep: PropTypes.func,
  currentFormIndex: PropTypes.number,
  formValues: PropTypes.arrayOf(
    PropTypes.shape({
      personalInformation: PropTypes.shape({
        cpf: PropTypes.string,
      }),
    }),
  ),
  handleDiscountChange: PropTypes.func,
  initialValues: PropTypes.shape({
    birthday: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    cpf: PropTypes.string,
    gender: PropTypes.string,
    legalGuardianCellPhone: PropTypes.string,
    legalGuardianCpf: PropTypes.string,
    legalGuardianName: PropTypes.string,
    name: PropTypes.string,
    rg: PropTypes.string,
    rgShipper: PropTypes.string,
    rgShipperState: PropTypes.string,
  }),
  nextStep: PropTypes.func,
  preFill: PropTypes.bool,
  setBackStepFlag: PropTypes.func,
  setPreFill: PropTypes.func,
  updateForm: PropTypes.func,
};

export default PersonalData;
