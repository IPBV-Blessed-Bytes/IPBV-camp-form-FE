import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './style.scss';
import Header from '@/components/Global/Header';
import Footer from '@/components/Global/Footer';
import Icons from '@/components/Global/Icons';

const WaitingForCamp = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="form__container container">
        <Card className="form__container__general-height">
          <Card.Body>
            <Container>
              <div className="form__success text-center">
                <div className="form__success__title">
                  <h2>
                    <b>As inscrições para o acampamento de 2026 foram encerradas. Nos vemos no sábado em Garanhuns!</b>
                  </h2>
                </div>
                <div className="waiting-for-camp-buttons mb-4">
                  <div className="waiting-for-camp-buttons__verify">
                    <Card.Title>Verifique sua inscrição:</Card.Title>
                    <Card.Text>
                      Insira seu CPF e data de nascimento para verificar seus dados de inscrição, caso esteja inscrito.
                      Acompanhantes, pacote, status de pagamento, alimentação, contato de carona, valor pago, entre
                      outros.
                    </Card.Text>
                    <div className="waiting-for-camp-buttons__verify-button">
                      <Button className="verify-registration-button" onClick={() => navigate('/verificacao')}>
                        Verificar Inscrição&nbsp;
                        <Icons className="info-icons" typeIcon="refresh" iconSize={25} fill={'#000'} />
                      </Button>
                    </div>
                  </div>

                  <hr className="horizontal-line" />

                  <div className="waiting-for-camp-buttons-faq">
                    <Card.Title>Perguntas Frequentes:</Card.Title>
                    <Card.Text>
                      Visualize aqui algumas perguntas frequentes e suas respostas. Já foi a dúvida de outros, pode ser
                      a sua também!
                    </Card.Text>
                    <div className="waiting-for-camp-buttons__verify-button">
                      <Button className="verify-registration-button" onClick={() => navigate('/perguntas')}>
                        Perguntas Frequentes&nbsp;
                        <Icons className="info-icons" typeIcon="question" iconSize={25} fill={'#000'} />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="form__success__contact">
                  <b>
                    Qualquer dúvida nos contate no telefone da organização do evento para mais informações. <br />
                    (81) 99999-7767 (Whatsapp) ou (81) 99839-0194.
                  </b>
                </p>
                <small className="mt-5">
                  <em>Igreja Presbiteriana de Boa Viagem</em>
                </small>
              </div>
            </Container>
          </Card.Body>
        </Card>
      </div>
      <Footer handleAdminClick={() => navigate('/admin')} />
    </>
  );
};

export default WaitingForCamp;
