import { useEffect, useRef } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useCart } from 'react-use-cart';
import './style.scss';
import ProductList from '@/components/Global/ProductList';
import Tips from '@/components/Global/Tips';
import getDiscountedProducts from './utils/getDiscountedProducts';
import getIndividualBaseValue from './utils/getIndividualBaseValue';

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
      // const hasFood = foodId === 'food-complete' || foodId === 'food-external';
      const hasFood = true;
      
      const skipToReview = hasFood;
      nextStep(skipToReview);
    });
  };

  const validRegistrations = totalRegistrationsGlobal.totalValidRegistrationsGlobal;
  const isChild = age < 11;
  const isRegistrationClosed = validRegistrations >= totalSeats && !isChild;

  const discounted = getDiscountedProducts(age);

  const getDiscountedPrice = (category) => {
    const item = items.find((i) => i.category === category);
    if (!item) return 0;

    const discountedItem = discounted.find((d) => d.id === item.id);
    return discountedItem?.price ?? item.price ?? 0;
  };

  const accomodationPrice = getDiscountedPrice('Hospedagem');
  const transportationPrice = getDiscountedPrice('Transporte');
  const foodPrice = getDiscountedPrice('Alimentação');

  const totalBeforeDiscount = accomodationPrice + transportationPrice + foodPrice;
  const individualBase = getIndividualBaseValue(age);
  const discountNumeric = Number(discount) || 0;
  const finalTotal = Math.max(totalBeforeDiscount + individualBase - discountNumeric, 0);

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
                  {hasDiscount && discountNumeric > 0 && (
                    <p>
                      <strong>Soma dos Pacotes:</strong> R$ {totalBeforeDiscount}
                    </p>
                  )}

                  <div className="d-flex align-items-center gap-2">
                    <p>
                      <strong> Taxa de Inscrição: </strong> R$ {individualBase}
                    </p>
                    <Tips
                      classNameWrapper="mt-0 mb-3"
                      colour={'#000'}
                      placement="top"
                      size={15}
                      text="Valor da taxa de inscrição conforme a idade: até 6 anos = 0 reais, 7 a 12 anos = 100 reais, acima de 13 anos = 200 reais."
                      typeIcon="info"
                    />
                  </div>

                  {hasDiscount && discountNumeric > 0 && (
                    <p>
                      <strong>Desconto Aplicado:</strong> R$ {discountNumeric}
                    </p>
                  )}

                  <p className="text-success">
                    <strong>
                      Total Final {hasDiscount && discountNumeric ? 'com Desconto' : ''}: <em>R$ {finalTotal}</em>
                    </strong>
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
