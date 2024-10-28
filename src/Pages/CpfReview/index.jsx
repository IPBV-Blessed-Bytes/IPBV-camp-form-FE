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
import InfoButton from '../../components/InfoButton';
import { useFormik } from 'formik';
import { cpfReviewSchema } from '@/form/validations/schema';

const CpfReview = ({ onAdminClick }) => {
  const [loading, setLoading] = useState(false);
  const [personData, setPersonData] = useState('');
  const [showCpfData, setShowCpfData] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      cpf: '',
      birthday: null,
    },
    validationSchema: cpfReviewSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const formattedBirthday = values.birthday ? format(new Date(values.birthday), 'dd/MM/yyyy') : '';

        const payload = {
          personalInformation: {
            cpf: values.cpf,
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
    },
  });

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
                <Form onSubmit={formik.handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          <b>CPF:</b>
                        </Form.Label>
                        <Form.Control
                          as={InputMask}
                          isInvalid={formik.errors.cpf}
                          mask="999.999.999-99"
                          name="cpf"
                          id="cpf"
                          className="cpf-container"
                          value={formik.values.cpf}
                          onChange={(e) => formik.setFieldValue('cpf', e.target.value.replace(/\D/g, ''))}
                          placeholder="000.000000-00"
                          title="Preencher CPF válido"
                        />
                        <Form.Control.Feedback type="invalid">{formik.errors.cpf}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          <b>Data de Nascimento:</b>
                        </Form.Label>
                        <Form.Control
                          selected={formik.values.birthday}
                          onChange={(date) => formik.setFieldValue('birthday', date)}
                          isInvalid={formik.errors.birthday}
                          as={DatePicker}
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
                        <Form.Control.Feedback style={{ display: 'block' }} type="invalid">
                          {formik.errors.birthday}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="justify-content-end align-items-center mt-4">
                    <Col className="justify-content-end d-flex" md={6}>
                      <Button type="submit" variant="warning" size="lg">
                        Consultar
                      </Button>
                    </Col>
                  </Row>
                </Form>
                <Loading loading={loading} />
              </Container>
            </Card.Body>
          </Card>
        )}

        <InfoButton />

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
