import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './style.scss';
import Header from '@/components/Global/Header';
import Footer from '@/components/Global/Footer';
import FormStepLayout from '@/components/Global/FormStepLayout';
import useBaseYear from '@/hooks/useBaseYear';
import useContactPhone from '@/hooks/useContactPhone';

const NEW_SYSTEM_URL = 'https://stroly.com.br/e/acampamento-ipbv';

const Offline = () => {
  const navigate = useNavigate();
  const baseYear = useBaseYear() || new Date().getFullYear() + 1;
  const contact = useContactPhone();

  return (
    <>
      <Header showLogin={false} />
      <div className="form__container container">
        <FormStepLayout>
            <Container>
              <div className="form__success text-center">
                <div className="form__success__title">
                  <h2>
                    <b>As inscrições para o acampamento de {baseYear} agora são no nosso novo sistema!</b>
                  </h2>
                </div>
                <p className="form__success__message">
                  Mudamos a plataforma de inscrições. Clique no botão abaixo para acessar o novo sistema e garantir a sua
                  vaga.
                </p>
                <Button
                  size="lg"
                  className="mt-3"
                  href={NEW_SYSTEM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ir para o novo sistema de inscrições
                </Button>
                <p className="form__success__contact mt-4">
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
