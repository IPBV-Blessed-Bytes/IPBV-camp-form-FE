import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Accordion, Container, Card, Form, Button } from 'react-bootstrap';
import Icons from '../../components/Icons';
import formatCurrency from '../../utils/formatCurrency';
import calculateAge from './utils/calculateAge';
import getPackages, { accommodations } from './utils/packages';

const FormPackages = ({
  nextStep,
  backStep,
  birthDate,
  updateForm,
  spinnerLoading,
  availablePackages,
  totalRegistrationsGlobal,
}) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [hasError, setHasError] = useState(false);
  const age = calculateAge(birthDate);
  const packages = getPackages(age);

  const packageMapping = {
    1: { available: 'colegioIndividual', used: 'colegioIndividualComOnibus' },
    2: { available: 'colegioIndividual', used: 'colegioIndividualSemOnibus' },
    3: { available: 'colegioFamilia', used: 'colegioFamiliaComOnibus' },
    4: { available: 'colegioFamilia', used: 'colegioFamiliaSemOnibus' },
    5: { available: 'colegioCamping', used: 'colegioCampingSemAlimentacao' },
    6: { available: 'colegioCamping', used: 'colegioCampingComAlimentacao' },
    7: { available: 'seminario', used: 'seminarioIndividualComOnibus' },
    8: { available: 'seminario', used: 'seminarioIndividualSemOnibus' },
    9: { available: 'hotel', used: 'hotelDuplaComOnibus' },
    10: { available: 'hotel', used: 'hotelDuplaSemOnibus' },
    11: { available: 'outro', used: 'outroComOnibus' },
    12: { available: 'outro', used: 'outroSemOnibus' },
    13: { available: 'usuarioSemCusto', used: 'usuarioSemCusto' },
  };

  const handleClick = (selectedPackage) => {
    if (hasError) {
      setHasError(false);
    }

    setSelectedPackage(selectedPackage);

    const { accomodation, transportation, food, values, title } = selectedPackage;
    updateForm({
      price: values.total,
      accomodation: accomodation,
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
    nextStep();
  };

  const validRegistrations = totalRegistrationsGlobal.totalValidRegistrations;

  const isRegistrationClosed = validRegistrations >= 300;

  const isChild = age < 11;

  return (
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <Card.Title>Pacotes</Card.Title>
          {!isRegistrationClosed && (
            <Card.Text>
              Vamos começar a seleção dos pacotes. Primeiro de tudo, escolha qual o local que deseja se hospedar.
              Posteriormente escolha o pacote desejado e clique nele para ser redirecionado.
            </Card.Text>
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
              <Accordion>
                {accommodations.map((accomodation, index) => (
                  <Accordion.Item className={hasError ? 'msg-error' : ''} key={index} eventKey={String(index)}>
                    <Accordion.Header>{accomodation}</Accordion.Header>
                    <Accordion.Body className="d-grid gap-3">
                      {packages
                        .filter((element) => element.accomodation.name === accomodation)
                        .map((cards) => {
                          const [accomodation, accomodationWithDiscount] = cards.values.accomodation;
                          const hasAccomodationWithDiscount = typeof accomodationWithDiscount === 'number';

                          const [food, foodWithDiscount] = cards.values.food;
                          const hasFoodWithDiscount = typeof foodWithDiscount === 'number';

                          const [transportation, transportationWithDiscount] = cards.values.transportation;
                          const hasTransportationDiscount = typeof transportationWithDiscount === 'number';

                          const usedValidPackagesPath = availablePackages?.data?.usedValidPackages;

                          const { available: availablePackageName, used: usedPackageName } =
                            packageMapping[cards.id] || {};

                          const availableSlots = availablePackages?.data?.totalPackages?.[availablePackageName] || 0;
                          const usedValidPackagesMapping = {
                            1: {
                              colegioIndividual:
                                usedValidPackagesPath?.colegioIndividualComOnibus +
                                usedValidPackagesPath?.colegioIndividualSemOnibus,
                            },
                            2: {
                              colegioIndividual:
                                usedValidPackagesPath?.colegioIndividualComOnibus +
                                usedValidPackagesPath?.colegioIndividualSemOnibus,
                            },
                            3: {
                              colegioFamilia:
                                usedValidPackagesPath?.colegioFamiliaComOnibus +
                                usedValidPackagesPath?.colegioFamiliaSemOnibus,
                            },
                            4: {
                              colegioFamilia:
                                usedValidPackagesPath?.colegioFamiliaComOnibus +
                                usedValidPackagesPath?.colegioFamiliaSemOnibus,
                            },
                            5: {
                              colegioCamping:
                                usedValidPackagesPath?.colegioCampingSemAlimentacao +
                                usedValidPackagesPath?.colegioCampingComAlimentacao,
                            },
                            6: {
                              colegioCamping:
                                usedValidPackagesPath?.colegioCampingSemAlimentacao +
                                usedValidPackagesPath?.colegioCampingComAlimentacao,
                            },
                            7: {
                              seminario:
                                usedValidPackagesPath?.seminarioIndividualComOnibus +
                                usedValidPackagesPath?.seminarioIndividualSemOnibus,
                            },
                            8: {
                              seminario:
                                usedValidPackagesPath?.seminarioIndividualComOnibus +
                                usedValidPackagesPath?.seminarioIndividualSemOnibus,
                            },
                            9: {
                              hotel:
                                usedValidPackagesPath?.hotelDuplaComOnibus + usedValidPackagesPath?.hotelDuplaSemOnibus,
                            },
                            10: {
                              hotel:
                                usedValidPackagesPath?.hotelDuplaComOnibus + usedValidPackagesPath?.hotelDuplaSemOnibus,
                            },
                            11: {
                              outro: usedValidPackagesPath?.outroComOnibus + usedValidPackagesPath?.outroSemOnibus,
                            },
                            12: {
                              outro: usedValidPackagesPath?.outroComOnibus + usedValidPackagesPath?.outroSemOnibus,
                            },
                            13: {
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
                                  {cards.title} <span className="text-danger">{cards.subtitle}</span>
                                </Card.Title>
                                <div className="card-wrapper d-flex justify-content-between">
                                  <div className="card-text w-100">
                                    <p className="mb-2">
                                      <span>{cards.observation}</span>
                                    </p>

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
                                        <div className={!!hasFoodWithDiscount ? 'price-with-discount' : ''}>
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
                                      <em className="d-flex gap-1">
                                        <span>Total:</span> <u>{formatCurrency(cards.values.total)}</u>
                                      </em>
                                    </div>
                                    {!isPackageAvailable && (
                                      <div className="package-description-container justify-content-end">
                                        <span className="no-vacancy text-danger text-decoration-underline">
                                          Sem Vagas Disponíveis
                                        </span>
                                      </div>
                                    )}
                                    {isPackageAvailable && (
                                      <div className="package-description-container package-available mt-3 justify-content-end">
                                        <span className="text-success">
                                          Vagas Disponíveis Adultos: <em>{openPackages}</em>
                                        </span>
                                        {isChild && (
                                          <span className="text-success">
                                            Vagas Disponíveis Crianças: <em>Ilimitado</em>
                                          </span>
                                        )}
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
  noPaymentRequired: PropTypes.bool,
  initialValues: PropTypes.shape({
    price: PropTypes.string,
    accomodation: PropTypes.string,
    transportation: PropTypes.string,
    food: PropTypes.string,
    title: PropTypes.string,
  }),
};

export default FormPackages;
