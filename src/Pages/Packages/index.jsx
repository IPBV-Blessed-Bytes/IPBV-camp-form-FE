import { useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useCart } from 'react-use-cart';
import './style.scss';
import ProductList from '@/components/Global/ProductList';

const Packages = ({ backStep, age, totalRegistrationsGlobal, discountValue, hasDiscount, totalSeats, updateForm }) => {
  const { items } = useCart();

  useEffect(() => {
    if (hasDiscount) {
      toast.info(
        `Foi gerado um cupom de desconto no valor de R$ ${discountValue} em seu nome. O desconto já está aplicado ao valor final dos pacotes.`,
      );
    }
  }, [hasDiscount, discountValue]);

  const submitForm = () => {
    const newPackage = {
      accomodation: { id: '', name: '', price: '' },
      transportation: { id: '', name: '', price: '' },
      food: { id: '', name: '', price: '' },
      price: '',
      finalPrice: '',
    };

    items.forEach((item) => {
      if (item.category === 'Hospedagem') {
        newPackage.accomodation = {
          id: item.id,
          name: item.name,
          price: item.price,
        };
      }
      if (item.category === 'Transporte') {
        newPackage.transportation = {
          id: item.id,
          name: item.name,
          price: item.price,
        };
      }
      if (item.category === 'Alimentação') {
        newPackage.food = {
          id: item.id,
          name: item.name,
          price: item.price,
        };
      }
    });

    newPackage.price = newPackage.accomodation.price + newPackage.transportation.price + newPackage.food.price;

    newPackage.finalPrice = newPackage.price;

    updateForm(newPackage);
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
  backStep: PropTypes.func.isRequired,
  age: PropTypes.number.isRequired,
  totalRegistrationsGlobal: PropTypes.object.isRequired,
  discountValue: PropTypes.string,
  hasDiscount: PropTypes.bool,
  totalSeats: PropTypes.string.isRequired,
  formValues: PropTypes.object.isRequired,
  updateForm: PropTypes.func.isRequired,
};

export default Packages;
