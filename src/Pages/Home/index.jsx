import PropTypes from 'prop-types';

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function FormHome(props) {
  return (
    <Card className="bbp-general-height">
      <Card.Body>
        <Container>
          <Card.Title>Bem-Vindo</Card.Title>

          <div className="row">
            <div className="col">
              <h3 className="mb-2">Acampamento no período de carnaval 2024</h3>
              <h5 className="mb-2">Igreja Presbiteriana de Boa Viagem</h5>
              <p className="mb-2">Siga o passo a passo para completar sua inscrição. </p>
              <p className="mb-2">
                Qualquer dúvida, favor contactar a secretaria da igreja no telefone <em>(81) 9839-0194</em>.
              </p>
            </div>
          </div>
          <hr class="horizontal-line" />
          <div className="row">
            <div className="col">
              <h4 className="mb-2">Observações:</h4>
              <ul>
                <li>
                  <u>
                    <b>Todos os campos do formulário devem ser preenchidos obrigatoriamente.</b>
                  </u>
                </li>
                <li>
                  Pagamentos online (aqui no formulário) são preferidos pois automatiza o processo e facilita o trabalho
                  da secretaria da igreja.
                </li>
                <li>
                  Se a opção de pagamento escolhida for presencial, ainda assim se faz necessário preenchimento do
                  formulário para fins de controle.
                </li>
                <li>
                  Para pagamentos presenciais, após finalizar o preenchimento do formulário favor se dirigir em até 7
                  dias úteis para efetuar o pagamento.
                </li>
                <li>
                  Se você tiver qualquer parente (pai, mãe, esposo, esposa, filhos, etc) que irão dormir no mesmo quarto
                  que você, seja no colégio, hotel ou seminário, na sessão de contato nos informe isso para que possamos
                  vincular os quartos para todos.
                </li>
                <li>
                  É necessário inscrever todas as pessoas, pagantes e não pagantes, para fins de pagamento e fins de
                  controle da secretaria. (crianças, jovens e adultos)
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </Card.Body>

      <div className="form-footer-container justify-content-end">
        <Button variant="warning" onClick={props.nextStep} size="lg">
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
