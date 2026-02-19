import { Container, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './style.scss';
import Header from '@/components/Global/Header';
import Footer from '@/components/Global/Footer';

const Offline = () => {
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
                    <b>As inscrições para o acampamento de 2027 começarão em breve. Aguarde!</b>
                  </h2>
                </div>
                <p className="form__success__message"></p>
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

export default Offline;
