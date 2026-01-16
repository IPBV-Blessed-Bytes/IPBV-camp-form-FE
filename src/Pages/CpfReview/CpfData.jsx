import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './style.scss';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Header from '@/components/Global/Header';
import Footer from '@/components/Global/Footer';
import Loading from '@/components/Global/Loading';

const CpfData = ({ personData }) => {
  const [rideOffer, setRideOffer] = useState(null);
  const [rideNeed, setRideNeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const paymentMethodMapping = {
    creditCard: 'Cartão de Crédito',
    pix: 'PIX',
    ticket: 'Boleto Bancário',
  };

  scrollUp();

  const paymentMethodLabel = paymentMethodMapping[personData?.data.formPayment] || 'Não Pagante';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rideResponse = await fetcher.get('ride/offer');

        const rideOfferVacancies = rideResponse.data.find((offer) => offer.name === personData?.data.name);

        if (rideOfferVacancies) {
          setRideOffer(rideOfferVacancies);

          const relatedNeedRides = rideOfferVacancies.relationship.filter((rider) => rider.type === 'needRide');

          if (relatedNeedRides.length > 0) {
            setRideNeed(relatedNeedRides.map(({ name, cellPhone }) => ({ name, cellPhone })));
          } else {
            setRideNeed([]);
          }
        } else {
          const rideNeedVacancies = rideResponse.data.find((offer) =>
            offer.relationship.some((rider) => rider.name === personData?.data.name && rider.type === 'needRide'),
          );

          if (rideNeedVacancies) {
            setRideOffer({ name: rideNeedVacancies.name, cellPhone: rideNeedVacancies.cellPhone });
            setRideNeed([]);
          } else {
            setRideOffer(null);
            setRideNeed([]);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [personData]);

  if (!personData || !personData?.data) {
    return (
      <div className="components-container">
        <Header />
        <div className="form__container">
          <Card>
            <Card.Body className="align-items-center d-flex">
              <Container>
                <p className="text-center">
                  <em>
                    Nenhum dado relativo ao seu CPF foi encontrado. Por favor, verifique se o número do seu CPF e/ou
                    data de nascimento foram inseridos corretamente e tente novamente. Caso ainda não esteja inscrito,
                    faça a sua inscrição ou procure a secretaria da IPBV para obter mais informações.
                  </em>
                </p>

                <div className="justify-content-end d-flex mt-5">
                  <Button
                    variant="warning"
                    onClick={() => {
                      navigate('/verificacao');
                    }}
                    size="lg"
                  >
                    Voltar para Início
                  </Button>
                </div>
              </Container>
            </Card.Body>
          </Card>
        </div>
        <Footer handleAdminClick={() => navigate('/admin')} />
      </div>
    );
  }

  return (
    <div className="components-container">
      <Header />
      <div className="form__container container">
        <Row className="justify-content-center">
          <div className="px-0 col-lg-10">
            <Card>
              <Card.Body>
                <Container>
                  <div className="form-review">
                    <Card.Title>Consulta de Dados</Card.Title>
                    <Card.Text>Consulte seus dados de inscrição cadastrados em nosso banco de dados.</Card.Text>
                    <Form className="mt-4">
                      <Row className="row-gap">
                        <Col md={6} className="fw-bold">
                          <Card.Text>
                            <span className="form-review__section-title">Nome:</span> <br />
                            {personData?.data.name}
                          </Card.Text>
                        </Col>
                        <Col md={6} className="fw-bold">
                          <Card.Text>
                            <span className="form-review__section-title">Acompanhantes:</span> <br />
                            {personData?.data.aggregate}
                          </Card.Text>
                        </Col>
                      </Row>
                      <div className="packages-horizontal-line" />
                      <Row className="row-gap">
                        <Col md={6} className="fw-bold">
                          <Card.Text className="text-success">
                            <span className="form-review__section-title"> Status de Pagamento:</span> <br />
                            <em>{paymentMethodLabel}</em>
                          </Card.Text>
                        </Col>
                        <Col md={6} className="fw-bold">
                          <Card.Text>
                            <span className="form-review__section-title">Cadastrado em: </span>
                            <br />
                            {personData?.data.registrationDate}
                          </Card.Text>
                        </Col>
                      </Row>
                      <div className="packages-horizontal-line" />
                      <Row className="row-gap mt-3">
                        <Col md={6} className="fw-bold">
                          <Card.Text>
                            <span className="form-review__section-title">Preço:</span> <br />
                            R$ {personData?.data.price},00
                          </Card.Text>
                        </Col>
                        <Col md={6} className="fw-bold">
                          <Card.Text>
                            <span className="form-review__section-title">Hospedagem:</span> <br />
                            {personData?.data.accomodationName}
                          </Card.Text>
                        </Col>
                      </Row>
                      <Row className="row-gap mt-3">
                        <Col md={6} className="fw-bold">
                          <Card.Text>
                            <span className="form-review__section-title">Alimentação:</span> <br />
                            {personData?.data.food}
                          </Card.Text>
                        </Col>
                        <Col md={6} className="fw-bold">
                          <Card.Text>
                            <span className="form-review__section-title">Transporte:</span>
                            <br />
                            {personData?.data.transportation}
                          </Card.Text>
                        </Col>
                      </Row>
                      <Row className="row-gap mt-3">
                        <Col md={6} className="fw-bold">
                          <Card.Text>
                            <span className="form-review__section-title">Alergia: </span>
                            <br />
                            {personData?.data.allergy || 'Nenhuma'}
                          </Card.Text>
                        </Col>
                      </Row>
                      <div className="packages-horizontal-line" />
                      <Row className="row-gap mt-3">
                        <Col md={6} className="fw-bold">
                          <Card.Text>
                            <span className="form-review__section-title">Tem vaga de carona:</span> <br />
                            {personData?.data.numberVacancies || 'Nenhuma vaga'}
                          </Card.Text>
                        </Col>
                        <Col md={6} className="fw-bold">
                          <Card.Text>
                            <span className="form-review__section-title">Precisa de carona:</span> <br />
                            {personData?.data.needRide ? 'Sim' : 'Não'}
                          </Card.Text>
                        </Col>
                      </Row>

                      {rideNeed.length > 0 && (
                        <Row className="row-gap mt-3">
                          <Col md={12}>
                            <Card.Text className="fw-bold">
                              <span className="form-review__section-title">Vai oferecer carona para:</span>
                              <Card.Text>
                                {rideNeed.map((ride, index) => (
                                  <li key={index} className="mt-2">
                                    {ride.name} | Contato: {ride.cellPhone}
                                  </li>
                                ))}
                              </Card.Text>
                            </Card.Text>
                          </Col>
                        </Row>
                      )}

                      {rideOffer && rideNeed.length === 0 && (
                        <Row className="row-gap mt-3">
                          <Col md={12} className="fw-bold">
                            <Card.Text>
                              <span className="form-review__section-title">Vai de carona com:</span>
                              <br />
                              {rideOffer.name} | Contato: {rideOffer.cellPhone}
                            </Card.Text>
                          </Col>
                        </Row>
                      )}
                    </Form>
                  </div>
                </Container>
              </Card.Body>

              <div className="form__container__buttons">
                <Button
                  variant="warning"
                  onClick={() => {
                    navigate('/verificacao');
                  }}
                  size="lg"
                >
                  Voltar
                </Button>
              </div>
            </Card>
          </div>
        </Row>
      </div>
      <Loading loading={loading} />
      <Footer handleAdminClick={() => navigate('/admin')} />
    </div>
  );
};

CpfData.propTypes = {
  personData: PropTypes.object,
};

export default CpfData;
