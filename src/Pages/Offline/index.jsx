import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './style.scss';
import Header from '@/components/Global/Header';
import Footer from '@/components/Global/Footer';
import FormStepLayout from '@/components/Global/FormStepLayout';
import useBaseYear from '@/hooks/useBaseYear';
import useContactPhone from '@/hooks/useContactPhone';

const Offline = () => {
  const navigate = useNavigate();
  const baseYear = useBaseYear() || new Date().getFullYear() + 1;
  const contact = useContactPhone();

  return (
    <>
      <Header />
      <div className="form__container container">
        <FormStepLayout>
            <Container>
              <div className="form__success text-center">
                <div className="form__success__title">
                  <h2>
                    <b>As inscrições para o acampamento de {baseYear} começarão em breve. Aguarde!</b>
                  </h2>
                </div>
                <p className="form__success__message"></p>
                <p className="form__success__contact">
                  <b>
                    Qualquer dúvida nos contate no telefone da organização do evento para mais informações.
                    {contact && (
                      <>
                        <br />
                        {contact} (WhatsApp).
                      </>
                    )}
                  </b>
                </p>
                <small className="mt-5">
                  <em>Igreja Presbiteriana de Boa Viagem</em>
                </small>
              </div>
            </Container>
        </FormStepLayout>
      </div>
      <Footer handleAdminClick={() => navigate('/admin')} />
    </>
  );
};

export default Offline;
