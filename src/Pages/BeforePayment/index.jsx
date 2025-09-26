import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import './style.scss';
import fetcher from '@/fetchers';
import Cart from '@/components/Global/Cart';
import Icons from '@/components/Global/Icons';
import Tips from '@/components/Global/Tips';
import Loading from '@/components/Global/Loading';
import { loadProducts } from '../Packages/utils/products';
import calculateAge from '../Packages/utils/calculateAge';
import getDiscountedProducts from '../Packages/utils/getDiscountedProducts';

const BeforePayment = ({
  cartKey,
  formValues,
  goToEditStep,
  goToPersonalData,
  handleBasePriceChange,
  nextStep,
  sendForm,
  setBackStepFlag,
  setFormValues,
  status,
}) => {
  const [cartTotal, setCartTotal] = useState(0);
  const [individualBase, setIndividualBase] = useState(0);
  const [rawFee, setRawFee] = useState(0);
  const [loading, setLoading] = useState(true);
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
    } else {
      sessionStorage.removeItem(cartKey);
      nextStep();
    }
  };

  const getSummaryValues = (formValues, rawFee) => {
    let totalPackage = 0;
    let totalDiscount = 0;
    let totalFinal = 0;

    formValues.forEach((user) => {
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

      let fee = rawFee;
      if (age <= 8) fee = 0;
      else if (age <= 14) fee = rawFee / 2;

      const userTotalWithFee = packageTotal + fee;

      const appliedDiscount = Math.min(userTotalWithFee, discount);
      const finalPrice = userTotalWithFee - appliedDiscount;

      totalPackage += packageTotal;
      totalDiscount += appliedDiscount;
      totalFinal += finalPrice;
    });

    return { totalPackage, totalDiscount, totalFinal };
  };

  useEffect(() => {
    if (!formValues || formValues.length === 0) return;

    const fetchLotsAndProducts = async () => {
      try {
        await loadProducts();
        const response = await fetcher.get('lots');
        const lots = response.data.lots || [];

        if (lots.length > 0) {
          const lot = lots[0];
          const rawFee = Number(lot.price.registrationFee || 0);
          setRawFee(rawFee);

          const totalFee = formValues.reduce((sum, user) => {
            const age = calculateAge(new Date(user.personalInformation.birthday));
            let fee = rawFee;
            if (age <= 8) fee = 0;
            else if (age <= 14) fee = fee / 2;
            return sum + fee;
          }, 0);

          setIndividualBase(totalFee);
        }
      } catch (error) {
        console.error('Erro ao buscar lotes:', error);
        setIndividualBase(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLotsAndProducts();
  }, [formValues]);

  const { totalPackage, totalDiscount, totalFinal } = getSummaryValues(formValues, rawFee);

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
                formValues={formValues}
                goToEditStep={goToEditStep}
                handleBasePriceChange={handleBasePriceChange}
                setCartTotal={setCartTotal}
                setFormValues={setFormValues}
                rawFee={rawFee}
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
                <div className="summary-individual-base">
                  <div className="d-flex align-items-center gap-1">
                    <h5 className="summary-individual-base-label">Taxa de Inscrição:</h5>
                    <Tips
                      classNameWrapper="mt-0 mb-2"
                      placement="top"
                      typeIcon="info"
                      size={15}
                      color={'#7f7878'}
                      text="Valor da taxa de inscrição conforme a idade: até 8 anos = 0 reais, 9 a 14 anos = 80 reais, acima de 15 anos = 160 reais"
                    />
                  </div>
                  <h5 className="summary-individual-base-value">R$ {individualBase},00</h5>
                </div>
                <div className="summary-total-package">
                  <h5 className="summary-total-package-label">Total do Pacote:</h5>
                  <h5 className="summary-total-package-value">R$ {totalPackage},00</h5>
                </div>

                {totalDiscount > 0 && (
                  <div className="summary-discount">
                    <div className="d-flex align-items-center gap-1">
                      <h5 className="summary-discount-label">Desconto:</h5>
                      <Tips
                        classNameWrapper="mt-0 mb-2"
                        placement="top"
                        typeIcon="info"
                        size={15}
                        color={'#7f7878'}
                        text="Valor de desconto aplicado diretamente ao CPF do acampante, mesmo que haja mais de um usuário no carrinho."
                      />
                    </div>
                    <h5 className="summary-discount-value">-R$ {totalDiscount},00</h5>
                  </div>
                )}

                <div className="packages-horizontal-line-cart"></div>

                <div className="summary-total-geral mb-3">
                  <h5 className="fw-bold">Total:</h5>
                  <h5 className="fw-bold">R$ {totalGeral},00</h5>
                </div>

                <div className="summary-buttons d-grid gap-3">
                  {formValues.length > 0 && (
                    <Button variant="info" size="lg" onClick={handleClick}>
                      {cartIsFree ? 'Finalizar Inscrição' : 'Pagamento'}
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
