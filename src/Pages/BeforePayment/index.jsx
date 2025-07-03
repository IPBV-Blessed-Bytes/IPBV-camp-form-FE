import { useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { enumSteps } from '@/utils/constants';
import './style.scss';
import Cart from '@/components/Global/Cart';
import Icons from '@/components/Global/Icons';

const BeforePayment = ({
  goToPersonalData,
  goToStep,
  setFormValues,
  formValues,
  goToEditStep,
  cartKey,
  discountValue,
  nextStep,
  setBackStepFlag,
}) => {
  const goToPayment = () => {
    sessionStorage.removeItem(cartKey);
    nextStep();
  };

  useEffect(() => {
    setBackStepFlag(false);
  }, []);

  return (
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <Row className="mb-4">
            <Col>
              <Card.Title>Carrinho</Card.Title>
              <Card.Text>
                Você pode administrar seus usuários, adicionar outro usuário ou finalizar sua compra clicando em
                pagamento
              </Card.Text>

              <div className="d-flex flex-wrap gap-3 justify-content-center mt-4">
                <Button variant="warning" size="lg" onClick={goToPersonalData} className="cart-btn-responsive">
                  <Icons typeIcon="add-person" iconSize={30} fill="#000" /> &nbsp;Adicionar Novo Usuário
                </Button>

                {formValues.length > 0 && (
                  <Button variant="success" size="lg" onClick={goToPayment} className="cart-btn-responsive">
                    <Icons typeIcon="money" iconSize={30} fill="#fff" /> &nbsp;Pagamento
                  </Button>
                )}
              </div>
            </Col>
          </Row>

          <Row>
            <Col>
              <Cart
                setFormValues={setFormValues}
                formValues={formValues}
                goToEditStep={goToEditStep}
                cartKey={cartKey}
                discountValue={discountValue}
              />
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  );
};

BeforePayment.propTypes = {
  goToPersonalData: PropTypes.func.isRequired,
  goToStep: PropTypes.func.isRequired,
  setformValues: PropTypes.func.isRequired,
  formValues: PropTypes.array.isRequired,
  goToEditStep: PropTypes.func.isRequired,
  cartKey: PropTypes.string.isRequired,
  discountValue: PropTypes.string,
};

export default BeforePayment;
