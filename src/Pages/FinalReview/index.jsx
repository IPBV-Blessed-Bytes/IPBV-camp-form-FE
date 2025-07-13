import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { format, isValid } from 'date-fns';
import PropTypes from 'prop-types';
import { useCart } from 'react-use-cart';
import { BASE_URL } from '@/config';
import fetcher from '@/fetchers';
import './style.scss';

const FinalReview = ({ backStep, nextStep, status, updateForm }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDataAuthorized, setIsDataAuthorized] = useState(false);
  const navigateTo = useNavigate();
  const location = useLocation();
  const { emptyCart } = useCart();

  const getTempData = () => JSON.parse(sessionStorage.getItem('formTempData')) || {};

  const formValues = getTempData();

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

    updateForm();
    emptyCart();
    nextStep();
  };

  useEffect(() => {
    if (status === 'loaded') {
      navigateTo('/sucesso');
    }
  }, [status, navigateTo]);

  const isSuccessPathname = location.pathname === '/sucesso';

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
                        Hospedagem = {formValues.package.accomodation.name}
                        <br />
                        Preço = R$ {formValues.package.accomodation.price},00
                        <div className="packages-horizontal-line" />
                        Transporte = {formValues.package.transportation.name}
                        <br />
                        Preço = R$ {formValues.package.transportation.price},00
                        {formValues.package.food.id && (
                          <>
                            <div className="packages-horizontal-line" />
                            Alimentação = {formValues.package.food.name}
                            <br />
                            Preço = R$ {formValues.package.food.price},00
                            <div className="packages-horizontal-line" />
                          </>
                        )}
                      </Card.Text>
                    </Col>
                    <Col md={4} className="fw-bold">
                      {(formValues.extraMeals?.totalPrice || formValues.extraMeals?.totalPrice !== 0) &&
                        formValues.extraMeals?.someFood && (
                          <Card.Text>
                            <span className="form-review__section-title">Refeição Extra:</span>
                            <br />
                            Preço = R$ {formValues.extraMeals?.totalPrice},00
                          </Card.Text>
                        )}
                    </Col>

                    <Col md={formValues.extraMeals?.totalPrice ? 3 : 6} className="fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">Valor Total:</span>
                        <br />
                        <em>
                          R$ {Number(formValues.package.finalPrice) + Number(formValues.extraMeals?.totalPrice || 0)},00
                        </em>
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

            <Button
              variant="warning"
              onClick={handleSaveUser}
              size="lg"
              disabled={!isConfirmed || !isDataAuthorized || status === 'loading' || status === 'loaded'}
            >
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
      }).isRequired,
      price: PropTypes.number.isRequired,
      finalPrice: PropTypes.number.isRequired,
      discountValue: PropTypes.number,
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
  }).isRequired,
  status: PropTypes.string.isRequired,
  updateForm: PropTypes.func,
};

export default FinalReview;
