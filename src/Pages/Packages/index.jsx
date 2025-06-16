import { useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import './style.scss';
import ProductList from '@/components/Global/ProductList';

const Packages = ({
  nextStep,
  backStep,
  age,
  totalRegistrationsGlobal,
  discountValue,
  hasDiscount,
  totalSeats,
}) => {
  useEffect(() => {
    if (hasDiscount) {
      toast.info(
        `Foi gerado um cupom de desconto no valor de R$ ${discountValue} em seu nome. O desconto já está aplicado ao valor final dos pacotes.`,
      );
    }
  }, [hasDiscount, discountValue]);

  const submitForm = () => {
    nextStep();
  };

  const validRegistrations = totalRegistrationsGlobal.totalValidRegistrationsGlobal;
  const isChild = age < 11;

  const isRegistrationClosed = validRegistrations >= totalSeats && !isChild;

  return (
    <>
      <Card className="form__container__general-height">
        <Card.Body>
          <Container>
            <Card.Title>Monte Seu Pacote</Card.Title>
            {!isRegistrationClosed && (
              <>
                <Card.Text>
                  Vamos começar a montagem do seu pacote. A escolha da hospedagem e do transporte é obrigatória. A
                  alimentação é opcional. Caso não deseje incluir todas as refeições, você poderá selecionar refeições
                  avulsas na próxima etapa, com pagamento individual.{' '}
                  <b>
                    <em>Lembrando que a seleção aqui é individual para cada usuário!</em>
                  </b>
                </Card.Text>

                <ProductList />
              </>
            )}

            {isRegistrationClosed && (
              <div className="registration-closed-message">
                <p>
                  Desculpe, as vagas para inscrições estão completas. <br />
                  Para maiores dúvidas, favor contactar a secretaria da igreja.
                </p>
              </div>
            )}
          </Container>
        </Card.Body>

        <div className="form__container__buttons">
          <Button variant="light" onClick={backStep} size="lg">
            Voltar
          </Button>
          {!isRegistrationClosed && (
            <Button variant="warning" onClick={submitForm} size="lg">
              Avançar
            </Button>
          )}
        </div>
      </Card>
    </>
  );
};

Packages.propTypes = {
  nextStep: PropTypes.func,
  backStep: PropTypes.func,
  birthDate: PropTypes.string.isRequired,
  updateForm: PropTypes.func,
  availablePackages: PropTypes.bool,
  totalRegistrationsGlobal: PropTypes.object,
  formUsername: PropTypes.string,
  age: PropTypes.number,
  discountValue: PropTypes.string,
  hasDiscount: PropTypes.bool,
  totalSeats: PropTypes.string,
  totalBusVacancies: PropTypes.string,
  totalValidWithBus: PropTypes.string,
  initialValues: PropTypes.shape({
    price: PropTypes.string,
    accomodation: PropTypes.string,
    transportation: PropTypes.string,
    food: PropTypes.string,
    title: PropTypes.string,
  }),
};

export default Packages;
