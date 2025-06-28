import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { enumSteps } from '@/utils/constants';
import './style.scss';
import Cart from '@/components/Global/Cart';
import Icons from '@/components/Global/Icons';

const BeforePayment = ({
  goToPersonalData,
  goBackToStep,
  setSavedUsers,
  savedUsers,
  goToEditStep,
  cartKey,
  discountValue,
}) => {
  const goToPayment = () => {
    goBackToStep(enumSteps.formPayment);
    sessionStorage.removeItem(cartKey);
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
                pagamento
              </Card.Text>

              <div className="d-flex flex-wrap gap-3 justify-content-center mt-4">
                <Button variant="warning" size="lg" onClick={goToPersonalData} className="cart-btn-responsive">
                  <Icons typeIcon="add-person" iconSize={30} fill="#000" /> &nbsp;Adicionar Novo Usuário
                </Button>

                {savedUsers.length > 0 && (
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
                setSavedUsers={setSavedUsers}
                savedUsers={savedUsers}
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
  goBackToStep: PropTypes.func.isRequired,
  setSavedUsers: PropTypes.func.isRequired,
  savedUsers: PropTypes.array.isRequired,
};

export default BeforePayment;
