import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { format, isValid } from 'date-fns';
import PropTypes from 'prop-types';
import './style.scss';

const FinalReview = ({ nextStep, backStep, formValues, sendForm, status }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const navigateTo = useNavigate();
  const location = useLocation();

  const handleCheckboxChange = (e) => {
    setIsConfirmed(e.target.checked);
  };

  const handleClick = () => {
    if (formValues.package.finalPrice === 0) {
      sendForm();
    } else {
      nextStep();
    }
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
                    <Col
                      md={formValues.extraMeals.totalPrice || formValues.package.discountCoupon ? 5 : 6}
                      className={`fw-bold ${
                        !(formValues.extraMeals.totalPrice || formValues.package.discountCoupon) ? 'mb-3' : ''
                      }`}
                    >
                      <Card.Text>
                        <span className="form-review__section-title">Pacote:</span> <br />
                        Nome = {formValues.package.accomodationName} <br />
                        Acomodação = {formValues.package.subAccomodation}
                        <br />
                        Preço = R$ {formValues.package.finalPrice},00
                      </Card.Text>
                    </Col>
                    <Col md={4} className="fw-bold">
                      {(formValues.extraMeals.totalPrice || formValues.extraMeals.totalPrice !== 0) &&
                        formValues.extraMeals.someFood && (
                          <Card.Text>
                            <span className="form-review__section-title">Refeição Extra:</span>
                            <br />
                            R$ {formValues.extraMeals.totalPrice},00
                          </Card.Text>
                        )}
                      {formValues.package.discountCoupon && (
                        <Card.Text>
                          <span className="form-review__section-title">Desconto:</span>
                          <br />
                          R$ {formValues.package.discountValue},00
                        </Card.Text>
                      )}
                    </Col>
                    <Col
                      md={formValues.extraMeals.totalPrice || formValues.package.discountCoupon ? 3 : 6}
                      className="fw-bold"
                    >
                      <Card.Text>
                        <span className="form-review__section-title">Valor Total:</span>
                        <br />
                        <em>R$ {formValues.package.finalPrice + (formValues.extraMeals?.totalPrice || 0)},00</em>
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
                        <span className="form-review__section-title"> Data de Nascimento:</span> <br />
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
                        <span className="form-review__section-title"> CPF:</span> <br />
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
                        <span className="form-review__section-title"> Telefone: </span>
                        <br />
                        {formValues.contact.cellPhone} - Whatsapp ({formValues.contact.isWhatsApp ? 'Sim' : 'Não'})
                      </Card.Text>
                    </Col>
                    <Col md={6} className="fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title"> Email: </span>
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
                        <span className="form-review__section-title"> Acompanhantes:</span> <br />
                        {formValues.contact.hasAggregate ? 'Sim -' : 'Não'} {formValues.contact.aggregate}
                      </Card.Text>
                    </Col>
                  </Row>
                  <div className="packages-horizontal-line" />
                  <Form.Group className="d-flex justify-content-center">
                    <Form.Check
                      className="form-review__section-title fw-bold"
                      type={'checkbox'}
                      label={'Confirma que os dados foram preenchidos corretamente?'}
                      id={'confirmData'}
                      name={'hasCoupon'}
                      onChange={handleCheckboxChange}
                      checked={isConfirmed}
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
              onClick={handleClick}
              size="lg"
              disabled={!isConfirmed || status === 'loading' || status === 'loaded'}
              title={!isConfirmed && `Confirme acima que os dados foram preenchidos corretamente`}
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
        subAccomodation: PropTypes.string.isRequired,
      }).isRequired,
      accomodationName: PropTypes.string.isRequired,
      subAccomodation: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      finalPrice: PropTypes.number.isRequired,
      discountCoupon: PropTypes.string,
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
    }).isRequired,
  }).isRequired,
  sendForm: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
};

export default FinalReview;
