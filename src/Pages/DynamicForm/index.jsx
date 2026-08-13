import { useMemo, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import useEventSchema from '@/hooks/useEventSchema';
import { buildValidationSchema, initialAnswers } from '@/form/dynamic/buildValidation';
import DynamicField from '@/form/dynamic/DynamicField';
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
  const { fields, sections, loading } = useEventSchema();

  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [stepIndex, setStepIndex] = useState(0);

  const initializedAnswers = useMemo(() => initialAnswers(fields), [fields]);
  const currentAnswers = Object.keys(answers).length ? answers : initializedAnswers;

  const isReview = stepIndex >= sections.length;
  const section = sections[stepIndex];

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
    setStepIndex((i) => i + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (stepIndex === 0) return;
    setStepIndex((i) => i - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    toast.info('Envio das respostas será habilitado na próxima etapa.');
  };

  if (loading) return <Loading loading />;

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
      <Header />
      <div className="form__container container">
        <Row className="justify-content-center">
          <Col lg={10} className="px-0">
            {isReview ? (
              <FormStepLayout
                title="Revisão"
                description="Confira suas respostas antes de enviar."
                onBack={goBack}
                onNext={handleSubmit}
                nextLabel="Enviar"
              >
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
