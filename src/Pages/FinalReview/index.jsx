import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const FinalReview = ({ nextStep, backStep, formValues, sendForm }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const navigateTo = useNavigate();
  const location = useLocation();

  const handleCheckboxChange = (e) => {
    setIsConfirmed(e.target.checked);
  };

  const handleClick = () => {
    if (formValues.package.price === 0) {
      sendForm();
      navigateTo('/sucesso');
    } else {
      nextStep();
    }
  };

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
                  <Row>
                    <Col md={6} className=" fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">Nome:</span> <br />
                        {formValues.personalInformation.name}
                      </Card.Text>
                    </Col>
                    <Col md={6} className=" fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">Pacote:</span> <br />
                        Nome - {formValues.package.accomodation.name}
                        <br />
                        Preço - R$ {formValues.package.price},00
                      </Card.Text>
                    </Col>
                  </Row>{' '}
                  <div className="packages-horizontal-line" />
                  <Row>
                    <Col md={6} className=" fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">Gênero:</span> <br />
                        {formValues.personalInformation.gender}
                      </Card.Text>
                    </Col>
                    <Col md={6} className=" fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title"> Data de Nascimento:</span> <br />{' '}
                        {formValues.personalInformation.birthday.toISOString().split('T')[0]}
                      </Card.Text>
                    </Col>
                  </Row>{' '}
                  <div className="packages-horizontal-line" />
                  <Row>
                    <Col md={6} className=" fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title"> CPF:</span> <br />{' '}
                        {formValues.personalInformation.cpf}
                      </Card.Text>
                    </Col>
                    <Col md={6} className=" fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">RG:</span> <br />
                        {formValues.personalInformation.rg}
                      </Card.Text>
                    </Col>
                  </Row>{' '}
                  <div className="packages-horizontal-line" />
                  <Row>
                    <Col md={6} className=" fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title"> Telefone: </span>
                        <br />
                        {formValues.contact.cellPhone} - Whatsapp ({formValues.contact.isWhatsApp ? 'Sim' : 'Não'})
                      </Card.Text>
                    </Col>
                    <Col md={6} className=" fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title"> Email: </span>
                        <br />
                        {formValues.contact.email}
                      </Card.Text>
                    </Col>
                  </Row>{' '}
                  <div className="packages-horizontal-line" />
                  <Row>
                    <Col md={6} className=" fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title">Alergia: </span>
                        <br />
                        {formValues.contact.hasAllergy ? 'Sim -' : 'Não'} {formValues.contact.allergy}
                      </Card.Text>
                    </Col>
                    <Col md={6} className=" fw-bold">
                      <Card.Text>
                        <span className="form-review__section-title"> Agregados:</span> <br />{' '}
                        {formValues.contact.hasAggregate ? 'Sim -' : 'Não'} {formValues.contact.aggregate}
                      </Card.Text>
                    </Col>
                  </Row>{' '}
                  <div className="packages-horizontal-line" />
                  <Form.Group className="d-flex justify-content-center">
                    <Form.Check
                      className="form-review__section-title fw-bold"
                      type={'checkbox'}
                      label={'Os valores de preenchimento estão corretos?'}
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
            <Button variant="warning" onClick={handleClick} size="lg" disabled={!isConfirmed}>
              CONFIRMAR
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default FinalReview;
