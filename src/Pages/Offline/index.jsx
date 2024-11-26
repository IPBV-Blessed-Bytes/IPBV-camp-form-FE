import { Container, Card } from 'react-bootstrap';
import './style.scss';
import Header from '@/components/GlobalComponents/Header';
import Footer from '@/components/GlobalComponents/Footer';

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
                  <h2>
                    <b>As inscrições para o acampamento de 2025 começarão em breve. Aguarde!</b>
                  </h2>
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
