import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import './style.scss';
import Cart from '@/components/Global/Cart';
import Icons from '@/components/Global/Icons';

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

  return (
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <Row className="mb-4">
            <Col>
              <Card.Title>Carrinho</Card.Title>
              <Card.Text>
                Você pode administrar seus usuários, adicionar outro usuário ou finalizar sua compra clicando em
                {cartIsFree ? ' finalizar inscrição' : ' pagamento'}.
              </Card.Text>

              <div className="d-flex flex-wrap gap-3 justify-content-center mt-4">
                <Button variant="warning" size="lg" onClick={goToPersonalData} className="cart-btn-responsive">
                  <Icons typeIcon="add-person" iconSize={30} fill="#000" /> &nbsp;Adicionar Nova Pessoa
                </Button>

                {formValues.length > 0 && (
                  <Button variant="success" size="lg" onClick={handleClick} className="cart-btn-responsive">
                    <Icons typeIcon={cartIsFree ? 'checked' : 'money'} iconSize={30} fill="#fff" /> &nbsp;
                    {cartIsFree ? 'Finalizar Inscrição' : 'Pagamento'}
                  </Button>
                )}
              </div>
            </Col>
          </Row>

          <Row>
            <Col>
              <Cart
                cartKey={cartKey}
                formValues={formValues}
                goToEditStep={goToEditStep}
                handleBasePriceChange={handleBasePriceChange}
                setCartTotal={setCartTotal}
                setFormValues={setFormValues}
              />
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
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
