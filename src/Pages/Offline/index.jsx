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
                      <b>As inscrições para o acampamento de 2026 começarão em breve. Aguarde!</b>
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
      <Footer onAdminClick={() => navigate('/admin')} />
    </>
  );
};

export default Offline;
