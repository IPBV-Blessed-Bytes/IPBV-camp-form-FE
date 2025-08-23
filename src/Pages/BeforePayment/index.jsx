import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import './style.scss';
import Cart from '@/components/Global/Cart';
import Icons from '@/components/Global/Icons';
import Tips from '@/components/Global/Tips';
import calculateAge from '../Packages/utils/calculateAge';
import getDiscountedProducts from '../Packages/utils/getDiscountedProducts';
import getIndividualBaseValue from '../Packages/utils/getIndividualBaseValue';

const BeforePayment = ({
  cartKey,
  formValues,
  goToEditStep,
  goToPersonalData,
  goToSuccessPage,
  handleBasePriceChange,
  nextStep,
  sendForm,
  setBackStepFlag,
  setFormValues,
  status,
}) => {
  const [cartTotal, setCartTotal] = useState(0);
  const navigateTo = useNavigate();
  const cartIsFree = cartTotal === 0;

  useEffect(() => {
    setBackStepFlag(false);
    sessionStorage.setItem('savedUsers', JSON.stringify(formValues));
  }, []);

  useEffect(() => {
    if (status === 'loaded') {
      navigateTo('/sucesso');
    }
  }, [status, navigateTo]);

  const handleClick = () => {
    if (formValues.length === 0) return;

    if (cartIsFree) {
      sendForm(formValues);
      goToSuccessPage();
    } else {
      sessionStorage.removeItem(cartKey);
      nextStep();
    }
  };

  const getSummaryValues = (formValues) => {
    let totalBase = 0;
    let totalPackage = 0;
    let totalDiscount = 0;

    formValues.forEach((user) => {
      const age = calculateAge(new Date(user.personalInformation.birthday));
      const individualBase = getIndividualBaseValue(age);

      const discounted = getDiscountedProducts(age);
      const getPrice = (id, fallback = 0) => discounted.find((p) => p.id === id)?.price ?? fallback;

      const accomodation = getPrice(user.package?.accomodation?.id, user.package?.accomodation?.price);
      const transportation = getPrice(user.package?.transportation?.id, user.package?.transportation?.price);
      const food = getPrice(user.package?.food?.id, user.package?.food?.price);

      const extraMeals = Number(user.extraMeals?.totalPrice || 0);
      const discount = Number(user.package?.discount || 0);

      const packageTotal =
        Number(accomodation) +
        Number(transportation) +
        Number(food) +
        (user.package?.food?.id ? 0 : Number(extraMeals));

      totalBase += individualBase;
      totalPackage += packageTotal;
      totalDiscount += discount;
    });

    return {
      totalBase,
      totalPackage,
      totalDiscount,
    };
  };

  const { totalBase, totalPackage, totalDiscount } = getSummaryValues(formValues);

  return (
    <Container className="form__container__cart-height">
      <Row>
        <Col xs={12} xl={8} className="mb-2">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Carrinho</Card.Title>
              <Cart
                cartKey={cartKey}
                formValues={formValues}
                goToEditStep={goToEditStep}
                handleBasePriceChange={handleBasePriceChange}
                setCartTotal={setCartTotal}
                setFormValues={setFormValues}
              />

              <div className="text-center">
                <Button variant="outline-secondary" className="plus-camper-button" size="lg" onClick={goToPersonalData}>
                  <Icons typeIcon="plus" iconSize={30} fill={'#6c757d'} /> &nbsp;Adicionar Acampante
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} xl={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Resumo</Card.Title>
              <div className="packages-horizontal-line-cart"></div>

              <div className="summary">
                <div className="summary-individual-base">
                  <div className="d-flex align-items-center gap-1">
                    <h5 className="summary-individual-base-label">Valor Base:</h5>
                    <Tips
                      classNameWrapper="mt-0 mb-2"
                      placement="top"
                      typeIcon="info"
                      size={15}
                      colour={'#000'}
                      text="Valor base conforme a idade: até 5 anos = R$ 0, até 10 = R$ 50, acima de 10 = R$ 100"
                    />
                  </div>
                  <h5 className="summary-individual-base-value">R$ {totalBase},00</h5>
                </div>
                <div className="summary-total-package">
                  <h5 className="summary-total-package-label">Total do Pacote:</h5>
                  <h5 className="summary-total-package-value">R$ {totalPackage},00</h5>
                </div>

                {totalDiscount > 0 && (
                  <div className="summary-discount">
                    <h5 className="summary-discount-label">Desconto:</h5>
                    <h5 className="summary-discount-value">-R$ {totalDiscount},00</h5>
                  </div>
                )}

                <div className="packages-horizontal-line-cart"></div>

                <div className="summary-total-geral mb-3">
                  <h5 className="fw-bold">Total:</h5>
                  <h5 className="fw-bold">R$ {cartTotal},00</h5>
                </div>

                <div className="summary-buttons d-grid gap-3">
                  {formValues.length > 0 && (
                    <Button variant="info" size="lg" className="payment-btn" onClick={handleClick}>
                      {cartIsFree ? 'Finalizar Inscrição' : 'Pagamento'}
                    </Button>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

BeforePayment.propTypes = {
  cartKey: PropTypes.string.isRequired,
  formValues: PropTypes.array.isRequired,
  goToEditStep: PropTypes.func.isRequired,
  goToPersonalData: PropTypes.func.isRequired,
  goToSuccessPage: PropTypes.func.isRequired,
  handleBasePriceChange: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  sendForm: PropTypes.func.isRequired,
  setBackStepFlag: PropTypes.func.isRequired,
  setFormValues: PropTypes.func.isRequired,
  status: PropTypes.string,
};

export default BeforePayment;
