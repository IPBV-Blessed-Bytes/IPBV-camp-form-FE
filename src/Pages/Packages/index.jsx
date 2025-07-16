import { useEffect, useRef } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useCart } from 'react-use-cart';
import './style.scss';
import ProductList from '@/components/Global/ProductList';

const Packages = ({
  age,
  backStep,
  cartKey,
  currentFormIndex,
  currentFormValues,
  discount,
  hasDiscount,
  nextStep,
  totalRegistrationsGlobal,
  totalSeats,
  updateForm,
}) => {
  const productListRef = useRef();
  const { items, addItem } = useCart();

  useEffect(() => {
    const currentUser = currentFormValues;
    const cartIsEmpty = items.length === 0;

    if (cartIsEmpty && currentUser?.package) {
      const { accomodation, transportation, food } = currentUser.package;

      if (accomodation?.id) {
        addItem({ ...accomodation, category: 'Hospedagem' });
      }
      if (transportation?.id) {
        addItem({ ...transportation, category: 'Transporte' });
      }
      if (food?.id) {
        addItem({ ...food, category: 'Alimentação' });
      }
    }
  }, [currentFormValues, currentFormIndex]);

  useEffect(() => {
    if (hasDiscount) {
      toast.info(
        `Foi gerado um cupom de desconto no valor de R$ ${discount} em seu nome. O desconto já está aplicado ao valor final dos pacotes.`,
      );
    }
  }, [hasDiscount, discount]);

  const submitForm = () => {
    const isValid = productListRef.current?.checkRequiredPackages();

    if (!isValid) return;

    const newPackage = {
      accomodation: { id: '', name: '', price: '' },
      transportation: { id: '', name: '', price: '' },
      food: { id: '', name: '', price: '' },
      price: '',
      finalPrice: '',
      discount: 0,
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

    newPackage.price =
      Number(newPackage.accomodation.price || 0) +
      Number(newPackage.transportation.price || 0) +
      Number(newPackage.food.price || 0);

    const discountNumeric = Number(discount) || 0;
    newPackage.finalPrice = Math.max(newPackage.price - discountNumeric, 0);
    newPackage.discount = discountNumeric;

    updateForm(newPackage, () => {
      const foodId = newPackage.food?.id || '';
      const hasFood = foodId === 'food-complete' || foodId === 'food-external';

      const skipToReview = hasFood;
      nextStep(skipToReview);
    });
  };

  const validRegistrations = totalRegistrationsGlobal.totalValidRegistrationsGlobal;
  const isChild = age < 11;
  const isRegistrationClosed = validRegistrations >= totalSeats && !isChild;

  const accomodationPrice = items.find((item) => item.category === 'Hospedagem')?.price || 0;
  const transportationPrice = items.find((item) => item.category === 'Transporte')?.price || 0;
  const foodPrice = items.find((item) => item.category === 'Alimentação')?.price || 0;

  const totalBeforeDiscount = Number(accomodationPrice) + Number(transportationPrice) + Number(foodPrice);
  const discountNumeric = Number(discount) || 0;
  const finalTotal = Math.max(totalBeforeDiscount - discountNumeric, 0);

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

                <ProductList ref={productListRef} age={age} cartKey={cartKey} discountValue={discount} />

                <div className="d-flex flex-column align-items-center mt-4">
                  <p>
                    <strong>Soma dos Pacotes:</strong> R$ {totalBeforeDiscount.toFixed(2).replace('.', ',')}
                  </p>
                  {hasDiscount && discountNumeric > 0 && (
                    <p>
                      <strong>Desconto Aplicado:</strong> R$ {discountNumeric.toFixed(2).replace('.', ',')}
                    </p>
                  )}
                  <p className="text-success">
                    <strong>Total Final com Desconto: <em>R$ {finalTotal.toFixed(2).replace('.', ',')}</em></strong>
                  </p>
                </div>
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
  backStep: PropTypes.func.isRequired,
  age: PropTypes.number.isRequired,
  totalRegistrationsGlobal: PropTypes.object.isRequired,
  discount: PropTypes.string,
  hasDiscount: PropTypes.bool,
  totalSeats: PropTypes.string.isRequired,
  updateForm: PropTypes.func.isRequired,
  currentFormIndex: PropTypes.number.isRequired,
  currentFormValues: PropTypes.array.isRequired,
  cartKey: PropTypes.string.isRequired,
};

export default Packages;
