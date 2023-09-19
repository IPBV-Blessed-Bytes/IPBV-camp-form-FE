import { useState } from 'react';

import PropTypes from 'prop-types';
import { Accordion } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

import Icons from '../../components/Icons';
import formatCurrency from '../../utils/formatCurrency';
import calculateAge from './utils/calculateAge';
import getPackages, { accommodations } from './utils/packages';

const FormPackages = ({ nextStep, backStep, birthDate, updateForm, sendForm }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [hasError, setHasError] = useState(false);
  const age = calculateAge(birthDate);
  const packages = getPackages(age);

  const handleClick = (selectedPackage) => {
    if (hasError) {
      setHasError(false);
    }

    setSelectedPackage(selectedPackage);

    const { accomodation, transportation, food, values } = selectedPackage;
    updateForm({
      price: values.total,
      accomodation: accomodation,
      transportation: transportation,
      food: food,
    });
  };

  const submitForm = () => {
    if (!selectedPackage) {
      setHasError(true);
      return;
    }

    if (selectedPackage.values.total === 0) {
      sendForm();
    } else {
      nextStep();
    }
  };

  return (
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <Card.Title>Pacotes</Card.Title>
          <Card.Text>
            Vamos começar a seleção dos pacotes. Primeiro de tudo, escolha qual o local que deseja se hospedar.
            Posteriormente escolha o pacote deseja e clique nele para ser redirecionado.
          </Card.Text>
          <Form>
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

                        return (
                          <Card
                            key={cards.id}
                            className={`form__container-pointer${
                              selectedPackage?.id === cards.id ? ' card-is-active' : ''
                            }`}
                            onClick={() => {
                              handleClick(cards);
                            }}
                          >
                            <Card.Body id={cards.accomodation.id}>
                              <Card.Title>{cards.title}</Card.Title>
                              <div className="card-wrapper d-flex justify-content-between">
                                <div className="card-text">
                                  <p className="mb-2">
                                    <span>{cards.observation}</span>
                                  </p>

                                  <div className="package-description-container">
                                    <span>Hospedagem:</span>
                                    <div>
                                      <div className={hasAccomodationWithDiscount && 'price-with-discount'}>
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
                                  <div className="package-description-container">
                                    <span>Alimentação:</span>
                                    <div>
                                      <div className={!!hasFoodWithDiscount && 'price-with-discount'}>
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
                                  <div className="package-description-container">
                                    <span>Ônibus:</span>
                                    <div>
                                      <div className={hasTransportationDiscount && 'price-with-discount'}>
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
                                  <div className="package-description-container">
                                    <em className="d-flex gap-1">
                                      <span>Total:</span> <u>{formatCurrency(cards.values.total)}</u>
                                    </em>
                                  </div>
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
        </Container>
      </Card.Body>

      <div className="form__container__buttons">
        <Button variant="light" onClick={backStep} size="lg">
          Voltar
        </Button>
        <Button variant="warning" onClick={submitForm} size="lg">
          Avançar
        </Button>
      </div>
    </Card>
  );
};

FormPackages.propTypes = {
  nextStep: PropTypes.func,
  backStep: PropTypes.func,
  birthDate: PropTypes.string.isRequired,
  updateForm: PropTypes.func,
  noPaymentRequired: PropTypes.bool,
  sendForm: PropTypes.func,
  initialValues: PropTypes.shape({
    price: PropTypes.string,
    accomodation: PropTypes.string,
    transportation: PropTypes.string,
    food: PropTypes.string,
  }),
};

export default FormPackages;
