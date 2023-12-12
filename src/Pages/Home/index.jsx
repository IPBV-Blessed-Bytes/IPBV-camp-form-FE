import PropTypes from 'prop-types';

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

const FormHome = (props) => {
  return (
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <div className="row">
            <div className="col">
              <h3 className="mb-2">Acampamento no período de carnaval 2024</h3>
              <h5 className="mb-2">
                Igreja Presbiteriana de Boa Viagem - <span className="date-enphasis fw-bold">10 a 14 de Fevereiro</span>
              </h5>
              <p className="mb-2">
                Siga o passo a passo para completar sua inscrição. Qualquer dúvida, favor contactar a secretaria da
                igreja no telefone <em>(81) 9839-0194</em> (whatsapp).
              </p>
            </div>
          </div>
          <hr className="horizontal-line" />
          <div className="row">
            <div className="col">
              <h4 className="mb-2">Observações:</h4>
              <ul>
                <li>
                  <u>
                    <b>
                      AS INSCRIÇÕES SÃO INDIVIDUAIS! Por favor, preencha todos os campos corretamente.
                    </b>
                  </u>
                </li>
                <li>
                  Recomendamos realizar os pagamentos online aqui no formulário, pois isso automatiza o processo e
                  simplifica o trabalho da secretaria da igreja.
                  <u>Caso encontre alguma dificuldade, entre em contato com a secretaria.</u>
                </li>
                <li>
                  Mesmo se optar por pagar presencialmente, é essencial preencher o formulário para controle. No caso de
                  pagamentos presenciais, por favor, entre em contato com a secretaria em até 7 dias úteis após o
                  preenchimento para efetuar o pagamento.
                </li>
                <li>
                  Caso algum parente (pai, mãe, esposo, esposa, filhos, etc.) compartilhe o mesmo quarto que você, seja
                  no colégio, hotel ou seminário, por favor, informe-nos na seção de contato. Isso nos permitirá
                  organizar os quartos para todos.
                </li>
                <li>
                  Para garantir um controle adequado e facilitar o processo de inscrições, é fundamental registrar todas
                  as pessoas, incluindo crianças recém-nascidas e idosos. Isso abrange todas as faixas etárias, desde
                  crianças e jovens até adultos, independentemente de serem pagantes ou não.
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </Card.Body>

      <div className="form__container__buttons justify-content-end">
        <Button variant="warning" onClick={props.nextStep} size="lg">
          Avançar
        </Button>
      </div>
    </Card>
  );
};

FormHome.propTypes = {
  nextStep: PropTypes.func,
};

export default FormHome;
