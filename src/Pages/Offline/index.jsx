import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Offline = () => {
  return (
    <>
      <Header />
      <div className="form__container">
        <Card className="form__container__general-height">
          <Card.Body>
            <Container>
              <div className="form__success text-center">
                <div className="form__success__title">
                  <b>
                    Inscrições Encerradas! <br />
                    Até o acampamento ou até 2025!
                  </b>
                </div>
                <p className="form__success__message"></p>
                <p className="form__success__contact">
                  <b>
                    Qualquer dúvida nos contacte no telefone da secretaria para mais informações. <br />
                    (81) 9839-0194 (Whatsapp)
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
      <Footer />
    </>
  );
};

export default Offline;
