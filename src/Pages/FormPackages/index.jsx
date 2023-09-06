import { useFormik } from 'formik';
import PropTypes from 'prop-types';

import { packageSchema } from '../../form/validations/schema';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

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

  const calculateTotal = () => {
    let totalValue = 0;

    // if (accommodationValue === 'school') {
    //   if (transportationValue === 'bus') totalValue += 160;
    //   if (foodValue === 'food') totalValue += 280;
    //   if (foodValue === 'other') totalValue += 0;
    // } else if (accommodationValue === 'seminary') {
    //   totalValue += 600;
    //   if (transportationValue === 'bus') totalValue += 160;
    //   if (foodValue === 'food') totalValue += 200;
    //   if (foodValue === 'other') totalValue += 0;
    // } else if (accommodationValue === 'hotel') {
    //   totalValue += 550;
    //   if (transportationValue === 'bus') totalValue += 160;
    //   if (foodValue === 'food') totalValue += 200;
    //   if (foodValue === 'other') totalValue += 0;
    // } else if (accommodationValue === 'other') {
    //   totalValue += 0;
    //   if (transportationValue === 'bus') totalValue += 160;
    //   if (foodValue === 'food') totalValue += 280;
    //   if (foodValue === 'other') totalValue += 0;
    // }

    return totalValue;
  };

  const accomodations = [
    {
      name: 'Colégio XV de Novembro',
      description: 'lorem lorem impsu bla bla bla siadmnsaoidmsam io',
      imgSource:
        'https://4.bp.blogspot.com/-yJGbGW8Xzp4/Trf7dI1CZGI/AAAAAAAAABA/JFXgb1zSqHQ/s400/Col%25C3%25A9gio+XV+deNovembro+-+Garanhuns',
      onClick: () => {},
    },
    {
      name: 'Seminário São José',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl euismod, lacinia nisl vita',
      imgSource:
        'data:image/jpeg;base64,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',
      onClick: () => {},
    },
    {
      name: 'Hotel íbis',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      imgSource:
        'https://blogdocarloseugenio.com.br/v1/wp-content/uploads/2022/07/Hotel-Ibis-Garanhuns-1-1134x1200.jpg',
      onClick: () => {},
    },
  ];

  return (
    <Card>
      <Card.Body>
        <Container>
          <Form>
            <Card.Title>Pacotes</Card.Title>
            <Card.Text>
              Vamos começar a seleção dos pacotes. Primeiro de tudo, escolha qual o local que deseja se hospedar!
            </Card.Text>

            {accomodations.map((accomodation) => (
              <div className="package-container" key={accomodation.name}>
                <img src={accomodation.imgSource} />

                <div className="package-container-body">
                  <div className="package-container-title">{accomodation.name}</div>

                  <p>{accomodation.description}</p>

                  <div className="package-container-button-container">
                    <Button variant="warning" onClick={accomodation.onClick}>
                      Selecionar
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* <FormGroup className="mb-3">
              <FormLabel>Escolha a hospedagem:</FormLabel>

              <Form.Select
                isInvalid={!!errors.accomodation}
                name="accomodation"
                value={values.accomodation}
                onChange={handleChange}
              >
                <option value="">Selecione uma opção</option>
                <option value="school">
                  Colégio XV de Novembro <i>(Gratuíto)</i>
                </option>
                <option value="seminary">
                  Seminário São José <i>(R$ 600,00 - 4 diárias R$ 150,00 INDIVIDUAL)</i>
                </option>
                <option value="hotel">Hotel Ibis (R$ 549,60 - CASAL)</option>
                <option value="other">Outro</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.accomodation}</Form.Control.Feedback>
            </FormGroup>

            <FormGroup className="mb-3">
              <FormLabel>Escolha o transporte:</FormLabel>

              <Form.Select
                isInvalid={!!errors.transportation}
                name="transportation"
                value={values.transportation}
                onChange={handleChange}
              >
                <option value="">Selecione uma opção</option>
                <option value="bus">Ônibus</option>
                <option value="other">Outro</option>
              </Form.Select>

              <Form.Control.Feedback type="invalid">{errors.transportation}</Form.Control.Feedback>
            </FormGroup>

            <FormGroup className="mb-3">
              <FormLabel>Escolha a alimentação:</FormLabel>

              <Form.Select isInvalid={!!errors.transportation} name="food" value={values.food} onChange={handleChange}>
                <option value="">Selecione uma opção</option>
                <option value="food">Com Alimentação</option>
                <option value="other">Sem Alimentação</option>
              </Form.Select>

              <Form.Control.Feedback type="invalid">{errors.food}</Form.Control.Feedback>
            </FormGroup> */}
          </Form>
        </Container>
      </Card.Body>

      <div className="form-footer-container">
        <Button variant="secondary" onClick={backStep}>
          Voltar
        </Button>

        <Button variant="warning" onClick={submitForm}>
          Avançar
        </Button>
      </div>
    </Card>
  );
}

FormPackages.propTypes = {
  nextStep: PropTypes.func,
  backStep: PropTypes.func,
};

export default FormPackages;
