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
    <Container fluid className="form__container__cart-height ">
      <Row>
        <Col md={8}>
          <Card className="mb-4 h-100">
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
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4 h-100">
            <Card.Body>
              <Card.Title>Resumo</Card.Title>
              <div className="packages-horizontal-line-cart"></div>

              <div className="summary">
                <div className="summary-individual-base">
                  <h5 className="summary-individual-base-label">Valor Base Individual:</h5>
                  <h5 className="summary-individual-base-value">R$,00</h5>
                </div>
                <div className="summary-total-package">
                  <h5 className="summary-total-package-label">Total do Pacote</h5>
                  <h5 className="summary-total-package-value">R$,00</h5>
                </div>
                <div className="summary-discount">
                  <h5 className="summary-discount-label">Desconto:</h5>
                  <h5 className="summary-discount-value">R$,00</h5>
                </div>

                <div className="packages-horizontal-line-cart"></div>

                <div className="summary-total-geral mb-3 fw-bold">
                  <h5>Total:</h5>
                  <h5>R$ {cartTotal}</h5>
                </div>

                <div className="summary-buttons d-grid gap-3">
                  <Button variant="warning" size="lg" onClick={goToPersonalData}>
                    <Icons typeIcon="add-person" iconSize={30} fill="#000" /> &nbsp;Adicionar Nova Pessoa
                  </Button>

                  {formValues.length > 0 && (
                    <Button variant="success" size="lg" onClick={handleClick}>
                      <Icons typeIcon={cartIsFree ? 'checked' : 'money'} iconSize={30} fill="#fff" /> &nbsp;
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
