import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, Container, Button, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import InputMask from 'react-input-mask';
import { useFormik } from 'formik';
import Footer from '../../components/Footer';
import FormRoutes from '../Routes';
import { chooseWaySchema } from '../../form/validations/schema';
import CpfReview from '../CpfReview';
import Loading from '../../components/Loading';

const initialValues = {
  personalInformation: {
    cpf: '',
  },
  formPayment: '',
};

const ChooseWay = () => {
  const [showFormRoutes, setShowFormRoutes] = useState(false);
  const [showCpfField, setShowCpfField] = useState(false);
  const [showRegistrationFields, setShowRegistrationFields] = useState(false);
  const [showAnotherScreen, setShowAnotherScreen] = useState(false);
  const [formValues, setFormValues] = useState(initialValues);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [personData, setPersonData] = useState('');
  const [displayedCpf, setDisplayedCpf] = useState('');
  const navigate = useNavigate();

  const { values, errors, handleChange, submitForm } = useFormik({
    initialValues: formValues,
    onSubmit: () => {},
    validationSchema: chooseWaySchema,
    validateOnBlur: false,
    validateOnChange: false,
  });

  const sendCpfValue = async () => {
    setIsButtonDisabled(true);
    setLoading(true);
    submitForm();

    try {
      const payload = {
        personalInformation: {
          cpf: displayedCpf,
        },
        formPayment: values.formPayment,
      };

      const response = await axios.put(
        'https://ipbv-camp-form-be-production-2b7d.up.railway.app/payment-from-person-to-link',
        payload,
      );

      setFormValues(payload);
      if (response.data.data.payment_url) {
        window.open(response.data.data.payment_url, '_self');
      }
    } catch (error) {
      setIsButtonDisabled(false);

      if (error.response.data.registration === 'Payment Type exchange temporaly unavailable.') {
        toast.error('CPF já cadastrado e pagamento já validado.');
      } else if (error.response.data.registration === 'Invalid CPF.') {
        if (displayedCpf !== '' && values.formPayment !== '') {
          toast.error(
            'CPF não cadastrado. Realizar cadastro pelo formulário de inscrição ou contactar a secretaria para maiores duvidas',
          );
        }
      } else {
        toast.error('Erro! Tente novamente em instantes ou entre em contato com a secretaria.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonData = async () => {
    setLoading(true);
    submitForm();
    consultCpf();

    try {
      const payload = {
        personalInformation: {
          cpf: displayedCpf,
        },
      };

      const response = await axios.post(
        'https://ipbv-camp-form-be-production-2b7d.up.railway.app/get-person-data',
        payload,
      );

      setPersonData(response);
    } catch (error) {
      if (error.response.data.registration === 'Invalid CPF.') {
        toast.error('CPF não cadastrado em nossa base de dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminClick = () => {
    navigate('/');
  };

  const onlinePayment = () => {
    setShowAnotherScreen(true);
    setShowCpfField(true);
  };

  const consultCpf = () => {
    setShowAnotherScreen(true);
    setShowRegistrationFields(true);
  };

  const handleCpfChange = (event) => {
    const rawCpf = event.target.value.replace(/\D/g, '');
    setDisplayedCpf(rawCpf);
    handleChange({
      target: {
        name: 'cpf',
        value: rawCpf,
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (showCpfField) {
        sendCpfValue();
      } else if (!showAnotherScreen) {
        fetchPersonData();
      }
    }
  };

  return (
    <>
      {!showFormRoutes && (
        <div className="form">
          <div className="form__container mt-5">
            <Card className="form__container__general-height">
              <Card.Body className="align-items-center d-flex">
                <Container>
                  <h2 className="text-center fw-bold">ACAMPAMENTO IPBV 2025</h2>
                  {!showAnotherScreen && (
                    <>
                      <Row className="text-center my-4">
                        <h4>Faça seu pagamento em aberto ou sua nova inscrição abaixo:</h4>
                      </Row>
                      <Row className="justify-content-center align-items-center">
                        <Col xs={12} md={6} className="text-center initial-wrapper">
                          <Button className="initial-wrapper__btn" variant="success" onClick={onlinePayment} size="lg">
                            Pagamento Online
                          </Button>
                          <Form.Text className="d-block mt-3" muted>
                            Clique aqui para acessar sessão de pagamento online, apenas pra quem já se inscreveu e falta
                            pagamento. Será redirecionado para link de pagamento onde poderá fazer via PIX ou cartão de
                            crédito em até 12x (com juros da administradora financeira). Antes disso, será necessário
                            fazer validação de CPF.
                          </Form.Text>
                        </Col>
                        <div className="packages-horizontal-line mb-5 d-md-none my-md-5" />
                        <Col xs={12} md={6} className="text-center initial-wrapper">
                          <Button
                            className="initial-wrapper__btn"
                            variant="warning"
                            onClick={() => setShowFormRoutes(true)}
                            size="lg"
                          >
                            Formulário de Inscrição
                          </Button>
                          <Form.Text className="d-block mt-3" muted>
                            Clique aqui para acessar sessão de inscrição do acampamento onde poderá acompanhar pacotes,
                            vagas disponíveis, etc. Será redirecionado para tela inicial do formulário de inscrição.
                          </Form.Text>
                        </Col>
                      </Row>
                      <Row>
                        <div className="packages-horizontal-line mb-5 my-md-5" />
                      </Row>
                      <Row className="text-center mb-3">
                        <h4>Consulte Status da sua Inscrição abaixo:</h4>
                        <Form.Text className="d-block mt-3" muted>
                          Insira seu CPF abaixo caso você deseje consultar o status da sua inscrição. Você obterá sua
                          situação atual de pagamento, pacote cadastrado e demais informações importantes.
                        </Form.Text>
                      </Row>
                      <Row className="justify-content-center align-items-center">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>CPF:</Form.Label>
                            <Form.Control
                              as={InputMask}
                              isInvalid={!!errors.cpf}
                              mask="999.999.999-99"
                              name="cpf"
                              id="cpf"
                              className="cpf-container"
                              value={displayedCpf}
                              onChange={handleCpfChange}
                              onKeyDown={handleKeyDown}
                              placeholder="000.000000-00"
                            ></Form.Control>
                            <Form.Control.Feedback type="invalid">{errors.cpf}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="justify-content-center align-items-center mt-4">
                        <Col className="justify-content-end d-flex" md={6}>
                          <Button variant="warning" onClick={fetchPersonData} size="lg">
                            Consultar
                          </Button>
                        </Col>
                      </Row>
                    </>
                  )}

                  {showAnotherScreen && (
                    <>
                      <Loading loading={loading} />

                      {showCpfField && (
                        <>
                          <Row className="text-center mb-5">
                            <div className="choose-way-info-text--normal">
                              Se você já se inscreveu anteriormente e deseja efetuar o pagamento online, insira seu CPF
                              e escolha a forma de pagamento. Isso nos permitirá validar sua inscrição e processar o
                              pagamento
                            </div>
                            <div className="choose-way-info-text--danger">
                              OBS: Ao escolher o tipo de pagamento, inserir o CPF e avançar, um novo link de pagamento
                              online será gerado automaticamente se sua inscrição for validada (já existindo e com
                              status de pagamento pendente). Certifique-se de clicar em &apos;Avançar&apos; apenas
                              quando estiver pronto para efetuar o pagamento, pois o sistema excluirá automaticamente
                              sua inscrição se você avançar sem concluir o pagamento, com um prazo máximo de 15 minutos
                              para expiração do link. Além disso, assegure-se de escolher corretamente o tipo de
                              pagamento, pois não será permitido retornar para realizar alterações após clicar em
                              Avançar.
                            </div>
                          </Row>
                          <Row className="justify-content-center align-items-center mb-4">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Escolha sua forma de pagamento:</Form.Label>
                                <Form.Select
                                  id="formPayment"
                                  name="formPayment"
                                  isInvalid={!!errors.formPayment}
                                  value={values.formPayment}
                                  onChange={handleChange}
                                >
                                  <option value="" disabled selected>
                                    Selecione uma opção
                                  </option>
                                  <option value="pix">Online PIX</option>
                                  <option value="creditCard">Online Cartão (Até 12x)</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.formPayment}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="justify-content-center align-items-center mb-4">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>CPF:</Form.Label>
                                <Form.Control
                                  as={InputMask}
                                  isInvalid={!!errors.cpf}
                                  mask="999.999.999-99"
                                  name="cpf"
                                  id="cpf"
                                  className="cpf-container"
                                  value={displayedCpf}
                                  onChange={handleCpfChange}
                                  onKeyDown={handleKeyDown}
                                  placeholder="000.000000-00"
                                ></Form.Control>
                                <Form.Control.Feedback type="invalid">{errors.cpf}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="justify-content-center align-items-center">
                            <Col className="justify-content-end d-flex" md={6}>
                              <Button variant="warning" onClick={sendCpfValue} size="lg" disabled={isButtonDisabled}>
                                Avançar
                              </Button>
                            </Col>
                          </Row>
                        </>
                      )}
                      {showRegistrationFields && <CpfReview formValues={personData} />}
                    </>
                  )}
                </Container>
              </Card.Body>
            </Card>
          </div>
          <Footer onAdminClick={handleAdminClick} />
        </div>
      )}

      {showFormRoutes && <FormRoutes />}
    </>
  );
};

export default ChooseWay;
