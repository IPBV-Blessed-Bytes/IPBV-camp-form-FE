import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { format, isValid } from 'date-fns';

const FinalReview = ({ nextStep, backStep, formValues, sendForm, status }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const navigateTo = useNavigate();
  const location = useLocation();

  const handleCheckboxChange = (e) => {
    setIsConfirmed(e.target.checked);
  };

  const handleClick = () => {
    if (formValues.package.price === 0) {
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
                    <Col md={formValues.extraMeals.totalPrice ? 5 : 6} className="fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">Pacote:</span> <br />
                        Nome - {formValues.package.accomodation.name} <br />
                        Acomodação - {formValues.package.accomodation.subAccomodation}
                        <br />
                        Preço - R$ {formValues.package.price},00
                      </Card.Text>
                    </Col>
                    {(formValues.extraMeals.totalPrice || formValues.extraMeals.totalPrice !== 0) && (
                      <Col md={4} className="fw-bold">
                        <Card.Text>
                          <span className="form-review__section-title">Alimentação Extra:</span>
                          <br />
                          R$ {formValues.extraMeals.totalPrice},00
                        </Card.Text>
                      </Col>
                    )}
                    <Col md={formValues.extraMeals.totalPrice ? 3 : 6} className="fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">Valor Total:</span>
                        <br />
                        R$ {formValues.package.finalPrice + (formValues.extraMeals?.totalPrice || 0)},00
                      </Card.Text>
                    </Col>
                  </Row>
                  <div className="packages-horizontal-line" />
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
                        <span className="form-review__section-title"> Agregados:</span> <br />
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
              disabled={!isConfirmed}
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
      price: PropTypes.number.isRequired,
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
    }).isRequired,
    extraMeals: PropTypes.shape({
      totalPrice: PropTypes.number,
    }).isRequired,
  }).isRequired,
  sendForm: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
};

export default FinalReview;
