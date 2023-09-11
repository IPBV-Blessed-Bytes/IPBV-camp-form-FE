import React from 'react';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

const FormSuccess = (formPayment) => {
  return (
    <Card className="bbp-general-height form-success">
      <Card.Body>
        <Container>
          <div className="text-center">
            <div className="form-success__title">
              <b>Formulário enviado com sucesso!</b>
            </div>
            <p className="form-success__message">Obrigado por enviar suas informações.</p>
            <p className="form-success__contact">
              {formPayment.formPayment === 'online' ? (
                <b>Qualquer dúvida, entraremos em contato.</b>
              ) : (
                <b>
                  Como a opção de pagamento escolhida foi PRESENCIAL, favor entrar em contato <br />
                  com a secretaria em até 7 dias úteis para efetuar o pagamento.
                </b>
              )}
            </p>
            <small>
              <em>Igreja Presbiteriana de Boa Viagem</em>
            </small>
          </div>
        </Container>
      </Card.Body>

      <div className="form-footer-container text-center justify-content-center">
        <Button variant="warning" size="lg" href='/' className="form-success__button">
          Novo Cadastro
        </Button>
      </div>
    </Card>
  );
};

export default FormSuccess;
