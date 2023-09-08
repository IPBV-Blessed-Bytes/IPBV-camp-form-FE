import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { Accordion } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

import { packageSchema } from '../../form/validations/schema';

function FormPackages({ nextStep, backStep }) {
  const { values, handleChange, errors, submitForm } = useFormik({
    initialValues: {
      accomodation: '',
      transportation: '',
      food: '',
    },
    onSubmit: () => {
      nextStep();
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: packageSchema,
  });

  const accomodations = [
    {
      name: 'Colégio XV de Novembro',
      description: 'lorem lorem impsu bla bla bla siadmnsaoidmsam io',
    },
    {
      name: 'Seminário São José',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl euismod, lacinia nisl vita',
    },
    {
      name: 'Hotel íbis',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
  ];

  return (
    <>
      <Card className="bbp-general-height">
        <Card.Body>
          <Container>
            <Form>
              <Card.Title>Pacotes</Card.Title>
              <Card.Text>
                Vamos começar a seleção dos pacotes. Primeiro de tudo, escolha qual o local que deseja se hospedar!
              </Card.Text>

              <Accordion>
                {accomodations.map((accomodation, key) => (
                  <>
                    <Accordion.Item eventKey={String(key)}>
                      <Accordion.Header>{accomodation.name}</Accordion.Header>

                      <Accordion.Body>
                        <div
                          className="card"
                          style={{
                            margin: '20px 10px',
                            width: '400px',
                            padding: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                          }}
                        ></div>
                        <Card
                        className="hover"
                          style={{
                            margin: '20px 10px',
                            width: '400px',
                            padding: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '16px',
                              fontWeight: 'bold',
                            }}
                          >
                            HOSPEDAGEM COLETIVA EM SALAS DE AULA + REFEIÇÕES
                          </div>

                          <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                            <div>alimentação - R$280,00 </div>
                            <div>Ônibus- R$160,00 </div>
                            <div>total - R$ 440,10 </div>
                          </div>
                        </Card>
                      </Accordion.Body>
                    </Accordion.Item>
                  </>
                ))}
              </Accordion>
            </Form>
          </Container>
        </Card.Body>

        <div className="form-footer-container">
          <Button variant="light" onClick={backStep} size="lg">
            Voltar
          </Button>

          <Button variant="warning" onClick={submitForm} size="lg">
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
