import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

const CpfReview = ({ formValues }) => {
  if (!formValues || !formValues.data) {
    return (
      <>
        <p className="text-center">
          Nenhum dado relativo ao seu CPF foi encontrado. Por favor, verifique o número do seu CPF e tente novamente.
          Caso ainda não esteja inscrito, faça a sua inscrição ou procure a secretaria da IPBV para obter mais
          informações.
        </p>

        <div className="justify-content-end d-flex mt-5">
          <Button
            variant="warning"
            onClick={() => {
              window.location.reload();
            }}
            size="lg"
          >
            Voltar para Início
          </Button>
        </div>
      </>
    );
  }

  return (
    <Card className="form__container__general-height fix-positioning">
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
                    {formValues.data.name}
                  </Card.Text>
                </Col>
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Agregado:</span> <br />
                    {formValues.data.aggregate}
                  </Card.Text>
                </Col>
              </Row>{' '}
              <div className="packages-horizontal-line" />
              <Row className="row-gap">
                <Col md={6} className=" fw-bold">
                  <Card.Text className="text-success">
                    <span className="form-review__section-title"> Status de Pagamento:</span> <br />{' '}
                    <em>{formValues.data.payment}</em>
                  </Card.Text>
                </Col>
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Cadastrado em: </span>
                    <br />
                    {formValues.data.registrationDate}
                  </Card.Text>
                </Col>
              </Row>{' '}
              <div className="packages-horizontal-line" />
              <Row className="row-gap">
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Categoria do Pacote:</span> <br />
                    {formValues.data.packageTitle} <br />
                  </Card.Text>
                </Col>
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Acomodação</span>
                    <br />
                    {formValues.data.accomodation} |{' '}
                    {formValues.data.subAccomodation
                      ? formValues.data.subAccomodation !== 'Outro' && 'Externo'
                        ? formValues.data.subAccomodation.split(' ')[1]
                        : formValues.data.subAccomodation
                      : 'vazio'}
                  </Card.Text>
                </Col>
              </Row>
              <Row className="row-gap mt-3">
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Transporte: </span>
                    <br />
                    {formValues.data.transport}
                  </Card.Text>
                </Col>
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Alimentação: </span>
                    <br />
                    {formValues.data.food}
                  </Card.Text>
                </Col>
              </Row>
              <Row className="row-gap mt-3">
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Preço: </span>
                    <br />
                    R$ {formValues.data.price},00
                  </Card.Text>
                </Col>
              </Row>
            </Form>
          </div>
        </Container>
      </Card.Body>

      <div className="form__container__buttons">
        <Button
          variant="light"
          onClick={() => {
            window.location.reload();
          }}
          size="lg"
        >
          Voltar
        </Button>
      </div>
    </Card>
  );
};

export default CpfReview;
