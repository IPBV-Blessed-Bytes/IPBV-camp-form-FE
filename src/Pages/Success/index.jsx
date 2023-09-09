import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

const FormSuccess = () => {
  return (
    <Card className="bbp-general-height">
      <Card.Body>
        <Container>
          <div className="">
            <div className="">
              <h3>
                <b>Formulário enviado com sucesso!</b>
              </h3>
              <p>Obrigado por enviar suas informações.</p>
              <br />
              <p>
                <b>Qualquer dúvida, entraremos em contato.</b>
              </p>
              <small>
                <em>Igreja Presbiteriana de Boa Viagem</em>
              </small>
            </div>

            <div className="form-footer-container">
              <Button variant="warning" onClick={''} size="lg">
                Novo Cadastro
              </Button>
            </div>
          </div>
        </Container>
      </Card.Body>
    </Card>
  );
};

export default FormSuccess;
