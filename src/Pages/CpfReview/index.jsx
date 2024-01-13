import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

const CpfReview = ({ formValues }) => {
  return (
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <div className="form-review">
            <Card.Title>Consulta de Dados</Card.Title>
            <Card.Text>Consulte seus dados de inscrição cadastrados em nosso banco de dados.</Card.Text>
            <Form>
              <Row className="row-gap">
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Nome:</span> <br />
                    {formValues.name}
                  </Card.Text>
                </Col>
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Pacote:</span> <br />
                    Nome - {formValues.packageTitle}
                    Acomodação - {formValues.accomodation} |{' '}
                    {formValues.subAccomodation !== 'Outro' && 'Externo'
                      ? formValues.subAccomodation.split(' ')[1]
                      : formValues.subAccomodation}
                    <br />
                    Transporte - {formValues.transport}
                    Alimentação - {formValues.food}
                    Preço - R$ {formValues.price},00
                  </Card.Text>
                </Col>
              </Row>{' '}
              <div className="packages-horizontal-line" />
              <Row className="row-gap">
                <Col md={4} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Cadastrado em: </span>
                    <br />
                    {formValues.registrationDate}
                  </Card.Text>
                </Col>
                <Col md={4} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title"> Status de Pagamento:</span> <br />{' '}
                    {formValues.payment}
                  </Card.Text>
                </Col>
                <Col md={4} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Agregado:</span> <br />
                    {formValues.aggregate}
                  </Card.Text>
                </Col>
              </Row>{' '}
            </Form>
          </div>
        </Container>
      </Card.Body>

      <div className="form__container__buttons">
        <Button variant="light" onClick={''} size="lg">
          Voltar
        </Button>
      </div>
    </Card>
  );
};

export default CpfReview;
