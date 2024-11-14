import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '@/config';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import ptBR from 'date-fns/locale/pt';
import { format } from 'date-fns';
import fetcher from '@/fetchers/fetcherWithCredentials';
import Loading from '@/components/Loading';
import Footer from '@/components/Footer';
import PropTypes from 'prop-types';
import Header from '@/components/Header';
import InputMask from 'react-input-mask';
import InfoButton from '../../components/InfoButton';
import { useFormik } from 'formik';
import { cpfReviewSchema } from '@/form/validations/schema';
import scrollUp from '@/hooks/useScrollUp';

const CpfReview = ({ onPersonDataFetch }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { values, errors, handleSubmit, setFieldValue } = useFormik({
    initialValues: {
      cpf: '',
      birthday: null,
    },
    validationSchema: cpfReviewSchema,
    validateOnBlur: false,
    validateOnChange: false,
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

        const response = await fetcher.post(`${BASE_URL}/camper/get-person-data`, payload);

        if (response.status === 200) {
          onPersonDataFetch(response);
          navigate('/verificacao/dados');
          toast.success('Usuário encontrado com sucesso');
        }
      } catch (error) {
        toast.error('Usuário não encontrado');
      } finally {
        setLoading(false);
      }
    },
  });

  scrollUp();

  return (
    <div className="components-container">
      <Header />
      <div className="form__container">
        <Card>
          <Card.Body>
            <Container>
              <Row className="mb-4">
                <Card.Title>Consulte Status da sua Inscrição:</Card.Title>
                <Card.Text>
                  Insira seu CPF e data de nascimento abaixo caso você deseje consultar o status da sua inscrição. Você
                  obterá os dados de inscrição como nome, pacote cadastrado e demais informações relevantes.
                </Card.Text>
              </Row>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className='mb-4'>
                    <Form.Group>
                      <Form.Label>
                        <b>CPF:</b>
                      </Form.Label>
                      <Form.Control
                        as={InputMask}
                        value={values.cpf}
                        isInvalid={errors.cpf}
                        onChange={(e) => setFieldValue('cpf', e.target.value.replace(/\D/g, ''))}
                        mask="999.999.999-99"
                        name="cpf"
                        id="cpf"
                        className="cpf-container"
                        placeholder="000.000.000-00"
                        title="Preencher CPF válido"
                      />
                      <Form.Control.Feedback type="invalid">{errors.cpf}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <b>Data de Nascimento:</b>
                      </Form.Label>
                      <Form.Control
                        as={DatePicker}
                        selected={values.birthday}
                        isInvalid={errors.birthday}
                        onChange={(date) => setFieldValue('birthday', date)}
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
                        {errors.birthday}
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
        <InfoButton />
      </div>
      <Footer onAdminClick={() => navigate('/admin')} />
    </div>
  );
};

CpfReview.propTypes = {
  onPersonDataFetch: PropTypes.func,
};

export default CpfReview;
