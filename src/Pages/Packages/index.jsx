import { useState, useEffect } from 'react';
import { Accordion, Container, Card, Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import formatCurrency from '@/utils/formatCurrency';
import getPackages, { accommodations } from './utils/packages';
import { toast } from 'react-toastify';
import './style.scss'
import Icons from '@/components/Global/Icons';

const Packages = ({
  nextStep,
  backStep,
  age,
  updateForm,
  availablePackages,
  totalRegistrationsGlobal,
  discountValue,
  hasDiscount,
  totalSeats,
  totalBusVacancies,
  totalValidWithBus,
}) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [hasError, setHasError] = useState(false);
  const packages = getPackages(age);

  const packageMapping = {
    1: { available: 'schoolIndividual', used: 'schoolIndividualWithBusWithFood' },
    2: { available: 'schoolIndividual', used: 'schoolIndividualWithoutBusWithFood' },
    3: { available: 'schoolIndividual', used: 'schoolIndividualWithBusWithoutFood' },
    4: { available: 'schoolIndividual', used: 'schoolIndividualWithoutBusWithoutFood' },
    5: { available: 'schoolFamily', used: 'schoolFamilyWithBusWithFood' },
    6: { available: 'schoolFamily', used: 'schoolFamilyWithoutBusWithFood' },
    7: { available: 'schoolFamily', used: 'schoolFamilyWithBusWithoutFood' },
    8: { available: 'schoolFamily', used: 'schoolFamilyWithoutBusWithoutFood' },
    9: { available: 'schoolCamping', used: 'schoolCampingWithoutBusWithFood' },
    10: { available: 'schoolCamping', used: 'schoolCampingWithoutBusWithoutFood' },
    11: { available: 'seminary', used: 'seminaryIndividualWithBusWithFood' },
    12: { available: 'seminary', used: 'seminaryIndividualWithoutBusWithFood' },
    13: { available: 'other', used: 'otherWithBusWithFood' },
    14: { available: 'other', used: 'otherWithoutBusWithoutFood' },
    15: { available: 'other', used: 'otherWithoutBusWithoutFood' },
  };

  useEffect(() => {
    if (hasDiscount) {
      toast.info(
        `Foi gerado um cupom de desconto no valor de ${discountValue} em seu nome. O desconto já está aplicado ao valor final dos pacotes`,
      );
    }
  }, [hasDiscount, discountValue]);

  const handleClick = (selectedPackage) => {
    setSelectedPackage(null);

    setSelectedPackage(selectedPackage);

    if (hasError) {
      setHasError(false);
    }

    const { accomodation, accomodationName, subAccomodation, transportation, food, values, title } = selectedPackage;

    updateForm({
      price: values.total,
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
      accomodation: accomodation,
      accomodationName: accomodationName,
      subAccomodation: subAccomodation,
      transportation: transportation,
      food: food,
      title: title,
      discountCoupon: hasDiscount,
      discountValue: discountValue,
    });

    nextStep();
  };

  const validRegistrations = totalRegistrationsGlobal.totalValidRegistrationsGlobal;

  const isChild = age < 11;

  const isRegistrationClosed = validRegistrations >= totalSeats && !isChild;

  return (
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <Card.Title>Pacotes</Card.Title>
          {!isRegistrationClosed && (
            <Card.Text>
              Vamos começar a seleção dos pacotes. Primeiro de tudo, escolha o local de hospedagem e o pacote desejado,
              com ou sem alimentação e transporte, clique no card do pacote pra selecionar e após isso clique em avançar
              para pular para a etapa seguinte.
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
                              schoolIndividual:
                                usedValidPackagesPath?.schoolIndividualWithBusWithoutFood +
                                usedValidPackagesPath?.schoolIndividualWithoutBusWithFood +
                                usedValidPackagesPath?.schoolIndividualWithBusWithoutFood +
                                usedValidPackagesPath?.schoolIndividualWithoutBusWithoutFood,
                            },
                            2: {
                              schoolIndividual:
                                usedValidPackagesPath?.schoolIndividualWithBusWithoutFood +
                                usedValidPackagesPath?.schoolIndividualWithoutBusWithFood +
                                usedValidPackagesPath?.schoolIndividualWithBusWithoutFood +
                                usedValidPackagesPath?.schoolIndividualWithoutBusWithoutFood,
                            },
                            3: {
                              schoolIndividual:
                                usedValidPackagesPath?.schoolIndividualWithBusWithoutFood +
                                usedValidPackagesPath?.schoolIndividualWithoutBusWithFood +
                                usedValidPackagesPath?.schoolIndividualWithBusWithoutFood +
                                usedValidPackagesPath?.schoolIndividualWithoutBusWithoutFood,
                            },
                            4: {
                              schoolIndividual:
                                usedValidPackagesPath?.schoolIndividualWithBusWithoutFood +
                                usedValidPackagesPath?.schoolIndividualWithoutBusWithFood +
                                usedValidPackagesPath?.schoolIndividualWithBusWithoutFood +
                                usedValidPackagesPath?.schoolIndividualWithoutBusWithoutFood,
                            },
                            5: {
                              schoolFamily:
                                usedValidPackagesPath?.schoolFamilyWithBusWithFood +
                                usedValidPackagesPath?.schoolFamilyWithoutBusWithFood +
                                usedValidPackagesPath?.schoolFamilyWithBusWithoutFood +
                                usedValidPackagesPath?.schoolFamilyWithoutBusWithoutFood,
                            },
                            6: {
                              schoolFamily:
                                usedValidPackagesPath?.schoolFamilyWithBusWithFood +
                                usedValidPackagesPath?.schoolFamilyWithoutBusWithFood +
                                usedValidPackagesPath?.schoolFamilyWithBusWithoutFood +
                                usedValidPackagesPath?.schoolFamilyWithoutBusWithoutFood,
                            },
                            7: {
                              schoolFamily:
                                usedValidPackagesPath?.schoolFamilyWithBusWithFood +
                                usedValidPackagesPath?.schoolFamilyWithoutBusWithFood +
                                usedValidPackagesPath?.schoolFamilyWithBusWithoutFood +
                                usedValidPackagesPath?.schoolFamilyWithoutBusWithoutFood,
                            },
                            8: {
                              schoolFamily:
                                usedValidPackagesPath?.schoolFamilyWithBusWithFood +
                                usedValidPackagesPath?.schoolFamilyWithoutBusWithFood +
                                usedValidPackagesPath?.schoolFamilyWithBusWithoutFood +
                                usedValidPackagesPath?.schoolFamilyWithoutBusWithoutFood,
                            },
                            9: {
                              schoolCamping:
                                usedValidPackagesPath?.schoolCampingWithoutBusWithFood +
                                usedValidPackagesPath?.schoolCampingWithoutBusWithoutFood,
                            },
                            10: {
                              schoolCamping:
                                usedValidPackagesPath?.schoolCampingWithoutBusWithFood +
                                usedValidPackagesPath?.schoolCampingWithoutBusWithoutFood,
                            },
                            11: {
                              seminary:
                                usedValidPackagesPath?.seminaryIndividualWithBusWithFood +
                                usedValidPackagesPath?.seminaryIndividualWithoutBusWithFood,
                            },
                            12: {
                              seminary:
                                usedValidPackagesPath?.seminaryIndividualWithBusWithFood +
                                usedValidPackagesPath?.seminaryIndividualWithoutBusWithFood,
                            },
                            13: {
                              other:
                                usedValidPackagesPath?.otherWithBusWithFood +
                                usedValidPackagesPath?.otherWithoutBusWithoutFood,
                            },
                            14: {
                              other:
                                usedValidPackagesPath?.otherWithBusWithFood +
                                usedValidPackagesPath?.otherWithoutBusWithoutFood,
                            },
                            15: {
                              other: usedValidPackagesPath?.otherWithoutBusWithoutFood,
                            },
                          };

                          const usedValidPackagesSum = usedValidPackagesMapping[cards.id][availablePackageName];

                          const openPackages = availableSlots - usedValidPackagesSum;

                          const isPackageAvailable = openPackages > 0 || isChild;

                          const busIsNotAvailable = totalValidWithBus >= totalBusVacancies;
                          const packageIsWithBus = cards.transportation.includes('Com Ônibus');

                          const cardsClass = `form__container-pointer
                                ${selectedPackage?.id === cards.id ? ' card-is-active' : ''}
                                ${!isPackageAvailable ? 'card-disabled not-available' : ''} 
                                ${busIsNotAvailable && packageIsWithBus ? 'card-disabled not-available' : ''}
                                `

                          return (
                            <Card
                              key={cards.id}
                              className={cardsClass.trim()}
                              onClick={() => {
                                if (isPackageAvailable && !(busIsNotAvailable && packageIsWithBus)) {
                                  handleClick(cards);
                                }
                              }}
                            >
                              <Card.Body id={cards.id}>
                                <Card.Title>
                                  {cards.title}
                                  <span className={`text-${cards.secondTitleFontColor}-custom`}>
                                    {' '}
                                    {cards.secondTitle}
                                  </span>
                                  <span className={`text-${cards.thirdTitleFontColor}-custom`}>
                                    {' '}
                                    {cards.thirdTitle}
                                  </span>
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
                                          <span className="initialism">
                                            <b className="text-danger">*</b> Taxa de Participação:&nbsp;
                                          </span>
                                          <div>
                                            <div className="font-weight-bold">{formatCurrency(fixedRate)}</div>
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
                                        <div className="d-flex flex-column gap-1">
                                          <u className={`card-text ${hasDiscount ? 'price-with-discount' : ''}`}>
                                            {formatCurrency(cards.values.total)}
                                          </u>
                                          {hasDiscount && (
                                            <span className="card-text fw-normal">
                                              Valor com desconto = R$&nbsp;{finalPrice}
                                            </span>
                                          )}
                                        </div>
                                      </em>
                                    </div>
                                    {(!isPackageAvailable || (busIsNotAvailable && packageIsWithBus)) && (
                                      <div className="package-description-container justify-content-end">
                                        <span className="no-vacancy text-danger text-decoration-underline mt-3">
                                          Sem Vagas Disponíveis
                                        </span>
                                      </div>
                                    )}
                                    {isPackageAvailable && !(busIsNotAvailable && packageIsWithBus) && (
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
                                      <Icons typeIcon="selected" iconSize={50} fill="#0c9183" />
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

Packages.propTypes = {
  nextStep: PropTypes.func,
  backStep: PropTypes.func,
  birthDate: PropTypes.string.isRequired,
  updateForm: PropTypes.func,
  availablePackages: PropTypes.bool,
  totalRegistrationsGlobal: PropTypes.bool,
  formUsername: PropTypes.string,
  age: PropTypes.string,
  discountValue: PropTypes.string,
  hasDiscount: PropTypes.bool,
  totalSeats: PropTypes.string,
  totalBusVacancies: PropTypes.string,
  totalValidWithBus: PropTypes.string,
  initialValues: PropTypes.shape({
    price: PropTypes.string,
    accomodation: PropTypes.string,
    transportation: PropTypes.string,
    food: PropTypes.string,
    title: PropTypes.string,
  }),
};

export default Packages;
