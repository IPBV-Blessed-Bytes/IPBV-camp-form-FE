import { useState } from 'react';
import PropTypes from 'prop-types';
import { Accordion } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Icons from '../../components/Icons';

const FormPackages = ({ nextStep, backStep }) => {
  const [activeCard, setActiveCard] = useState(null);

  const handleClick = (cardId) => {
    setActiveCard(cardId === activeCard ? null : cardId);
  };

  const accomodation = [
    {
      name: 'Colégio XV de Novembro',
    },
    {
      name: 'Seminário São José',
    },
    {
      name: 'Hotel Ibis',
    },
  ];

  const cards = [
    {
      id: '1',
      title: 'PACOTE 1 - HOSPEDAGEM COLETIVA INDIVIDUAL',
      observation: '* Em salas de aula COM ônibus',
      values: { accomodation: '00,00', food: '280,00', transportation: '160,00', total: '440,00' },
    },
    {
      id: '2',
      title: 'PACOTE 2 - HOSPEDAGEM COLETIVA INDIVIDUAL',
      observation: '* Em salas de aula SEM ônibus',
      values: { accomodation: '00,00', food: '280,00', transportation: '00,00', total: '280,00' },
    },
    {
      id: '3',
      title: 'PACOTE 3 - HOSPEDAGEM COLETIVA PARA A FAMÍLIA',
      observation: '* Em salas de aula COM ônibus',
      values: { accomodation: '00,00', food: '280,00', transportation: '160,00', total: '440,00' },
    },
    {
      id: '4',
      title: 'PACOTE 4 - HOSPEDAGEM COLETIVA PARA A FAMÍLIA',
      observation: '* Em salas de aula SEM ônibus',
      values: { accomodation: '00,00', food: '280,00', transportation: '00,00', total: '280,00' },
    },
    {
      id: '5',
      title: 'PACOTE 5 - HOSPEDAGEM INDIVIDUAL OU DUPLA',
      observation: '* COM ônibus / Café da manhã incluso no seminário',
      values: { accomodation: '600,00', food: '200,00', transportation: '160,00', total: '960,00' },
    },
    {
      id: '6',
      title: 'PACOTE 6 - HOSPEDAGEM INDIVIDUAL OU DUPLA',
      observation: '* SEM ônibus / Café da manhã incluso no seminário',
      values: { accomodation: '600,00', food: '200,00', transportation: '00,00', total: '800,00' },
    },
    {
      id: '7',
      title: 'PACOTE 7 - HOSPEDAGEM DUPLA',
      observation: '* COM ônibus / Café da manhã incluso no hotel',
      values: { accomodation: '550,00', food: '200,00', transportation: '160,00', total: '910,00' },
    },
    {
      id: '8',
      title: 'PACOTE 8 - HOSPEDAGEM DUPLA',
      observation: '* SEM ônibus / Café da manhã incluso no hotel',
      values: { accomodation: '550,00', food: '200,00', transportation: '00,00', total: '750,00' },
    },
  ];

  const groupedCards = [cards.slice(0, 4), cards.slice(4, 6), cards.slice(6, 8)];

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
                    {groupedCards[index].map((cards) => (
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
                              <p>
                                <span>Hospedagem:</span> R$ {cards.values.accomodation}
                              </p>
                              <p>
                                <span>Alimentação:</span> R$ {cards.values.food}
                              </p>
                              <p>
                                <span>Ônibus:</span> R$ {cards.values.transportation}
                              </p>
                              <p>
                                <em>
                                  <span>Total:</span> <u>R$ {cards.values.total}</u>
                                </em>
                              </p>
                            </div>
                            <Icons
                              typeIcon="selected"
                              className={activeCard === cards.id ? 'align-self-end' : 'd-none'}
                              iconSize={50}
                              fill="#4267a7"
                            />
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
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
};

export default FormPackages;
