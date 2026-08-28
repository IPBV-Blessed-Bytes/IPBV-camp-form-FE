import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './style.scss';
import { useFormState } from '@/contexts/FormStateContext';
import useAuth from '@/hooks/useAuth';
import { enumSteps } from '@/utils/constants';
import { FORM_STORAGE_KEYS } from '@/utils/formStorage';
import Cart from '@/components/Global/Cart';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import { loadProducts } from '../Packages/utils/products';
import { loadAgePriceRules } from '../Packages/utils/ageRules';
import calculateAge from '../Packages/utils/calculateAge';
import getDiscountedProducts from '../Packages/utils/getDiscountedProducts';

const BeforePayment = () => {
  const {
    cartKey,
    formValues,
    goToEditStep,
    handleAddNewUser: goToPersonalData,
    nextStep,
    sendForm,
    setBackStepFlag,
    setFormValues,
    status,
  } = useFormState();
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigateTo = useNavigate();
  const { isLoggedIn } = useAuth();
  const cartIsFree = cartTotal === 0;

  const isUserValid = (user) => {
    const hasName = user?.personalInformation?.name && user.personalInformation.name.trim() !== '';
    const hasBirthday = user?.personalInformation?.birthday && user.personalInformation.birthday.trim() !== '';
    return hasName || hasBirthday;
  };

  const validFormValues = formValues.filter(isUserValid);

  useEffect(() => {
    setBackStepFlag(false);
    sessionStorage.setItem('savedUsers', JSON.stringify(validFormValues));
  }, [validFormValues]);

  useEffect(() => {
    if (status === 'loaded') {
      navigateTo('/sucesso');
    }
  }, [status, navigateTo]);

  const handleClick = () => {
    if (validFormValues.length === 0) return;

    if (cartIsFree) {
      sendForm(validFormValues);
    } else {
      sessionStorage.removeItem(cartKey);
      nextStep();
    }
  };

  const goToLogin = () => {
    if (validFormValues.length === 0) return;
    sessionStorage.setItem(FORM_STORAGE_KEYS.savedUsers, JSON.stringify(validFormValues));
    sessionStorage.setItem(FORM_STORAGE_KEYS.resumeCheckout, String(enumSteps.beforePayment));
    navigateTo('/entrar');
  };

  const getSummaryValues = (formValuesToSummarize) => {
    let totalFinal = 0;
    const userTotals = [];

    formValuesToSummarize.forEach((user) => {
      const age = calculateAge(new Date(user.personalInformation.birthday));

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

      const appliedDiscount = Math.min(packageTotal, discount);
      const finalPrice = packageTotal - appliedDiscount;

      totalFinal += finalPrice;
      userTotals.push({ name: user.personalInformation?.name?.trim() || 'Acampante', total: finalPrice });
    });

    return { totalFinal, userTotals };
  };

  useEffect(() => {
    if (!validFormValues || validFormValues.length === 0) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        await loadProducts();
        await loadAgePriceRules();
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [validFormValues]);

  const { totalFinal, userTotals } = getSummaryValues(validFormValues);

  const totalGeral = totalFinal;

  return (
    <Container className="form__container__cart-height">
      <Row>
        <Col xs={12} xl={8} className="mb-2 px-0 px-lg-2">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Carrinho</Card.Title>
              <Cart
                cartKey={cartKey}
                formValues={validFormValues}
                goToEditStep={goToEditStep}
                setCartTotal={setCartTotal}
                setFormValues={setFormValues}
              />

              <div className="text-center">
                <Button variant="outline-secondary" className="plus-camper-button" size="lg" onClick={goToPersonalData}>
                  <Icons typeIcon="plus" iconSize={25} fill={'#6c757d'} /> &nbsp;Adicionar Acampante
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} xl={4} className="px-0 px-lg-2">
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Resumo</Card.Title>
              <div className="packages-horizontal-line-cart"></div>

              <div className="summary">
                {userTotals.map((camper, index) => (
                  <div className="summary-total-package" key={index}>
                    <h5 className="summary-total-package-label">{camper.name}:</h5>
                    <h5 className="summary-total-package-value">R$ {camper.total},00</h5>
                  </div>
                ))}

                <div className="packages-horizontal-line-cart"></div>

                <div className="summary-total-geral mb-3">
                  <h5 className="fw-bold">Total:</h5>
                  <h5 className="fw-bold">R$ {totalGeral},00</h5>
                </div>

                <div className="summary-buttons d-grid gap-3">
                  {validFormValues.length > 0 && (
                    <Button variant="teal-blue" size="lg" onClick={isLoggedIn ? handleClick : goToLogin}>
                      {isLoggedIn ? (cartIsFree ? 'Finalizar Inscrição' : 'Pagamento') : 'Fazer login para continuar'}
                    </Button>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Loading loading={loading} />
    </Container>
  );
};

export default BeforePayment;
