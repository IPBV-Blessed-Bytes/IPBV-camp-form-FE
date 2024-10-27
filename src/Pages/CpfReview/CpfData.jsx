import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Icons from '@/components/Icons';

const CpfData = ({ cpfValues }) => {
  const paymentMethodMapping = {
    creditCard: 'Cartão de Crédito',
    pix: 'PIX',
    ticket: 'Boleto Bancário',
  };

  const paymentMethodLabel = paymentMethodMapping[cpfValues?.data.formPayment] || 'Não Pagante';

  if (!cpfValues || !cpfValues?.data) {
    return (
      <Card className="form__container__general-height">
        <Card.Body className="align-items-center d-flex">
          <Container>
            <p className="text-center">
              <em>
                Nenhum dado relativo ao seu CPF foi encontrado. Por favor, verifique se o número do seu CPF e/ou data de
                nascimento foram inseridos corretamente e tente novamente. Caso ainda não esteja inscrito, faça a sua
                inscrição ou procure a secretaria da IPBV para obter mais informações.
              </em>
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
          </Container>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <div className="form-review">
            <Card.Title>Consulta de Dados</Card.Title>
            <Card.Text>Consulte seus dados de inscrição cadastrados em nosso banco de dados.</Card.Text>
            <Form className="mt-4">
              <Row className="row-gap">
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Nome:</span> <br />
                    {cpfValues?.data.name}
                  </Card.Text>
                </Col>
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Agregado:</span> <br />
                    {cpfValues?.data.aggregate}
                  </Card.Text>
                </Col>
              </Row>{' '}
              <div className="packages-horizontal-line" />
              <Row className="row-gap">
                <Col md={6} className=" fw-bold">
                  <Card.Text className="text-success">
                    <span className="form-review__section-title"> Status de Pagamento:</span> <br />{' '}
                    <em>{paymentMethodLabel}</em>
                  </Card.Text>
                </Col>
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Cadastrado em: </span>
                    <br />
                    {cpfValues?.data.registrationDate}
                  </Card.Text>
                </Col>
              </Row>{' '}
              <div className="packages-horizontal-line" />
              <Row className="row-gap">
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Categoria do Pacote:</span> <br />
                    {cpfValues?.data.packageTitle} <br />
                  </Card.Text>
                </Col>
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Acomodação</span>
                    <br />
                    {cpfValues?.data.accomodationName} |{' '}
                    {cpfValues?.data.subAccomodation
                      ? cpfValues?.data.subAccomodation !== 'Outra'
                        ? cpfValues?.data.subAccomodation.split(' ')[1]
                        : cpfValues?.data.subAccomodation
                      : 'vazio'}
                  </Card.Text>
                </Col>
              </Row>
              <Row className="row-gap mt-3">
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Alimentação: </span>
                    <br />
                    {cpfValues?.data.food}
                  </Card.Text>
                </Col>
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Alimentação Extra: </span>
                    <br />
                    {cpfValues?.data.extraMeals || 'Nenhuma'}
                  </Card.Text>
                </Col>
              </Row>
              <Row className="row-gap mt-3">
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Transporte: </span>
                    <br />
                    {cpfValues?.data.transportation}
                  </Card.Text>
                </Col>
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Alergia: </span>
                    <br />
                    {cpfValues?.data.allergy || 'Nenhuma'}
                  </Card.Text>
                </Col>
              </Row>
              <div className="packages-horizontal-line" />
              <Row className="row-gap mt-3">
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Tem vaga de carona:</span>
                    <br />
                    {cpfValues?.data.numberVacancies || 'Nenhuma vaga'}
                  </Card.Text>
                </Col>
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Precisa de carona:</span>
                    <br />
                    {cpfValues?.data.needRide ? 'Sim' : 'Não'}
                  </Card.Text>
                </Col>
              </Row>
              <div className="packages-horizontal-line" />
              <Row className="row-gap mt-3">
                <Col md={6} className=" fw-bold">
                  <Card.Text>
                    <span className="form-review__section-title">Preço: </span>
                    <br />
                    R$ {cpfValues?.data.price},00
                  </Card.Text>
                </Col>
              </Row>
            </Form>
          </div>
        </Container>
      </Card.Body>

      <div className="form__container__buttons">
        <Button
          variant="warning"
          onClick={() => {
            window.location.reload();
          }}
          size="lg"
        >
          <Icons typeIcon="arrow-left" iconSize={30} fill="#000" />
          &nbsp;Voltar
        </Button>
      </div>
    </Card>
  );
};

CpfData.propTypes = {
  cpfValues: PropTypes.shape({
    data: PropTypes.shape({
      name: PropTypes.string,
      aggregate: PropTypes.string,
      payment: PropTypes.string,
      registrationDate: PropTypes.string,
      packageTitle: PropTypes.string,
      accomodation: PropTypes.string,
      subAccomodation: PropTypes.string,
      transport: PropTypes.string,
      food: PropTypes.string,
      price: PropTypes.number,
    }),
  }),
};

export default CpfData;