import { useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
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
        `Foi gerado um desconto no valor de R$ ${discount} em seu nome. O desconto já está aplicado ao valor final dos produtos.`,
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
        newPackage.accomodation = { id: item.id, name: item.name, price: item.price };
      }
      if (item.category === 'Transporte') {
        newPackage.transportation = { id: item.id, name: item.name, price: item.price };
      }
      if (item.category === 'Alimentação') {
        newPackage.food = { id: item.id, name: item.name, price: item.price };
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

  const getCategoryDiscountDescription = (category) => {
    const productsInCategory = discounted.filter((p) => p.category === category);
    const descriptions = productsInCategory
      .filter((p) => p.discountDescription && p.discountDescription.trim() !== '')
      .map((p) => `${p.discountDescription} quando opção for ${p.name}`);

    return descriptions.length > 0 ? ` ${descriptions.join(' | ')}` : '';
  };

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
    <Container className="packages-page form__container__cart-height">
      <Row>
        <Col xs={12} xl={8} className="px-0 mb-3 mb-xl-0">
          {!isRegistrationClosed ? (
            <>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Hospedagem</Card.Title>
                  <Card.Text>
                    Vamos começar a montagem do seu pacote. A escolha da hospedagem é <strong>obrigatória</strong>.
                    <em className="discount-description text-success small">
                      {getCategoryDiscountDescription('Hospedagem')}
                    </em>
                  </Card.Text>
                  <ProductList ref={productListRef} age={age} cartKey={cartKey} category="Hospedagem" />
                </Card.Body>
              </Card>

              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Transporte</Card.Title>
                  <Card.Text>
                    Temos opções para todos estilos. Vá com o grupo da igreja ou tenha liberdate total com transporte
                    próprio. A escolha do transporte é <strong>obrigatória</strong>.
                    <em className="discount-description text-success small">
                      {getCategoryDiscountDescription('Transporte')}
                    </em>
                  </Card.Text>
                  <ProductList ref={productListRef} age={age} cartKey={cartKey} category="Transporte" />
                </Card.Body>
              </Card>

              <Card className="mb-3 mb-sm-0">
                <Card.Body>
                  <Card.Title>Alimentação</Card.Title>
                  <Card.Text>
                    Você pode incluir todas as refeições ou apenas algumas.{' '}
                    <strong>Não teremos vendas de refeições avulsas</strong>.
                    <em className="discount-description text-success small">
                      {getCategoryDiscountDescription('Alimentação')}
                    </em>
                  </Card.Text>
                  <ProductList ref={productListRef} age={age} cartKey={cartKey} category="Alimentação" />
                </Card.Body>
              </Card>
            </>
          ) : (
            <div className="registration-closed-message">
              <p>
                Desculpe, as vagas para inscrições estão completas. <br />
                Para maiores dúvidas, favor contactar a secretaria da igreja.
              </p>
            </div>
          )}
        </Col>

        <Col xs={12} xl={4} className="ps-0 ps-xl-3">
          <Card>
            <Card.Body>
              <Card.Title>Resumo do Pacote</Card.Title>
              <div className="summary">
                <div className="summary__accomodation">
                  Hospedagem: <br />
                  {items.find((i) => i.category === 'Hospedagem')?.name || 'Não selecionado'}
                  <div className="packages-horizontal-line-cart"></div>
                </div>

                <div className="summary__transportation">
                  Transporte:
                  <br />
                  {items.find((i) => i.category === 'Transporte')?.name || 'Não selecionado'}
                  <div className="packages-horizontal-line-cart"></div>
                </div>

                <div className="summary__food">
                  Alimentação:
                  <br />
                  {items.find((i) => i.category === 'Alimentação')?.name || 'Não selecionado'}
                  <div className="packages-horizontal-line-cart"></div>
                </div>

                <div className="summary__individual-base">
                  <div className="d-flex align-items-center gap-1">
                    <h5 className="summary-individual-base-label">Taxa de Inscrição:</h5>
                    <Tips
                      classNameWrapper="mt-0 mb-2"
                      placement="top"
                      typeIcon="info"
                      size={15}
                      colour={'#7f7878'}
                      text="Valor da taxa de inscrição conforme a idade: até 6 anos = 0 reais, 7 a 12 anos = 100 reais, acima de 13 anos = 200 reais."
                    />
                  </div>
                  <h5 className="summary-individual-base-value"> R$ {individualBase} </h5>
                  <div className="packages-horizontal-line-cart"></div>
                </div>

                <div className="summary__discount">
                  {hasDiscount && discountNumeric > 0 && `Desconto: -R$ ${discountNumeric}`}
                  <div className="packages-horizontal-line-cart"></div>
                </div>

                <div className="summary__discount">
                  <strong>Total: R$ {finalTotal}</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <div className="form__container__buttons mt-0">
          <Button variant="light" onClick={backStep} size="lg">
            Voltar
          </Button>
          {!isRegistrationClosed && (
            <Button variant="warning" onClick={submitForm} size="lg">
              Avançar
            </Button>
          )}
        </div>
      </Row>
    </Container>
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
