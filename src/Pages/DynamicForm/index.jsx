import { useContext, useMemo, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import useEventSchema from '@/hooks/useEventSchema';
import { buildValidationSchema, initialAnswers } from '@/form/dynamic/buildValidation';
import DynamicField from '@/form/dynamic/DynamicField';
import { createSubmission } from '@/services/submissions';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';
import { useEventBranding } from '@/contexts/EventBrandingContext';
import { IDENTITY_FIELDS, buildIdentitySection } from '@/form/dynamic/identityFields';
import { eventPath } from '@/config/eventScope';
import { getApiErrorMessage } from '@/fetchers/helpers';
import Header from '@/components/Global/Header';
import Footer from '@/components/Global/Footer';
import FormStepLayout from '@/components/Global/FormStepLayout';
import Loading from '@/components/Global/Loading';
import InfoButton from '@/components/Global/InfoButton';

const collectErrors = (validationError) => {
  const errors = {};
  (validationError.inner || []).forEach((err) => {
    if (err.path && !errors[err.path]) errors[err.path] = err.message;
  });
  return errors;
};

const displayValue = (field, value) => {
  if (value == null || value === '') return '—';
  if (field.type === 'consent') return value ? 'Aceito' : '—';
  if (field.type === 'checkbox') {
    const labels = (field.options || []).filter((o) => value.includes(o.value)).map((o) => o.label);
    return labels.length ? labels.join(', ') : '—';
  }
  if (field.type === 'select' || field.type === 'radio') {
    return (field.options || []).find((o) => o.value === value)?.label || value;
  }
  return String(value);
};

const DynamicForm = () => {
  const navigate = useNavigate();
  const { fields, sections: allSections, loading } = useEventSchema();
  const { isLoggedIn } = useContext(AuthContext);
  const { paymentEnabled } = useEventBranding();

  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [stepIndex, setStepIndex] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [people, setPeople] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const adminSections = useMemo(() => allSections.filter((section) => section.fields.length > 0), [allSections]);
  const sections = useMemo(
    () => (paymentEnabled ? [buildIdentitySection(), ...adminSections] : adminSections),
    [paymentEnabled, adminSections],
  );
  const allFields = useMemo(
    () => (paymentEnabled ? [...IDENTITY_FIELDS, ...fields] : fields),
    [paymentEnabled, fields],
  );

  const initializedAnswers = useMemo(() => initialAnswers(allFields), [allFields]);
  const currentAnswers = Object.keys(answers).length ? answers : initializedAnswers;

  const isReview = stepIndex >= sections.length;
  const section = sections[stepIndex];
  const stepperSteps = useMemo(() => [...sections.map((s) => s.name), 'Revisão'], [sections]);

  const setValue = (key, value) => {
    setAnswers((prev) => ({ ...(Object.keys(prev).length ? prev : initializedAnswers), [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateSection = () => {
    try {
      buildValidationSchema(section.fields).validateSync(currentAnswers, { abortEarly: false });
      return true;
    } catch (validationError) {
      setErrors((prev) => ({ ...prev, ...collectErrors(validationError) }));
      return false;
    }
  };

  const goNext = () => {
    if (!isReview && !validateSection()) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }
    setStepIndex((i) => {
      const next = i + 1;
      setMaxStepReached((max) => Math.max(max, next));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (stepIndex === 0) return;
    setStepIndex((i) => i - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (index) => {
    if (index > maxStepReached) return;
    setStepIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateCurrentPerson = () => {
    try {
      buildValidationSchema(allFields).validateSync(currentAnswers, { abortEarly: false });
      return true;
    } catch (validationError) {
      setErrors(collectErrors(validationError));
      setStepIndex(0);
      toast.error('Preencha os campos obrigatórios antes de continuar.');
      return false;
    }
  };

  const addPerson = () => {
    if (!validateCurrentPerson()) return;
    setPeople((prev) => [...prev, currentAnswers]);
    setAnswers({});
    setErrors({});
    setStepIndex(0);
    toast.success('Pessoa adicionada. Preencha os dados da próxima.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      toast.info('Crie sua conta e confirme seu e-mail para finalizar a inscrição.');
      navigate('/entrar');
      return;
    }

    if (!validateCurrentPerson()) return;

    const registrations = [...people, currentAnswers].map((personAnswers) => ({ answers: personAnswers }));

    setSubmitting(true);
    try {
      await createSubmission({ registrations });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao enviar a inscrição.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading loading />;

  if (submitted) {
    return (
      <div className="components-container">
        <Header />
        <div className="form__container container">
          <Row className="justify-content-center">
            <Col lg={8} className="text-center my-5">
              <h2>Inscrição enviada! 🎉</h2>
              <p className="mt-3">Recebemos suas respostas com sucesso.</p>
              <button className="btn btn-teal-blue mt-3" onClick={() => navigate(eventPath('/'))}>
                Voltar ao início
              </button>
            </Col>
          </Row>
        </div>
        <Footer handleAdminClick={() => navigate('/admin')} />
      </div>
    );
  }

  if (!sections.length) {
    return (
      <div className="components-container">
        <Header />
        <div className="form__container container">
          <p className="text-center my-5">Este evento ainda não possui um formulário configurado.</p>
        </div>
        <Footer handleAdminClick={() => navigate('/admin')} />
      </div>
    );
  }

  return (
    <div className="components-container">
      <Header
        stepperSteps={stepperSteps}
        stepperCurrent={stepIndex}
        stepperMax={maxStepReached}
        onStepperSelect={goToStep}
      />
      <div className="form__container container">
        <Row className="justify-content-center">
          <Col lg={10} className="px-0">
            {isReview ? (
              <FormStepLayout
                title={people.length ? `Revisão — pessoa ${people.length + 1}` : 'Revisão'}
                description="Confira as respostas. Você pode adicionar outra pessoa ou enviar tudo."
                footer={
                  <>
                    <Button variant="light" size="lg" onClick={goBack} disabled={submitting}>
                      Voltar
                    </Button>
                    <div className="d-flex gap-2">
                      <Button variant="outline-warning" size="lg" onClick={addPerson} disabled={submitting}>
                        Adicionar pessoa
                      </Button>
                      <Button variant="warning" size="lg" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Enviando...' : `Enviar (${people.length + 1})`}
                      </Button>
                    </div>
                  </>
                }
              >
                {people.length > 0 && (
                  <p className="text-muted">
                    {people.length} pessoa(s) já adicionada(s). Abaixo, a pessoa {people.length + 1}.
                  </p>
                )}
                <div className="dynamic-form__review">
                  {sections.map((sec) => (
                    <div key={sec.name} className="mb-4">
                      <h5>{sec.name}</h5>
                      {sec.fields.map((field) => (
                        <div key={field.key} className="d-flex justify-content-between border-bottom py-2">
                          <span className="fw-bold">{field.label}</span>
                          <span>{displayValue(field, currentAnswers[field.key])}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </FormStepLayout>
            ) : (
              <FormStepLayout
                title={section.name}
                onBack={stepIndex === 0 ? undefined : goBack}
                onNext={goNext}
                nextLabel={stepIndex === sections.length - 1 ? 'Revisar' : 'Avançar'}
              >
                {section.fields.map((field) => (
                  <DynamicField
                    key={field.key}
                    field={field}
                    value={currentAnswers[field.key]}
                    onChange={(value) => setValue(field.key, value)}
                    error={errors[field.key]}
                  />
                ))}
              </FormStepLayout>
            )}
          </Col>
        </Row>
        <InfoButton />
      </div>
      <Footer handleAdminClick={() => navigate('/admin')} />
    </div>
  );
};

export default DynamicForm;
