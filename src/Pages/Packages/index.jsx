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
import generatePackagesValues from './utils/packages';

const XV_NOVEMBRO = 'Colégio XV de Novembro';
const SEMINARIO = 'Seminário São José';
const HOTEL_IBIS = 'Hotel Ibis';

const FormPackages = ({ nextStep, backStep, birthDate }) => {
  const [activeCard, setActiveCard] = useState(null);
  const age = calculateAge(birthDate);

  const [schoollWithBuss, schollWithoutBuss] = generatePackagesValues('school', age);
  const [seminaryWithBuss, seminaryWithoutBuss] = generatePackagesValues('seminary', age);

  const handleClick = (cardId) => {
    setActiveCard(cardId === activeCard ? null : cardId);
  };

  const accomodation = [
    {
      name: XV_NOVEMBRO,
    },
    {
      name: SEMINARIO,
    },
    {
      name: HOTEL_IBIS,
    },
  ];

  const cards = [
    {
      id: '1',
      accomodation: XV_NOVEMBRO,
      title: 'PACOTE 1 - HOSPEDAGEM COLETIVA INDIVIDUAL',
      observation: '* Em salas de aula COM ônibus',
      values: { ...schoollWithBuss },
    },
    {
      id: '2',
      accomodation: XV_NOVEMBRO,
      title: 'PACOTE 2 - HOSPEDAGEM COLETIVA INDIVIDUAL',
      observation: '* Em salas de aula SEM ônibus',
      values: { ...schollWithoutBuss },
    },
    {
      id: '5',
      accomodation: SEMINARIO,
      title: 'PACOTE 5 - HOSPEDAGEM INDIVIDUAL OU DUPLA',
      observation: '* COM ônibus / Café da manhã incluso no seminário',
      values: { ...seminaryWithBuss },
    },
    {
      id: '6',
      accomodation: SEMINARIO,
      title: 'PACOTE 6 - HOSPEDAGEM INDIVIDUAL OU DUPLA',
      observation: '* SEM ônibus / Café da manhã incluso no seminário',
      values: { ...seminaryWithoutBuss },
    },
    {
      id: '7',
      accomodation: HOTEL_IBIS,
      title: 'PACOTE 7 - HOSPEDAGEM DUPLA',
      observation: '* COM ônibus / Café da manhã incluso no hotel',
      values: { accomodation: '550,00', food: '200,00', transportation: '160,00', total: '910,00' },
    },
    {
      id: '8',
      accomodation: HOTEL_IBIS,
      title: 'PACOTE 8 - HOSPEDAGEM DUPLA',
      observation: '* SEM ônibus / Café da manhã incluso no hotel',
      values: { accomodation: '550,00', food: '200,00', transportation: '00,00', total: '750,00' },
    },
  ];

  return (
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <Form>
            <Card.Title>Pacotes</Card.Title>
            <Card.Text>
              Vamos começar a seleção dos pacotes. Primeiro de tudo, escolha qual o local que deseja se hospedar.
              Posteriormente escolha o pacote deseja e clique nele para ser redirecionado.
            </Card.Text>

            <Accordion>
              {accomodation.map((accomodation, index) => (
                <Accordion.Item key={index} eventKey={String(index)}>
                  <Accordion.Header>{accomodation.name}</Accordion.Header>
                  <Accordion.Body className="d-grid gap-3">
                    {cards
                      .filter((card) => card.accomodation === accomodation.name)
                      .map((cards) => {
                        const [accomodation, accomodationWithDiscount] = cards.values.accomodation;
                        const hasAccomodationWithDiscount = typeof accomodationWithDiscount === 'number';

                        const [food, foodWithDiscount] = cards.values.food;
                        const hasFoodWithDiscount = typeof foodWithDiscount === 'number';

                        return (
                          <Card
                            key={cards.id}
                            className={`form__container-pointer${activeCard === cards.id ? ' card-is-active' : ''}`}
                            onClick={() => handleClick(cards.id)}
                          >
                            <Card.Body>
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
                                    <span>Ônibus:</span> R$ {cards.values.transportation}
                                  </div>
                                  <div className="package-description-container">
                                    <em>
                                      <span>Total:</span> <u>{formatCurrency(cards.values.total)}</u>
                                    </em>
                                  </div>
                                </div>
                              </div>
                              {
                                <div className="selected-icon-container">
                                  {activeCard === cards.id && (
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
          </Form>
        </Container>
      </Card.Body>

      <div className="form__container__buttons">
        <Button variant="light" onClick={backStep} size="lg">
          Voltar
        </Button>
        <Button variant="warning" onClick={activeCard && nextStep} size="lg">
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
};

export default FormPackages;
