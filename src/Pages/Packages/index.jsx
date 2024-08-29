import { useState } from 'react';
import PropTypes from 'prop-types';
import { Accordion, Container, Card, Form, Button, Col, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Icons from '../../components/Icons';
import formatCurrency from '../../utils/formatCurrency';
import calculateAge from './utils/calculateAge';
import getPackages, { accommodations } from './utils/packages';
import axios from 'axios';

import { BASE_URL } from '../../config/index';

const FormPackages = ({
  nextStep,
  backStep,
  birthDate,
  updateForm,
  spinnerLoading,
  availablePackages,
  totalRegistrationsGlobal,
  formUsername,
}) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [showCouponField, setShowCouponField] = useState(false);
  const [discountCoupon, setDiscountCoupon] = useState('');
  const [discountValue, setDiscountValue] = useState(0);
  const [hasDiscount, setHasDiscount] = useState(false);
  const age = calculateAge(birthDate);
  const packages = getPackages(age);

  const packageMapping = {
    1: { available: 'colegioIndividual', used: 'colegioIndividualComOnibusComAlimentacao' },
    2: { available: 'colegioIndividual', used: 'colegioIndividualSemOnibusComAlimentacao' },
    3: { available: 'colegioIndividual', used: 'colegioIndividualComOnibusSemAlimentacao' },
    4: { available: 'colegioIndividual', used: 'colegioIndividualSemOnibusSemAlimentacao' },
    5: { available: 'colegioFamilia', used: 'colegioFamiliaComOnibusComAlimentacao' },
    6: { available: 'colegioFamilia', used: 'colegioFamiliaSemOnibusComAlimentacao' },
    7: { available: 'colegioFamilia', used: 'colegioFamiliaComOnibusSemAlimentacao' },
    8: { available: 'colegioFamilia', used: 'colegioFamiliaSemOnibusSemAlimentacao' },
    9: { available: 'colegioCamping', used: 'colegioCampingSemOnibusComAlimentacao' },
    10: { available: 'colegioCamping', used: 'colegioCampingSemOnibusSemAlimentacao' },
    11: { available: 'seminario', used: 'seminarioIndividualComOnibusComAlimentacao' },
    12: { available: 'seminario', used: 'seminarioIndividualSemOnibusComAlimentacao' },
    13: { available: 'outro', used: 'outroComOnibusComAlimentacao' },
    14: { available: 'outro', used: 'outroSemOnibusSemAlimentacao' },
    15: { available: 'usuarioSemCusto', used: 'usuarioSemCusto' },
  };

  const handleCouponChange = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/cupom`);
      const coupons = response.data.coupons;
      const validCoupon = coupons.find((coupon) => coupon.code === discountCoupon && !coupon.used);
      if (validCoupon) {
        await axios.put(`${BASE_URL}/cupom/${validCoupon.id}`, {
          ...validCoupon,
          used: true,
          user: formUsername,
        });

        setDiscountValue(validCoupon.discount);
        setHasDiscount(true);
        toast.success('Cupom validado com sucesso');
      } else if (discountCoupon === '') {
        toast.warn('Insira um cupom válido no campo ao lado');
      } else {
        setDiscountValue(0);
        setHasDiscount(false);
        toast.error('Cupom inválido ou já utilizado');
      }
    } catch (error) {
      console.error('Erro ao verificar o cupom:', error);
      setDiscountValue(0);
      setHasDiscount(false);
    }
  };

  const handleCouponInputChange = (e) => {
    setDiscountCoupon(e.target.value);
  };

  const handleClick = (selectedPackage) => {
    setSelectedPackage(null);

    setSelectedPackage(selectedPackage);

    if (hasError) {
      setHasError(false);
    }

    const { accomodation, accomodationName, subAccomodation, transportation, food, values, title } = selectedPackage;

    updateForm({
      price: values.total,
      discountCoupon: discountCoupon,
      discountValue: discountValue,
      accomodation: accomodation,
      accomodationName: accomodationName,
      subAccomodation: subAccomodation,
      transportation: transportation,
      food: food,
      title: title,
    });

    scrollToEnd();
  };

  const scrollToEnd = () => {
    const element = document.getElementById('scroll-target');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', bot: 0 });
    }
  };

  const submitForm = () => {
    if (!selectedPackage) {
      setHasError(true);

      return;
    }

    const { accomodation, accomodationName, subAccomodation, transportation, food, values, title } = selectedPackage;
    const finalPrice = Math.max(values.total - discountValue, 0);

    updateForm({
      price: values.total,
      finalPrice: finalPrice,
      discountCoupon: discountCoupon,
      discountValue: discountValue,
      accomodation: accomodation,
      accomodationName: accomodationName,
      subAccomodation: subAccomodation,
      transportation: transportation,
      food: food,
      title: title,
    });

    nextStep();
  };

  const handleCouponClick = () => {
    setShowCouponField((prevState) => !prevState);
  };

  const validRegistrations = totalRegistrationsGlobal.totalValidRegistrationsGlobal;

  const isChild = age < 11;

  const isRegistrationClosed = validRegistrations >= 600 && !isChild;

  return (
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <Card.Title>Pacotes</Card.Title>
          {!isRegistrationClosed && (
            <>
              <Card.Text>
                Vamos começar a seleção dos pacotes. Primeiro de tudo, informe se você possui um cupom de desconto e
                insira-o no campo abaixo. Certifique-se de validar o cupom apenas quando for concluir a inscrição e
                realizar o pagamento, pois, após validado, o seu cupom não poderá ser reutilizado. Caso não tenha um
                cupom, basta pular para a escolha do pacote. Em seguida, escolha o local de hospedagem e o pacote
                desejado, com ou sem alimentação e transporte, e clique nele para ser redirecionado.
              </Card.Text>
              <hr className="horizontal-line" />
              <Card.Text>
                Se optar por um pacote SEM alimentação, na próxima etapa do formulário, você poderá selecionar refeições
                avulsas, escolhendo os dias e refeições específicas. Também será possível fazer essa escolha
                posteriormente na secretaria da igreja ou no próprio acampamento, respeitando o tempo mínimo de 6 horas
                de antecedência para a refeição.
              </Card.Text>
            </>
          )}

          {isRegistrationClosed ? (
            <div className="registration-closed-message">
              <p>
                Desculpe, as vagas para inscrições estão completas. <br />
                Para maiores dúvidas, favor contactar a secretaria da igreja.
              </p>
            </div>
          ) : (
            <Form>
              {spinnerLoading && (
                <div className="overlay">
                  <div className="spinner-container">
                    <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
                    <span>Carregando dados</span>
                  </div>
                </div>
              )}
              <div className="packages-horizontal-line"></div>
              <Row className="my-4">
                <Col xs={12} md={5} className="mb-md-5 mb-3">
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      id={'hasCoupon'}
                      name={'hasCoupon'}
                      onClick={handleCouponClick}
                      label={'Possui cupom de desconto?'}
                    />
                  </Form.Group>
                </Col>
                {showCouponField && (
                  <>
                    <Col xs={12} md={4} className="mb-md-0 mb-3">
                      <Form.Group controlId="formCoupon">
                        <Form.Label>Cupom de Desconto:</Form.Label>
                        <Icons typeIcon="money" iconSize={25} fill="#65a300" />
                        <Form.Control
                          type="text"
                          value={discountCoupon}
                          onChange={handleCouponInputChange}
                          placeholder="Insira o seu cupom aqui"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={3} className="d-flex justify-content-end ">
                      <Button
                        variant="success"
                        onClick={handleCouponChange}
                        className="d-flex align-items-center"
                        size="lg"
                      >
                        Validar&nbsp;
                        <Icons typeIcon="coupon" iconSize={25} fill="#fff" />
                      </Button>
                    </Col>
                  </>
                )}
              </Row>

              <Accordion>
                {accommodations.map((accomodation, index) => (
                  <Accordion.Item className={hasError ? 'msg-error' : ''} key={index} eventKey={String(index)}>
                    <Accordion.Header>{accomodation}</Accordion.Header>
                    <Accordion.Body className="d-grid gap-3">
                      {packages
                        .filter((element) => element.accomodationName === accomodation)
                        .map((cards) => {
                          const finalPrice = Math.max(cards.values.total - discountValue, 0);

                          const [accomodation, accomodationWithDiscount] = cards.values.accomodation;
                          const hasAccomodationWithDiscount = typeof accomodationWithDiscount === 'number';

                          const [food, foodWithDiscount] = cards.values.food;
                          const hasFoodWithDiscount = typeof foodWithDiscount === 'number';
                          const [fixedRate] = cards.values.fixedRate || [0];
                          const [transportation, transportationWithDiscount] = cards.values.transportation;
                          const hasTransportationDiscount = typeof transportationWithDiscount === 'number';

                          const usedValidPackagesPath = availablePackages?.data?.usedValidPackages;

                          const { available: availablePackageName } = packageMapping[cards.id] || {};

                          const availableSlots = availablePackages?.data?.totalPackages?.[availablePackageName] || 0;
                          const usedValidPackagesMapping = {
                            1: {
                              colegioIndividual:
                                usedValidPackagesPath?.colegioIndividualComOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioIndividualSemOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioIndividualComOnibusSemAlimentacao +
                                usedValidPackagesPath?.colegioIndividualSemOnibusSemAlimentacao,
                            },
                            2: {
                              colegioIndividual:
                                usedValidPackagesPath?.colegioIndividualComOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioIndividualSemOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioIndividualComOnibusSemAlimentacao +
                                usedValidPackagesPath?.colegioIndividualSemOnibusSemAlimentacao,
                            },
                            3: {
                              colegioIndividual:
                                usedValidPackagesPath?.colegioIndividualComOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioIndividualSemOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioIndividualComOnibusSemAlimentacao +
                                usedValidPackagesPath?.colegioIndividualSemOnibusSemAlimentacao,
                            },
                            4: {
                              colegioIndividual:
                                usedValidPackagesPath?.colegioIndividualComOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioIndividualSemOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioIndividualComOnibusSemAlimentacao +
                                usedValidPackagesPath?.colegioIndividualSemOnibusSemAlimentacao,
                            },
                            5: {
                              colegioFamilia:
                                usedValidPackagesPath?.colegioFamiliaComOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioFamiliaSemOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioFamiliaComOnibusSemAlimentacao +
                                usedValidPackagesPath?.colegioFamiliaSemOnibusSemAlimentacao,
                            },
                            6: {
                              colegioFamilia:
                                usedValidPackagesPath?.colegioFamiliaComOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioFamiliaSemOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioFamiliaComOnibusSemAlimentacao +
                                usedValidPackagesPath?.colegioFamiliaSemOnibusSemAlimentacao,
                            },
                            7: {
                              colegioFamilia:
                                usedValidPackagesPath?.colegioFamiliaComOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioFamiliaSemOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioFamiliaComOnibusSemAlimentacao +
                                usedValidPackagesPath?.colegioFamiliaSemOnibusSemAlimentacao,
                            },
                            8: {
                              colegioFamilia:
                                usedValidPackagesPath?.colegioFamiliaComOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioFamiliaSemOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioFamiliaComOnibusSemAlimentacao +
                                usedValidPackagesPath?.colegioFamiliaSemOnibusSemAlimentacao,
                            },
                            9: {
                              colegioCamping:
                                usedValidPackagesPath?.colegioCampingSemOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioCampingSemOnibusSemAlimentacao,
                            },
                            10: {
                              colegioCamping:
                                usedValidPackagesPath?.colegioCampingSemOnibusComAlimentacao +
                                usedValidPackagesPath?.colegioCampingSemOnibusSemAlimentacao,
                            },
                            11: {
                              seminario:
                                usedValidPackagesPath?.seminarioIndividualComOnibusComAlimentacao +
                                usedValidPackagesPath?.seminarioIndividualSemOnibusComAlimentacao,
                            },
                            12: {
                              seminario:
                                usedValidPackagesPath?.seminarioIndividualComOnibusComAlimentacao +
                                usedValidPackagesPath?.seminarioIndividualSemOnibusComAlimentacao,
                            },
                            13: {
                              outro:
                                usedValidPackagesPath?.outroComOnibusComAlimentacao +
                                usedValidPackagesPath?.outroSemOnibusSemAlimentacao,
                            },
                            14: {
                              outro:
                                usedValidPackagesPath?.outroComOnibusComAlimentacao +
                                usedValidPackagesPath?.outroSemOnibusSemAlimentacao,
                            },
                            15: {
                              usuarioSemCusto: usedValidPackagesPath?.usuarioSemCusto,
                            },
                          };

                          const usedValidPackagesSum = usedValidPackagesMapping[cards.id][availablePackageName];

                          const openPackages = availableSlots - usedValidPackagesSum;

                          const isPackageAvailable = openPackages > 0 || isChild;

                          return (
                            <Card
                              key={cards.id}
                              className={`form__container-pointer${
                                selectedPackage?.id === cards.id ? ' card-is-active' : ''
                              }${!isPackageAvailable ? ' not-available' : ''} ${
                                !isPackageAvailable ? 'card-disabled' : ''
                              }`}
                              onClick={() => {
                                if (isPackageAvailable) {
                                  handleClick(cards);
                                }
                              }}
                            >
                              <Card.Body id={cards.id}>
                                <Card.Title>
                                  {cards.title} <span className="text-success-custom">{cards.subtitle}</span>
                                </Card.Title>
                                <div className="card-wrapper d-flex justify-content-between">
                                  <div className="card-text w-100">
                                    <p className="mb-2">
                                      <span>
                                        {cards.observation}
                                        <b className="text-danger">{cards.observationHighlite}</b> | {cards.food}
                                      </span>
                                    </p>

                                    {food === 0 && (
                                      <>
                                        <div className="package-description-container">
                                          <span className="text-warning initialism">Taxa de Manutenção:&nbsp;</span>
                                          <div>
                                            <div className="text-warning">{formatCurrency(fixedRate)}</div>
                                          </div>
                                        </div>
                                        <div className="packages-horizontal-line"></div>
                                      </>
                                    )}
                                    <div className="package-description-container">
                                      <span>Hospedagem:</span>
                                      <div>
                                        <div className={hasAccomodationWithDiscount ? 'price-with-discount' : ''}>
                                          {formatCurrency(accomodation)}
                                        </div>
                                        {hasAccomodationWithDiscount && (
                                          <>
                                            <div>{formatCurrency(accomodationWithDiscount)}</div>
                                            <span>{cards.values.discountDescription.accomodation}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div className="packages-horizontal-line"></div>
                                    <div className="package-description-container">
                                      <span>Alimentação:</span>
                                      <div>
                                        <div className={hasFoodWithDiscount ? 'price-with-discount' : ''}>
                                          {formatCurrency(food)}
                                        </div>
                                        {hasFoodWithDiscount && (
                                          <>
                                            <div>{formatCurrency(foodWithDiscount)}</div>
                                            <span>{cards.values.discountDescription.food}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div className="packages-horizontal-line"></div>
                                    <div className="package-description-container">
                                      <span>Ônibus:</span>
                                      <div>
                                        <div className={hasTransportationDiscount ? 'price-with-discount' : ''}>
                                          {formatCurrency(transportation)}
                                        </div>
                                        {hasTransportationDiscount && (
                                          <>
                                            <div>{formatCurrency(transportationWithDiscount)}</div>
                                            <span>{cards.values.discountDescription.transportation}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div className="packages-horizontal-line"></div>
                                    <div className="package-description-container">
                                      <em className="d-flex gap-1 info-text-wrapper">
                                        <span>Total:</span>{' '}
                                        <u className={`card-text ${hasDiscount ? 'price-with-discount' : ''}`}>
                                          {formatCurrency(cards.values.total)}
                                        </u>
                                        {hasDiscount && (
                                          <u className="card-text">
                                            <b>*Valor com desconto = ${finalPrice}</b>
                                          </u>
                                        )}
                                      </em>
                                    </div>
                                    {!isPackageAvailable && (
                                      <div className="package-description-container justify-content-end">
                                        <span className="no-vacancy text-danger text-decoration-underline mt-3">
                                          Sem Vagas Disponíveis
                                        </span>
                                      </div>
                                    )}
                                    {isPackageAvailable && (
                                      <div className="package-description-container package-available mt-3 justify-content-end">
                                        <span className="text-success">
                                          Vagas Disponíveis:
                                          <ul className="m-0">
                                            {openPackages > 0 ? (
                                              <li>
                                                Adultos: <em>{openPackages}</em>
                                              </li>
                                            ) : (
                                              <li>
                                                Adultos: <em className="text-danger">Esgotado</em>
                                              </li>
                                            )}
                                            <li>
                                              <span className="text-success">
                                                Crianças: <em>Ilimitado</em>
                                              </span>
                                            </li>
                                          </ul>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {
                                  <div className="selected-icon-container">
                                    {selectedPackage?.id === cards.id && (
                                      <Icons typeIcon="selected" iconSize={50} fill="#4267a7" />
                                    )}
                                  </div>
                                }
                              </Card.Body>
                            </Card>
                          );
                        })}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
              {hasError && (
                <div className={`invalid-feedback d-block`}>
                  Selecione um pacote &nbsp;
                  <Icons typeIcon="error" iconSize={25} fill="#c92432" />
                </div>
              )}
            </Form>
          )}
        </Container>
      </Card.Body>

      <div className="form__container__buttons">
        <Button variant="light" onClick={backStep} size="lg">
          Voltar
        </Button>
        {!isRegistrationClosed && (
          <Button variant="warning" onClick={submitForm} size="lg">
            Avançar
          </Button>
        )}
      </div>
      <div id="scroll-target" />
    </Card>
  );
};

FormPackages.propTypes = {
  nextStep: PropTypes.func,
  backStep: PropTypes.func,
  birthDate: PropTypes.string.isRequired,
  updateForm: PropTypes.func,
  spinnerLoading: PropTypes.bool,
  availablePackages: PropTypes.bool,
  totalRegistrationsGlobal: PropTypes.bool,
  initialValues: PropTypes.shape({
    price: PropTypes.string,
    accomodation: PropTypes.string,
    transportation: PropTypes.string,
    food: PropTypes.string,
    title: PropTypes.string,
  }),
};

export default FormPackages;
