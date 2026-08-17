import { useContext, useMemo, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';

import useEventSchema from '@/hooks/useEventSchema';
import { buildValidationSchema, initialAnswers } from '@/form/dynamic/buildValidation';
import DynamicField from '@/form/dynamic/DynamicField';
import PackageStep from '@/form/dynamic/PackageStep';
import { computeAge, packageTotal, formatPrice, productPrice } from '@/form/dynamic/packagePricing';
import { createSubmission } from '@/services/submissions';
import { createGenericCheckout } from '@/services/checkout';
import { getPublicHomeInfo } from '@/services/homeInfo';
import { getProducts } from '@/services/products';
import { getLots } from '@/services/lots';
import { listPackageCategories } from '@/services/packageCategories';
import { listAgePriceRules } from '@/services/agePriceRules';
import { findActiveLot } from '@/utils/activeLot';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';
import { useEventBranding } from '@/contexts/EventBrandingContext';
import { getEventSlug } from '@/config/eventScope';
import { getApiErrorMessage } from '@/fetchers/helpers';
import Header from '@/components/Global/Header';
import Footer from '@/components/Global/Footer';
import FormStepLayout from '@/components/Global/FormStepLayout';
import Loading from '@/components/Global/Loading';
import InfoButton from '@/components/Global/InfoButton';
import Icons from '@/components/Global/Icons';
import '@/Pages/Home/style.scss';

const STROKE_ICONS = ['roles', 'phone', 'visible-password'];
const iconColorProps = (icon, color) =>
  STROKE_ICONS.includes(icon) ? { stroke: color, fill: 'none' } : { fill: color };

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
  const { color: eventColor, paymentEnabled } = useEventBranding();
  const iconColor = eventColor || '#007185';

  const slug = getEventSlug();
  const { data: packageCategories = [] } = useQuery({
    queryKey: ['pkg-categories', slug],
    queryFn: listPackageCategories,
    enabled: Boolean(paymentEnabled),
  });
  const { data: packageProductsData } = useQuery({
    queryKey: ['pkg-products', slug],
    queryFn: getProducts,
    enabled: Boolean(paymentEnabled),
  });
  const { data: ageRules = [] } = useQuery({
    queryKey: ['pkg-age-rules', slug],
    queryFn: listAgePriceRules,
    enabled: Boolean(paymentEnabled),
  });
  const packageProducts = useMemo(() => packageProductsData?.products || [], [packageProductsData]);
  const { data: lotsData } = useQuery({
    queryKey: ['pkg-lots', slug],
    queryFn: getLots,
    enabled: Boolean(paymentEnabled),
  });
  const activeLotName = useMemo(() => findActiveLot(lotsData?.lots || [])?.name || '', [lotsData]);

  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [stepIndex, setStepIndex] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [people, setPeople] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  const { data: homeInfo } = useQuery({
    queryKey: ['home-info', getEventSlug()],
    queryFn: getPublicHomeInfo,
    staleTime: 5 * 60 * 1000,
  });

  const hasHomeInfo = useMemo(() => {
    const top = homeInfo?.top || {};
    const topFilled = Object.values(top).some((value) => value && String(value).trim());
    return topFilled || (homeInfo?.bottom?.length || 0) > 0;
  }, [homeInfo]);

  const sections = useMemo(() => allSections.filter((section) => section.fields.length > 0), [allSections]);

  const initializedAnswers = useMemo(() => initialAnswers(fields), [fields]);
  const currentAnswers = Object.keys(answers).length ? answers : initializedAnswers;

  const age = useMemo(() => computeAge(currentAnswers.nascimento), [currentAnswers.nascimento]);

  const wizardSteps = useMemo(() => {
    const steps = sections.map((s) => ({ kind: 'section', section: s }));
    if (paymentEnabled) steps.push({ kind: 'package' });
    steps.push({ kind: 'review' });
    if (paymentEnabled) {
      steps.push({ kind: 'cart' });
      steps.push({ kind: 'payment' });
    }
    return steps;
  }, [sections, paymentEnabled]);

  const currentStep = wizardSteps[stepIndex];
  const isReview = currentStep?.kind === 'review';
  const stepLabel = (st) =>
    ({ section: st.section?.name, package: 'Pacote', review: 'Revisão', cart: 'Carrinho', payment: 'Pagamento' })[
      st.kind
    ];
  const stepperSteps = useMemo(() => wizardSteps.map(stepLabel), [wizardSteps]);

  const allPeople = useMemo(() => [...people, currentAnswers], [people, currentAnswers]);
  const grandTotal = useMemo(
    () =>
      allPeople.reduce(
        (sum, person) =>
          sum + packageTotal(person.__package, packageProducts, ageRules, computeAge(person.nascimento)),
        0,
      ),
    [allPeople, packageProducts, ageRules],
  );

  const setValue = (key, value) => {
    setAnswers((prev) => ({ ...(Object.keys(prev).length ? prev : initializedAnswers), [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateStep = () => {
    if (currentStep.kind === 'section') {
      try {
        buildValidationSchema(currentStep.section.fields).validateSync(currentAnswers, { abortEarly: false });
        return true;
      } catch (validationError) {
        setErrors((prev) => ({ ...prev, ...collectErrors(validationError) }));
        toast.error('Preencha os campos obrigatórios.');
        return false;
      }
    }
    if (currentStep.kind === 'package') {
      const selection = currentAnswers.__package || {};
      const missing = packageCategories.filter((c) => c.required && !(selection[c.id]?.length));
      if (missing.length) {
        toast.error(`Escolha uma opção em: ${missing.map((m) => m.name).join(', ')}`);
        return false;
      }
      return true;
    }
    return true;
  };

  const goNext = () => {
    if (!isReview && !validateStep()) return;
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
      buildValidationSchema(fields).validateSync(currentAnswers, { abortEarly: false });
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

  const handlePayment = async () => {
    if (!isLoggedIn) {
      toast.info('Crie sua conta e confirme seu e-mail para finalizar a inscrição.');
      navigate('/entrar');
      return;
    }

    if (!validateCurrentPerson()) return;

    const registrations = allPeople.map((personAnswers) => ({ answers: personAnswers }));

    setSubmitting(true);
    try {
      const { payment_url: paymentUrl } = await createGenericCheckout({ registrations });
      if (!paymentUrl) {
        toast.error('Não foi possível gerar o pagamento. Tente novamente.');
        return;
      }
      window.location.href = paymentUrl;
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Erro ao gerar o pagamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setSubmitted(false);
    setAnswers({});
    setErrors({});
    setStepIndex(0);
    setMaxStepReached(0);
    setPeople([]);
    setIntroDone(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              <button className="btn btn-teal-blue mt-3" onClick={restart}>
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

  if (hasHomeInfo && !introDone) {
    const top = homeInfo?.top || {};
    return (
      <div className="components-container">
        <Header />
        <div className="form__container container">
          <Row className="justify-content-center">
            <Col lg={10} className="px-0">
              <FormStepLayout onNext={() => setIntroDone(true)}>
                <Container>
                  <Row className="text-center">
                    <Col>
                      <h4 className="mb-3">
                        <b>{top.title}</b>
                      </h4>
                      <h5>
                        <b className="home-page-subtitle">{top.subtitle}</b>
                      </h5>
                      <h5 className="info-home-text mb-2">
                        <span className="info-home-enphasis">
                          {top.locationAndDate && (
                            <span className="d-flex gap-3 mb-3 align-items-center justify-content-center">
                              <Icons className="flex-shrink-0" typeIcon="calendar" iconSize={30} fill={iconColor} />
                              {top.locationAndDate}
                            </span>
                          )}
                          {(top.place || top.speaker) && (
                            <span className="d-flex gap-3 mb-3 align-items-center justify-content-center">
                              <Icons className="flex-shrink-0" typeIcon="location-pin" iconSize={30} fill={iconColor} />
                              {top.place}
                              {top.speaker ? ` • Preletor: ${top.speaker}` : ''}
                            </span>
                          )}
                        </span>
                        {top.registrationsDeadline && (
                          <span className="d-flex gap-3 align-items-center justify-content-center">
                            <Icons className="flex-shrink-0" typeIcon="simple-info" iconSize={35} fill={iconColor} />
                            <span>
                              Inscrições até{' '}
                              <em>
                                <b>{top.registrationsDeadline}</b>
                              </em>{' '}
                              ou até o esgotamento das vagas!
                            </span>
                          </span>
                        )}
                      </h5>
                    </Col>
                    <hr className="horizontal-line" />
                  </Row>

                  {(homeInfo?.bottom?.length || 0) > 0 && (
                    <Row className="justify-content-center">
                      <Col xl={9}>
                        <h4 className="mb-4 fw-bold">Informações Importantes</h4>
                        <ul className="info-home-list">
                          {homeInfo.bottom.map((item) => (
                            <li key={item.id} className="mb-3">
                              <h6 className="d-flex gap-3 align-items-center">
                                <Icons
                                  className="flex-shrink-0"
                                  typeIcon={item.icon}
                                  iconSize={32}
                                  {...iconColorProps(item.icon, iconColor)}
                                />
                                <span className="info-home-itens d-flex gap-2">
                                  <b className="info-home-enphasis">{item.title}:</b>{' '}
                                  <span
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.description) }}
                                  />
                                </span>
                              </h6>
                            </li>
                          ))}
                        </ul>
                      </Col>
                    </Row>
                  )}
                </Container>
              </FormStepLayout>
            </Col>
          </Row>
          <InfoButton />
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
                      <Button
                        variant="warning"
                        size="lg"
                        onClick={paymentEnabled ? goNext : handleSubmit}
                        disabled={submitting}
                      >
                        {paymentEnabled ? 'Continuar' : submitting ? 'Enviando...' : `Enviar (${people.length + 1})`}
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

                  {paymentEnabled && (
                    <div className="mb-4">
                      <h5>Pacote</h5>
                      {packageCategories.map((cat) => {
                        const sel = (currentAnswers.__package || {})[cat.id] || [];
                        return packageProducts
                          .filter((p) => sel.includes(p.id))
                          .map((p) => (
                            <div key={p.id} className="d-flex justify-content-between border-bottom py-2">
                              <span className="fw-bold">
                                {cat.name}: {p.name}
                              </span>
                              <span>{formatPrice(productPrice(p, ageRules, age))}</span>
                            </div>
                          ));
                      })}
                      <div className="d-flex justify-content-between py-2">
                        <span className="fw-bold">Total</span>
                        <b>{formatPrice(packageTotal(currentAnswers.__package, packageProducts, ageRules, age))}</b>
                      </div>
                    </div>
                  )}
                </div>
              </FormStepLayout>
            ) : currentStep.kind === 'cart' ? (
              <FormStepLayout
                title="Carrinho"
                description="Confira todos os itens antes de pagar."
                footer={
                  <>
                    <Button variant="light" size="lg" onClick={goBack}>
                      Voltar
                    </Button>
                    <Button variant="warning" size="lg" onClick={goNext}>
                      Ir para pagamento
                    </Button>
                  </>
                }
              >
                <div className="dynamic-form__cart">
                  {allPeople.map((person, personIndex) => {
                    const personAge = computeAge(person.nascimento);
                    const selection = person.__package || {};
                    return (
                      <div key={personIndex} className="mb-4">
                        <h5>{person.nome || `Pessoa ${personIndex + 1}`}</h5>
                        {packageCategories.map((cat) => {
                          const sel = selection[cat.id] || [];
                          return packageProducts
                            .filter((p) => sel.includes(p.id))
                            .map((p) => (
                              <div key={p.id} className="d-flex justify-content-between border-bottom py-2">
                                <span>
                                  {cat.name}: {p.name}
                                </span>
                                <span>{formatPrice(productPrice(p, ageRules, personAge))}</span>
                              </div>
                            ));
                        })}
                        <div className="d-flex justify-content-between py-2">
                          <span className="fw-bold">Subtotal</span>
                          <b>{formatPrice(packageTotal(selection, packageProducts, ageRules, personAge))}</b>
                        </div>
                      </div>
                    );
                  })}
                  <div className="d-flex justify-content-between py-2 border-top pt-3">
                    <h5 className="mb-0">Total</h5>
                    <h5 className="mb-0">{formatPrice(grandTotal)}</h5>
                  </div>
                </div>
              </FormStepLayout>
            ) : currentStep.kind === 'payment' ? (
              <FormStepLayout
                title="Pagamento"
                description="Você será redirecionado para o ambiente seguro do Pagar.me para concluir o pagamento."
                footer={
                  <>
                    <Button variant="light" size="lg" onClick={goBack} disabled={submitting}>
                      Voltar
                    </Button>
                    <Button variant="warning" size="lg" onClick={handlePayment} disabled={submitting}>
                      {submitting ? 'Gerando pagamento...' : `Pagar ${formatPrice(grandTotal)}`}
                    </Button>
                  </>
                }
              >
                <div className="dynamic-form__payment">
                  <p>
                    {allPeople.length} inscrição(ões) · Total{' '}
                    <b>{formatPrice(grandTotal)}</b>
                  </p>
                  <p className="text-muted">
                    Ao clicar em pagar, geramos seu pedido e abrimos a página de pagamento do Pagar.me. Sua inscrição é
                    confirmada assim que o pagamento é aprovado.
                  </p>
                </div>
              </FormStepLayout>
            ) : currentStep.kind === 'package' ? (
              <div className="dynamic-package">
                <PackageStep
                  categories={packageCategories}
                  products={packageProducts}
                  rules={ageRules}
                  age={age}
                  lotName={activeLotName}
                  value={currentAnswers.__package}
                  onChange={(sel) => setValue('__package', sel)}
                />
                <div className="form-step__nav dynamic-package__nav">
                  <Button variant="light" size="lg" onClick={goBack}>
                    Voltar
                  </Button>
                  <Button variant="warning" size="lg" onClick={goNext}>
                    Revisar
                  </Button>
                </div>
              </div>
            ) : (
              <FormStepLayout
                title={currentStep.section.name}
                onBack={stepIndex === 0 ? undefined : goBack}
                onNext={goNext}
                nextLabel={wizardSteps[stepIndex + 1]?.kind === 'review' ? 'Revisar' : 'Avançar'}
              >
                {currentStep.section.fields.map((field) => (
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
