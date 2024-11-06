import { useEffect } from 'react';
import { parse } from 'date-fns';
import ptBR from 'date-fns/locale/pt';
import { useFormik } from 'formik';
import { cpf } from 'cpf-cnpj-validator';
import PropTypes from 'prop-types';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import InputMask from 'react-input-mask';
import { toast } from 'react-toastify';
import axios from 'axios';
import { personalInformationSchema } from '../../form/validations/schema';
import { issuingState, rgShipper } from '../Routes/constants';
import { BASE_URL } from '@/config';
import calculateAge from '../Packages/utils/calculateAge';

const FormPersonalData = ({ nextStep, backStep, updateForm, initialValues, onDiscountChange, formUsername }) => {
  const { values, errors, handleChange, submitForm, setFieldValue } = useFormik({
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
                    await axios.put(`${BASE_URL}/coupon/${matchingCoupon.id}`, {
                      ...matchingCoupon,
                      user: formUsername,
                    });
                  }
                }
              } catch (error) {
                console.error('Erro ao verificar os cupons:', error);
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
      if (age !== null) {
        toast.info(
          `A idade informada é ${
            age > 0 ? `de ${age} anos` : 'menor que 1 ano'
          }. Verifique se a data e a idade informadas estão corretas. Caso não estejam, ajuste-as.`,
        );
      }
    }
  }, [values.birthday]);

  return (
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
                    <option value="Criança">Criança (até 10 anos)</option>
                    <option value="Homem">Adulto Masculino</option>
                    <option value="Mulher">Adulto Feminimo</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>
                    <b>Data de Nascimento:</b>
                  </Form.Label>
                  <Form.Control
                    isInvalid={!!errors.birthday}
                    as={DatePicker}
                    selected={parseDate(values.birthday)}
                    onChange={handleDateChange}
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
                    title="Preencher Data de nascimento corretamente pois é ela quem calcula o valor a ser pago!"
                  />
                  <Form.Control.Feedback style={{ display: 'block' }} type="invalid">
                    {errors.birthday}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
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

              <Col md={4} className="mb-3">
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

            <Col md={12} className="mb-3">
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

            <Col md={12} className="mb-3">
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

FormPersonalData.propTypes = {
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

export default FormPersonalData;
