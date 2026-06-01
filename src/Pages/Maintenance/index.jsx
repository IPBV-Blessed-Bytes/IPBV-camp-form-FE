import { Container } from 'react-bootstrap';
import './style.scss';
import Header from '@/components/Global/Header';
import FormStepLayout from '@/components/Global/FormStepLayout';

const Maintenance = () => {
  return (
    <>
      <Header />
      <div className="form__container container">
        <FormStepLayout>
            <Container>
              <div className="form__success text-center">
                <div className="form__success__title">
                  <h2>
                    <b className="d-flex flex-column align-items-center px-4 mt-5">
                      SITE EM MANUTENÇÃO. RETORNE EM OUTRO MOMENTO!
                    </b>
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
        </FormStepLayout>
      </div>
    </>
  );
};

export default Maintenance;
