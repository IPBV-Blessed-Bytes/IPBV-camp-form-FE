import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { Container, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { formFeedbackSchema } from '@/form/validations/schema';
import { toast } from 'react-toastify';
import fetcher from '@/fetchers/fetcherWithCredentials';
import useScrollUp from '@/hooks/useScrollUp';
import './style.scss';
import InfoButton from '@/components/Global/InfoButton';
import Header from '@/components/Global/Header';
import Footer from '@/components/Global/Footer';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';

const Feedback = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useScrollUp();

  const { values, errors, touched, handleSubmit, handleChange, validateForm, setTouched } = useFormik({
    initialValues: {
      name: '',
      organization: '',
      experience: '',
      meals: '',
      schedule: '',
      structure: '',
      reception: '',
      probability: '',
      share: '',
    },
    validationSchema: formFeedbackSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        await fetcher.post('feedback', values);
        toast.success('Opinião enviada com sucesso. Agradecemos sua participação!');
        resetForm();
      } catch (error) {
        toast.error('Erro ao tentar enviar sua opinião, tente novamente mais tarde!');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleButtonClick = async () => {
    const errors = await validateForm();
    const hasErrors = Object.keys(errors).length > 0;

    if (hasErrors) {
      toast.error('Por favor, preencha todos os campos obrigatórios!');

      setTouched(
        Object.keys(errors).reduce((acc, field) => {
          acc[field] = true;
          return acc;
        }, {}),
      );
    } else {
      handleSubmit();
    }
  };

  return (
    <div className="components-container">
      <Header />
      <div className="form__container">
        <Card>
          <Card.Body>
            <Container>
              <Row className="mb-4">
                <Card.Title>Nos Envie sua Opinião:</Card.Title>
                <Card.Text>
                  Envie-nos sua opinião sobre diversos aspectos importantes para o andamento do nosso acampamento. Com
                  esses dados, poderemos melhorar em áreas específicas e fazer ajustes necessários, na medida do
                  possível. Se desejar, deixe o campo de nome em branco para enviar a opinião anonimamente.
                </Card.Text>
                <Card.Text>
                  <em>
                    <b>
                      Todos os campos marcados com <span className="required-field">*</span> devem ser obrigatoriamente
                      preenchidos!
                    </b>
                  </em>
                </Card.Text>
              </Row>
              <Form onSubmit={(e) => e.preventDefault()}>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="2">
                    <b>Nome:</b>
                  </Form.Label>
                  <Col sm="10">
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Nome completo (Opcional)"
                      value={values.name}
                      onChange={handleChange}
                    />
                  </Col>
                </Form.Group>
                <hr className="horizontal-line" />
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="6">
                    <b>
                      Como você avaliaria a organização geral do acampamento?
                      <span className="required-field"> *</span>
                    </b>
                    {touched.organization && errors.organization && (
                      <>
                        <div className="invalid-feedback d-block">
                          {errors.organization}&nbsp;
                          <Icons className="ml-3" typeIcon="warn" iconSize={25} fill="#c92432" />
                        </div>
                      </>
                    )}
                  </Form.Label>
                  <Col sm="6">
                    {['Excelente', 'Boa', 'Regular', 'Precisa melhorar', 'Não quero opinar'].map((option, index) => (
                      <Form.Check
                        key={option}
                        type="radio"
                        label={option}
                        name="organization"
                        id={`organization-${index}`}
                        value={option}
                        checked={values.organization === option}
                        onChange={handleChange}
                        isInvalid={touched.organization && errors.organization}
                      />
                    ))}
                  </Col>
                </Form.Group>
                <hr className="horizontal-line" />
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="6">
                    <b>
                      Como foi a sua experiência com o processo de inscrição?
                      <span className="required-field"> *</span>
                    </b>
                    {touched.experience && errors.experience && (
                      <div className="invalid-feedback d-block">
                        {errors.experience}&nbsp;
                        <Icons className="ml-3" typeIcon="warn" iconSize={25} fill="#c92432" />
                      </div>
                    )}
                  </Form.Label>
                  <Col sm="6">
                    {['Muito fácil', 'Fácil', 'Um pouco difícil', 'Difícil', 'Não quero opinar'].map(
                      (option, index) => (
                        <Form.Check
                          key={option}
                          type="radio"
                          label={option}
                          id={`experience-${index}`}
                          name="experience"
                          value={option}
                          checked={values.experience === option}
                          onChange={handleChange}
                          isInvalid={touched.experience && errors.experience}
                        />
                      ),
                    )}
                  </Col>
                </Form.Group>
                <hr className="horizontal-line" />
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="6">
                    <b>
                      Como foi a qualidade das refeições oferecidas no acampamento?
                      <span className="required-field"> *</span>
                    </b>
                    {touched.meals && errors.meals && (
                      <div className="invalid-feedback d-block">
                        {errors.meals}&nbsp;
                        <Icons className="ml-3" typeIcon="warn" iconSize={25} fill="#c92432" />
                      </div>
                    )}
                  </Form.Label>
                  <Col sm="6">
                    {['Excelente', 'Boa', 'Regular', 'Ruim', 'Não quero opinar'].map((option, index) => (
                      <Form.Check
                        key={option}
                        type="radio"
                        label={option}
                        id={`meals-${index}`}
                        name="meals"
                        value={option}
                        checked={values.meals === option}
                        onChange={handleChange}
                        isInvalid={touched.meals && errors.meals}
                      />
                    ))}
                  </Col>
                </Form.Group>
                <hr className="horizontal-line" />
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="6">
                    <b>
                      A programação de atividades foi adequada?<span className="required-field"> *</span>
                    </b>
                    {touched.schedule && errors.schedule && (
                      <div className="invalid-feedback d-block">
                        {errors.schedule}&nbsp;
                        <Icons className="ml-3" typeIcon="warn" iconSize={25} fill="#c92432" />
                      </div>
                    )}
                  </Form.Label>
                  <Col sm="6">
                    {[
                      'Muito boa e diversificada',
                      'Boa',
                      'Poderia ter mais variedade',
                      'Não gostei das atividades',
                      'Não quero opinar',
                    ].map((option, index) => (
                      <Form.Check
                        key={option}
                        type="radio"
                        label={option}
                        id={`schedule-${index}`}
                        name="schedule"
                        value={option}
                        checked={values.schedule === option}
                        onChange={handleChange}
                        isInvalid={touched.schedule && errors.schedule}
                      />
                    ))}
                  </Col>
                </Form.Group>
                <hr className="horizontal-line" />
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="6">
                    <b>
                      A estrutura e acomodações do acampamento atenderam suas expectativas?
                      <span className="required-field"> *</span>
                    </b>
                    {touched.structure && errors.structure && (
                      <div className="invalid-feedback d-block">
                        {errors.structure}&nbsp;
                        <Icons className="ml-3" typeIcon="warn" iconSize={25} fill="#c92432" />
                      </div>
                    )}
                  </Form.Label>
                  <Col sm="6">
                    {[
                      'Sim, completamente',
                      'Sim, em parte',
                      'Não, poderiam melhorar',
                      'Não, fiquei insatisfeito(a)',
                      'Não quero opinar',
                    ].map((option, index) => (
                      <Form.Check
                        key={option}
                        type="radio"
                        label={option}
                        id={`structure-${index}`}
                        name="structure"
                        value={option}
                        checked={values.structure === option}
                        onChange={handleChange}
                        isInvalid={touched.structure && errors.structure}
                      />
                    ))}
                  </Col>
                </Form.Group>
                <hr className="horizontal-line" />
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="6">
                    <b>
                      Você se sentiu acolhido e integrado durante o período de acampamento?
                      <span className="required-field"> *</span>
                    </b>
                    {touched.reception && errors.reception && (
                      <div className="invalid-feedback d-block">
                        {errors.reception}&nbsp;
                        <Icons className="ml-3" typeIcon="warn" iconSize={25} fill="#c92432" />
                      </div>
                    )}
                  </Form.Label>
                  <Col sm="6">
                    {[
                      'Sim, completamente',
                      'Sim, em parte',
                      'Não muito',
                      'Não, me senti excluído(a)',
                      'Não quero opinar',
                    ].map((option, index) => (
                      <Form.Check
                        key={option}
                        type="radio"
                        label={option}
                        id={`reception-${index}`}
                        name="reception"
                        value={option}
                        checked={values.reception === option}
                        onChange={handleChange}
                        isInvalid={touched.reception && errors.reception}
                      />
                    ))}
                  </Col>
                </Form.Group>
                <hr className="horizontal-line" />
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="6">
                    <b>
                      Qual é a probabilidade de você participar acampamento de 2026?
                      <span className="required-field"> *</span>
                    </b>
                    {touched.probability && errors.probability && (
                      <div className="invalid-feedback d-block">
                        {errors.probability}&nbsp;
                        <Icons className="ml-3" typeIcon="warn" iconSize={25} fill="#c92432" />
                      </div>
                    )}
                  </Form.Label>
                  <Col sm="6">
                    {['Muito provável', 'Provável', 'Pouco provável', 'Improvável', 'Não quero opinar'].map(
                      (option, index) => (
                        <Form.Check
                          key={option}
                          type="radio"
                          label={option}
                          id={`probability-${index}`}
                          name="probability"
                          value={option}
                          checked={values.probability === option}
                          onChange={handleChange}
                          isInvalid={touched.probability && errors.probability}
                        />
                      ),
                    )}
                  </Col>
                </Form.Group>
                <hr className="horizontal-line" />
                <Form.Group className="mb-3">
                  <Form.Label>
                    <b>
                      Você gostaria de compartilhar algo sobre sua experiência ou sugerir melhorias para o próximo
                      acampamento? Se sim, escreva no campo abaixo:
                    </b>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="share"
                    value={values.share}
                    onChange={handleChange}
                    placeholder="(Opcional)"
                  />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button variant="success" onClick={handleButtonClick} disabled={loading}>
                    Enviar Opinião
                  </Button>
                </div>
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

export default Feedback;
