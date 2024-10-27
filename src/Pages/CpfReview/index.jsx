import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '@/config';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import ptBR from 'date-fns/locale/pt';
import { format } from 'date-fns';
import fetcherWithCredentials from '@/fetchers/fetcherWithCredentials';
import Loading from '@/components/Loading';
import Footer from '@/components/Footer';
import PropTypes from 'prop-types';
import Header from '@/components/Header';
import InputMask from 'react-input-mask';
import CpfData from './CpfData';
import InfoBtn from '../Routes/InfoBtn';

const CpfReview = ({ onAdminClick }) => {
  const [loading, setLoading] = useState(false);
  const [personData, setPersonData] = useState('');
  const [showCpfData, setShowCpfData] = useState(false);
  const [displayedCpf, setDisplayedCpf] = useState('');
  const [displayedBirthday, setDisplayedBirthday] = useState('');
  const navigate = useNavigate();

  const fetchPersonData = async () => {
    setLoading(true);

    try {
      const formattedBirthday = displayedBirthday ? format(new Date(displayedBirthday), 'dd/MM/yyyy') : '';

      const payload = {
        personalInformation: {
          cpf: displayedCpf,
          birthday: formattedBirthday,
        },
      };

      const response = await fetcherWithCredentials.post(`${BASE_URL}/camper/get-person-data`, payload);

      if (response.status === 200) {
        setPersonData(response);
        setShowCpfData(true);
        toast.success('Usuário encontrado com sucesso');
      }
    } catch (error) {
      toast.error('Usuário não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleCpfChange = (event) => {
    const rawCpf = event.target.value.replace(/\D/g, '');
    setDisplayedCpf(rawCpf);
  };

  const handleDateChange = (event) => {
    const rawBirthday = event;
    setDisplayedBirthday(rawBirthday);
  };

  const parseDate = (value) => {
    if (value instanceof Date && !isNaN(value)) {
      return value;
    }

    const parsedDate = value ? parse(value, 'dd/MM/yyyy', new Date()) : null;

    return isNaN(parsedDate) ? null : parsedDate;
  };

  return (
    <div className="components-container">
      <Header />
      <div className="form__container">
        {!showCpfData && (
          <Card className="form__container__general-height">
            <Card.Body>
              <Container>
                <Row className="mb-4">
                  <Card.Title>Consulte Status da sua Inscrição:</Card.Title>
                  <Card.Text>
                    Insira seu CPF e data de nascimento abaixo caso você deseje consultar o status da sua inscrição.
                    Você obterá os dados de inscrição como nome, pacote cadastrado e demais informações relevantes.
                  </Card.Text>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <b>CPF:</b>
                      </Form.Label>
                      <Form.Control
                        as={InputMask}
                        mask="999.999.999-99"
                        value={displayedCpf}
                        onChange={handleCpfChange}
                        placeholder="000.000.000-00"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <b>Data de Nascimento:</b>
                      </Form.Label>
                      <Form.Control
                        as={DatePicker}
                        selected={parseDate(displayedBirthday)}
                        onChange={handleDateChange}
                        locale={ptBR}
                        autoComplete="off"
                        dateFormat="dd/MM/yyyy"
                        dropdownMode="select"
                        id="birthDay"
                        maxDate={new Date()}
                        name="birthDay"
                        placeholderText="dd/mm/aaaa"
                        showMonthDropdown={true}
                        showYearDropdown={true}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="justify-content-end align-items-center mt-4">
                  <Col className="justify-content-end d-flex" md={6}>
                    <Button variant="warning" onClick={fetchPersonData} size="lg">
                      Consultar
                    </Button>
                  </Col>
                </Row>

                <Loading loading={loading} />
              </Container>
            </Card.Body>
          </Card>
        )}

        <InfoBtn />

        {showCpfData && (
          <CpfData onAdminClick={onAdminClick} cpfValues={personData} loading={loading} voltar={setShowCpfData} />
        )}
      </div>
      <Footer onAdminClick={() => navigate('/admin')} />
    </div>
  );
};

CpfReview.propTypes = {
  formValues: PropTypes.shape({
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

export default CpfReview;
