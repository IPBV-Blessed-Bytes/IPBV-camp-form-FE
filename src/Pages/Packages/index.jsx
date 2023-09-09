import { useState } from 'react';
import PropTypes from 'prop-types';
import { Accordion } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

function FormPackages({ nextStep, backStep }) {
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
      values: { accomodation: '00,00', food: '280,00', transportation: '160,00', total: '440,00' },
      observation: 'HOSPEDAGEM COLETIVA em salas de aula',
    },
    {
      id: '2',
      values: { accomodation: '00,00', food: '280,00', transportation: '00,00', total: '280,00' },
      observation: 'HOSPEDAGEM COLETIVA em salas de aula',
    },
    {
      id: '3',
      values: { accomodation: '00,00', food: '280,00', transportation: '160,00', total: '440,00' },
      observation: 'HOSPEDAGEM COLETIVA PARA A FAMÍLIA em salas de aula',
    },
    {
      id: '4',
      values: { accomodation: '00,00', food: '280,00', transportation: '00,00', total: '280,00' },
      observation: 'HOSPEDAGEM COLETIVA PARA A FAMÍLIA em salas de aula',
    },
    {
      id: '5',
      values: { accomodation: '600,00', food: '200,00', transportation: '160,00', total: '960,00' },
      observation: 'HOSPEDAGEM INDIVIDUAL, café da manhã incluso no seminário',
    },
    {
      id: '6',
      values: { accomodation: '600,00', food: '200,00', transportation: '00,00', total: '800,00' },
      observation: 'HOSPEDAGEM INDIVIDUAL, café da manhã incluso no seminário',
    },
    {
      id: '7',
      values: { accomodation: '550,00', food: '200,00', transportation: '160,00', total: '910,00' },
      observation: 'HOSPEDAGEM DUPLA, café da manhã incluso no hotel',
    },
    {
      id: '8',
      values: { accomodation: '550,00', food: '200,00', transportation: '00,00', total: '750,00' },
      observation: 'HOSPEDAGEM DUPLA, café da manhã incluso no hotel',
    },
  ];

  const groupedCards = [cards.slice(0, 4), cards.slice(4, 6), cards.slice(6, 8)];

  return (
    <>
      <Card className="bbp-general-height">
        <Card.Body>
          <Container>
            <Form>
              <Card.Title>Pacotes</Card.Title>
              <Card.Text>
                Vamos começar a seleção dos pacotes. Primeiro de tudo, escolha qual o local que deseja se hospedar,
                posteriormente escolha o pacote deseja e clique nele para ser redirecionado.
              </Card.Text>

              <Accordion>
                {accomodation.map((accomodation, index) => (
                  <Accordion.Item key={index} eventKey={String(index)}>
                    <Accordion.Header>{accomodation.name}</Accordion.Header>
                    <Accordion.Body className="d-grid gap-3">
                      {groupedCards[index].map((cards) => (
                        <Card
                          key={cards.id}
                          className={`${activeCard === cards.id ? ' card-is-active' : ''}`}
                          onClick={() => handleClick(cards.id)}
                        >
                          <Card.Body>
                            <Card.Title>{cards.observation}</Card.Title>
                            <Card.Text>
                              <div>
                                <span>Hospedagem:</span> R$ {cards.values.accomodation}
                              </div>
                              <div>
                                <span>Alimentação:</span> R$ {cards.values.food}
                              </div>
                              <div>
                                <span>Ônibus:</span> R$ {cards.values.transportation}
                              </div>
                              <div>
                                <em>
                                  <span>Total:</span> <u>R$ {cards.values.total}</u>
                                </em>
                              </div>
                            </Card.Text>
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

        <div className="form-footer-container">
          <Button variant="light" onClick={backStep} size="lg">
            Voltar
          </Button>
          <Button variant="warning" onClick={activeCard && nextStep} size="lg">
            Avançar
          </Button>
        </div>
      </Card>
    </>
  );
}

FormPackages.propTypes = {
  nextStep: PropTypes.func,
  backStep: PropTypes.func,
};

export default FormPackages;
