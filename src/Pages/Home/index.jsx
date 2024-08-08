import PropTypes from 'prop-types';
import { Container, Button, Card } from 'react-bootstrap';

const FormHome = (props) => {
  return (
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <div className="row">
            <div className="col">
              <h3 className="mb-2 text-center">Acampamento no período de carnaval 2025</h3>
              <h5 className="mb-2 text-center">
                IP de Boa Viagem - {' '}
                <span className="date-enphasis fw-bold">01 a 05 de Março - Garanhuns<br/> Colégio XV de Novembro • Preletor: Rev. Valdeci Santos</span>
              </h5>
              <p className="mb-2 text-center">
                Siga o passo a passo para completar sua inscrição. Qualquer dúvida, favor contactar a secretaria da
                igreja no telefone <em>(81) 9 9839-0194</em> (whatsapp). <br />
                <b>Vagas Limitadas • Inscrições e Pagamento até 09 de Fevereiro ou até se esgotarem as vagas!</b>
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
                    <b>AS INSCRIÇÕES SÃO INDIVIDUAIS! Por favor, preencha todos os campos corretamente.</b>
                  </u>
                </li>
                <li>
                  Inscrições e pagamentos apenas online.{' '}
                  <u>Caso encontre alguma dificuldade, entre em contato com a secretaria</u> para que possamos lhe
                  ajudar.
                </li>
                <li>
                  Caso algum parente (pai, mãe, esposo, esposa, filhos, etc.) compartilhe o mesmo quarto que você, seja
                  no colégio ou seminário, por favor, informe-nos na seção de contato. Isso nos permitirá organizar os
                  quartos para todos.
                </li>
                <li>
                  Para garantir um controle adequado e facilitar o processo de inscrições, é fundamental registrar todas
                  as pessoas, incluindo recém-nascidos e idosos. Isso abrange todas as faixas etárias, desde crianças e
                  jovens até adultos, independentemente de serem pagantes ou não.
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
