import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { format, isValid } from 'date-fns';
import calculateAge from '@/Pages/Packages/utils/calculateAge';
import getDiscountedProducts from '../Packages/utils/getDiscountedProducts';
import getIndividualBaseValue from '../Packages/utils/getIndividualBaseValue';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { useCart } from 'react-use-cart';
import { BASE_URL } from '@/config';
import fetcher from '@/fetchers';
import './style.scss';

const FinalReview = ({ backStep, nextStep, updateForm }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDataAuthorized, setIsDataAuthorized] = useState(false);
  const location = useLocation();
  const { emptyCart } = useCart();

  const getTempData = () => JSON.parse(sessionStorage.getItem('formTempData')) || {};

  const formValues = getTempData();

  const birthday = new Date(formValues.personalInformation?.birthday);
  const age = isValid(birthday) ? calculateAge(birthday) : 0;

  const discountedProducts = getDiscountedProducts(age);

  const handleCheckboxChange = (e) => setIsConfirmed(e.target.checked);

  const handleAuthorizationChange = (e) => {
    setIsDataAuthorized(e.target.checked);
    saveConfirmationUserData(e.target.checked);
  };

  const saveConfirmationUserData = async (authorizationValue) => {
    try {
      await fetcher.post(`${BASE_URL}/camper/confirmationUserData`, {
        cpf: formValues.personalInformation.cpf,
        authorization: authorizationValue,
      });
    } catch (error) {
      console.error('Erro ao salvar confirmação do uso dos dados do usuário:', error);
    }
  };

  const handleSaveUser = () => {
    if (!isConfirmed || !isDataAuthorized) return;
    toast.success('Usuário adicionado ao carrinho');

    updateForm();
    emptyCart();
    nextStep();
  };

  const isSuccessPathname = location.pathname === '/sucesso';

  const getProductPrice = (productId) => discountedProducts.find((p) => p.id === productId)?.price || 0;

  const accomodationPrice = getProductPrice(formValues.package.accomodation.id);
  const transportationPrice = getProductPrice(formValues.package.transportation.id);
  const foodPrice = formValues.package.food?.id ? getProductPrice(formValues.package.food.id) : 0;

  const packageOriginalPrice = accomodationPrice + transportationPrice + foodPrice;
  const extraMealsPrice = Number(formValues.extraMeals?.totalPrice || 0);
  const discountNumeric = Number(formValues.package?.discount || 0);

  const individualBase = getIndividualBaseValue(age);
  const totalBeforeDiscount = packageOriginalPrice + individualBase + extraMealsPrice;
  const finalTotal = Math.max(totalBeforeDiscount - discountNumeric, 0);

  return (
    <>
      {!isSuccessPathname && (
        <Card className="form__container__general-height">
          <Card.Body>
            <Container>
              <div className="form-review">
                <Card.Title>Revisão de Dados</Card.Title>
                <Card.Text>Revise os dados do formulário antes de submeter.</Card.Text>

                <Form>
                  <Row className="row-gap">
                    <Col md={6} className="fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">Nome:</span> <br />
                        {formValues.personalInformation.name}
                      </Card.Text>
                    </Col>

                    <Col md={6} className="fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">Gênero:</span> <br />
                        {formValues.personalInformation.gender}
                      </Card.Text>
                    </Col>
                  </Row>
                  <div className="packages-horizontal-line" />

                  <Row className="row-gap">
                    <Col md={formValues.extraMeals?.totalPrice ? 5 : 6} className={'fw-bold'}>
                      <Card.Text>
                        <span className="form-review__section-title">Pacote:</span> <br />
                        Hospedagem = {formValues.package.accomodationName}
                        <br />
                        Preço = R$ {accomodationPrice}
                        <div className="packages-horizontal-line" />
                        Transporte = {formValues.package.transportationName}
                        <br />
                        Preço = R$ {transportationPrice}
                        {!formValues.package.food.id &&
                          formValues.package.transportationName &&
                          (formValues.contact.car === true || formValues.contact.needRide) === true && (
                            <div className="packages-horizontal-line" />
                          )}
                        {formValues.package.food.id && (
                          <>
                            <div className="packages-horizontal-line" />
                            Alimentação = {formValues.package.foodName}
                            <br />
                            Preço = R$ {foodPrice}
                            {!formValues.extraMeals?.totalPrice && <div className="packages-horizontal-line" />}
                          </>
                        )}
                      </Card.Text>
                    </Col>
                    <Col md={4} className="fw-bold">
                      {formValues.extraMeals?.someFood && (
                        <Card.Text>
                          <span className="form-review__section-title">Refeição Extra:</span>
                          <br />
                          Preço = R$ {extraMealsPrice}
                          <div className="packages-horizontal-line-mobile" />
                        </Card.Text>
                      )}
                    </Col>

                    <Col
                      md={formValues.extraMeals?.totalPrice ? 3 : 6}
                      className={`fw-bold ${!formValues.package.food.id ? 'mt-3' : ''}`}
                    >
                      <Card.Text>
                        <span className="form-review__section-title">
                          Valor Total {discountNumeric > 0 ? 'com Desconto' : ''}:
                        </span>
                        <br />
                        {discountNumeric > 0 ? (
                          <>
                            <em className="text-decoration-line-through text-muted me-2">R$ {totalBeforeDiscount}</em>
                            <em className="fw-bold text-success">R$ {finalTotal}</em>
                          </>
                        ) : (
                          <em className="fw-bold">R$ {finalTotal}</em>
                        )}
                      </Card.Text>
                    </Col>
                  </Row>
                  <div className="packages-horizontal-line" />

                  {(formValues.contact.car === true || formValues.contact.needRide === true) && (
                    <>
                      <Row className="row-gap">
                        {formValues.contact.car === true && (
                          <>
                            <Col md={6} className="fw-bold">
                              <Card.Text>
                                <span className="form-review__section-title">Vai de carro e pode oferecer carona:</span>{' '}
                                <br />
                                {formValues.contact.car === true && 'Sim'}
                              </Card.Text>
                            </Col>

                            <Col md={6} className="fw-bold">
                              <Card.Text>
                                <span className="form-review__section-title">Vagas de Carona:</span> <br />
                                {formValues.contact.numberVacancies}
                              </Card.Text>
                            </Col>
                          </>
                        )}
                        {formValues.contact.needRide === true && (
                          <Col md={6} className="fw-bold">
                            <Card.Text>
                              <span className="form-review__section-title">Precisa de Carona:</span> <br />
                              {formValues.contact.needRide === true && 'Sim'}
                            </Card.Text>
                          </Col>
                        )}
                      </Row>
                      <div className="packages-horizontal-line" />
                    </>
                  )}

                  <Row className="row-gap">
                    <Col md={6} className="fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">Data de Nascimento:</span> <br />
                        {isValid(new Date(formValues.personalInformation.birthday))
                          ? format(new Date(formValues.personalInformation.birthday), 'dd/MM/yyyy')
                          : 'Data inválida'}
                      </Card.Text>
                    </Col>

                    <Col md={6} className="fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">Igreja:</span> <br />
                        {formValues.contact.church}
                      </Card.Text>
                    </Col>
                  </Row>
                  <div className="packages-horizontal-line" />

                  <Row className="row-gap">
                    <Col md={6} className="fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">CPF:</span> <br />
                        {formValues.personalInformation.cpf}
                      </Card.Text>
                    </Col>

                    <Col md={6} className="fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">RG:</span> <br />
                        {formValues.personalInformation.rg}
                      </Card.Text>
                    </Col>
                  </Row>
                  <div className="packages-horizontal-line" />

                  <Row className="row-gap">
                    <Col md={6} className="fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">Telefone: </span>
                        <br />
                        {formValues.contact.cellPhone} - Whatsapp ({formValues.contact.isWhatsApp ? 'Sim' : 'Não'})
                      </Card.Text>
                    </Col>

                    <Col md={6} className="fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">Email: </span>
                        <br />
                        {formValues.contact.email}
                      </Card.Text>
                    </Col>
                  </Row>
                  <div className="packages-horizontal-line" />

                  <Row className="row-gap">
                    <Col md={6} className="fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">Alergia: </span>
                        <br />
                        {formValues.contact.hasAllergy ? 'Sim -' : 'Não'} {formValues.contact.allergy}
                      </Card.Text>
                    </Col>

                    <Col md={6} className="fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">Acompanhantes:</span> <br />
                        {formValues.contact.hasAggregate ? 'Sim -' : 'Não'} {formValues.contact.aggregate}
                      </Card.Text>
                    </Col>
                  </Row>
                  <div className="packages-horizontal-line" />

                  {formValues.personalInformation.legalGuardianName && (
                    <>
                      <Row className="row-gap">
                        <Col md={4} className="fw-bold">
                          <Card.Text>
                            <span className="form-review__section-title">Nome Resp. Legal: </span>
                            <br />
                            {formValues.personalInformation.legalGuardianName}
                          </Card.Text>
                        </Col>

                        <Col md={4} className="fw-bold">
                          <Card.Text>
                            <span className="form-review__section-title">CPF Resp. Legal:</span> <br />
                            {formValues.personalInformation.legalGuardianCpf}
                          </Card.Text>
                        </Col>

                        <Col md={4} className="fw-bold">
                          <Card.Text>
                            <span className="form-review__section-title">Telefone Resp. Legal:</span> <br />
                            {formValues.personalInformation.legalGuardianCellPhone}
                          </Card.Text>
                        </Col>
                      </Row>
                      <div className="packages-horizontal-line" />
                    </>
                  )}

                  <Form.Group className="d-flex justify-content-center flex-column gap-2 mt-4">
                    <Form.Check
                      className="form-review__section-title fw-bold"
                      type={'checkbox'}
                      label={'Confirma que os dados foram preenchidos corretamente?'}
                      id={'confirmData'}
                      name={'hasCoupon'}
                      onChange={handleCheckboxChange}
                      checked={isConfirmed}
                    />

                    <Form.Check
                      className="form-review__section-title fw-bold"
                      type={'checkbox'}
                      label={
                        'Autorizo o armazenamento e uso de meus dados para fins do acampamento. Eles não serão utilizados para nenhuma outra finalidade.'
                      }
                      id={'authorizeData'}
                      onChange={handleAuthorizationChange}
                      checked={isDataAuthorized}
                    />
                  </Form.Group>
                </Form>
              </div>
            </Container>
          </Card.Body>

          <div className="form__container__buttons">
            <Button variant="light" onClick={backStep} size="lg">
              Voltar
            </Button>

            <Button variant="warning" onClick={handleSaveUser} size="lg" disabled={!isConfirmed || !isDataAuthorized}>
              Avançar
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

FinalReview.propTypes = {
  nextStep: PropTypes.func.isRequired,
  backStep: PropTypes.func.isRequired,
  formValues: PropTypes.shape({
    personalInformation: PropTypes.shape({
      name: PropTypes.string.isRequired,
      gender: PropTypes.string.isRequired,
      birthday: PropTypes.string.isRequired,
      cpf: PropTypes.string.isRequired,
      rg: PropTypes.string.isRequired,
    }).isRequired,
    package: PropTypes.shape({
      accomodation: PropTypes.shape({
        name: PropTypes.string.isRequired,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      }).isRequired,
      transportation: PropTypes.shape({
        name: PropTypes.string.isRequired,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      }).isRequired,
      food: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }).isRequired,
      price: PropTypes.number.isRequired,
      finalPrice: PropTypes.number.isRequired,
      discount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    contact: PropTypes.shape({
      cellPhone: PropTypes.string.isRequired,
      isWhatsApp: PropTypes.bool.isRequired,
      email: PropTypes.string.isRequired,
      hasAllergy: PropTypes.bool.isRequired,
      allergy: PropTypes.string,
      hasAggregate: PropTypes.bool.isRequired,
      aggregate: PropTypes.string,
      church: PropTypes.string.isRequired,
      car: PropTypes.bool.isRequired,
      needRide: PropTypes.bool,
      numberVacancies: PropTypes.number,
    }).isRequired,
    extraMeals: PropTypes.shape({
      totalPrice: PropTypes.number,
      someFood: PropTypes.bool,
    }),
  }),
  updateForm: PropTypes.func,
};

export default FinalReview;
