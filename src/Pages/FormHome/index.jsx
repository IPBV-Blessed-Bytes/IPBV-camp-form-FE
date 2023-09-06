import PropTypes from 'prop-types';

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function FormHome(props) {
  return (
    <Card>
      <Card.Body>
        <Container>
          <Card.Title>Bem-Vindo</Card.Title>

          <div className="row mb-5">
            <div className="col">
              <h3 className="mb-2">Acampamento no período de carnaval 2024</h3>
              <h5 className="mb-2">Igreja Presbiteriana de Boa Viagem</h5>
              <p className="mb-2">Siga o passo a passo para completar sua inscrição. </p>
              <p className="mb-2">
                Qualquer dúvida, favor contactar a secretaria da igreja no telefone <em>(81) 9839-0194</em>.
              </p>
            </div>
          </div>
        </Container>
      </Card.Body>

      <div className="form-footer-container">
        <div></div>

        <Button variant="warning" onClick={props.nextStep}>
          Avançar
        </Button>
      </div>
    </Card>
  );
}

FormHome.propTypes = {
  nextStep: PropTypes.func,
};

export default FormHome;
