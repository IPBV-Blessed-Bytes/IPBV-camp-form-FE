import { useCallback, useContext, useMemo, useState } from 'react';
import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { parse, isValid } from 'date-fns';
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
import { getPublicBaseDate } from '@/services/baseDate';
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
import Tips from '@/components/Global/Tips';
import '@/Pages/Home/style.scss';
import '@/components/Style/Cart.scss';
import '@/Pages/BeforePayment/style.scss';
import '@/form/dynamic/dynamicFields.scss';

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
  const { color: eventColor, paymentEnabled, registrationFeeEnabled, registrationsOpen } = useEventBranding();
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
  const { data: baseDateData } = useQuery({
    queryKey: ['pkg-base-date', slug],
    queryFn: getPublicBaseDate,
    enabled: Boolean(paymentEnabled),
  });
  const baseDate = useMemo(() => {
    const raw = baseDateData?.baseDate;
    if (!raw) return null;
    const parsed = parse(raw, 'dd/MM/yyyy', new Date());
    return isValid(parsed) ? parsed : null;
  }, [baseDateData]);
  const packageProducts = useMemo(() => packageProductsData?.products || [], [packageProductsData]);
  const { data: lotsData } = useQuery({
    queryKey: ['pkg-lots', slug],
    queryFn: getLots,
    enabled: Boolean(paymentEnabled),
  });
  const activeLot = useMemo(() => findActiveLot(lotsData?.lots || []), [lotsData]);
  const activeLotName = activeLot?.name || '';
  const registrationFee = useMemo(
    () => (registrationFeeEnabled ? Number(activeLot?.price?.registrationFee || 0) : 0),
    [registrationFeeEnabled, activeLot],
  );

  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [stepIndex, setStepIndex] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [people, setPeople] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');

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

  const age = useMemo(() => computeAge(currentAnswers.nascimento, baseDate), [currentAnswers.nascimento, baseDate]);

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

  const personPackageTotal = useCallback(
    (person) => packageTotal(person.__package, packageProducts, ageRules, computeAge(person.nascimento, baseDate)),
    [packageProducts, ageRules, baseDate],
  );
  const personTotal = useCallback(
    (person) => personPackageTotal(person) + registrationFee,
    [personPackageTotal, registrationFee],
  );
  const packagesTotal = useMemo(
    () => people.reduce((sum, person) => sum + personPackageTotal(person), 0),
    [people, personPackageTotal],
  );
  const grandTotal = useMemo(
    () => people.reduce((sum, person) => sum + personTotal(person), 0),
    [people, personTotal],
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

  const cartStepIndex = useMemo(() => wizardSteps.findIndex((s) => s.kind === 'cart'), [wizardSteps]);

  const commitAndGoToCart = () => {
    if (!validateCurrentPerson()) return;
    setPeople((prev) => [...prev, currentAnswers]);
    setAnswers({});
    setErrors({});
    setStepIndex(cartStepIndex);
    setMaxStepReached((max) => Math.max(max, cartStepIndex));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addCamper = () => {
    setAnswers({});
    setErrors({});
    setStepIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPayment = () => {
    const paymentIndex = cartStepIndex + 1;
    setStepIndex(paymentIndex);
    setMaxStepReached((max) => Math.max(max, paymentIndex));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editCamper = (index) => {
    setAnswers(people[index]);
    setPeople((prev) => prev.filter((_, i) => i !== index));
    setErrors({});
    setStepIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCamper = (index) => {
    setPeople((prev) => prev.filter((_, i) => i !== index));
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

    if (!people.length) {
      toast.error('Adicione ao menos um acampante ao carrinho.');
      return;
    }
    if (!paymentMethod) {
      toast.error('Escolha uma forma de pagamento.');
      return;
    }

    const registrations = people.map((personAnswers) => ({ answers: personAnswers }));

    setSubmitting(true);
    try {
      const { payment_url: paymentUrl } = await createGenericCheckout({ registrations, paymentMethod });
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
    setPaymentMethod('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <Loading loading />;

  if (registrationsOpen === false) {
    return (
      <div className="components-container">
        <Header />
        <div className="form__container container">
          <Row className="justify-content-center">
            <Col lg={8} className="text-center my-5">
              <h2>Inscrições encerradas</h2>
              <p className="mt-3">
                As inscrições para este evento foram encerradas. Você ainda pode entrar na sua conta para acompanhar sua
                inscrição.
              </p>
              <button
                className="btn btn-teal-blue mt-3"
                onClick={() => navigate(isLoggedIn ? '/minha-conta' : '/entrar')}
              >
                {isLoggedIn ? 'Ir para minha conta' : 'Entrar na minha conta'}
              </button>
            </Col>
          </Row>
        </div>
        <Footer handleAdminClick={() => navigate('/admin')} />
      </div>
    );
  }

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
        cartCount={paymentEnabled ? people.length : 0}
        onCartClick={() => goToStep(cartStepIndex)}
      />
      <div className="form__container container">
        <Row className="justify-content-center">
          <Col lg={10} className="px-0">
            {isReview ? (
              <FormStepLayout
                title={people.length ? `Revisão — pessoa ${people.length + 1}` : 'Revisão'}
                description={
                  paymentEnabled
                    ? 'Confira as respostas antes de continuar para o carrinho.'
                    : 'Confira as respostas. Você pode adicionar outra pessoa ou enviar tudo.'
                }
                footer={
                  <>
                    <Button variant="light" size="lg" onClick={goBack} disabled={submitting}>
                      Voltar
                    </Button>
                    {paymentEnabled ? (
                      <Button variant="warning" size="lg" onClick={commitAndGoToCart} disabled={submitting}>
                        Continuar
                      </Button>
                    ) : (
                      <div className="d-flex gap-2">
                        <Button variant="outline-warning" size="lg" onClick={addPerson} disabled={submitting}>
                          Adicionar pessoa
                        </Button>
                        <Button variant="warning" size="lg" onClick={handleSubmit} disabled={submitting}>
                          {submitting ? 'Enviando...' : `Enviar (${people.length + 1})`}
                        </Button>
                      </div>
                    )}
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
                      {registrationFee > 0 && (
                        <div className="d-flex justify-content-between border-bottom py-2">
                          <span className="fw-bold">Taxa de Inscrição</span>
                          <span>{formatPrice(registrationFee)}</span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between py-2">
                        <span className="fw-bold">Total</span>
                        <b>{formatPrice(personTotal(currentAnswers))}</b>
                      </div>
                    </div>
                  )}
                </div>
              </FormStepLayout>
            ) : currentStep.kind === 'cart' ? (
              <div className="dynamic-cart">
                <Row>
                  <Col xs={12} xl={8} className="mb-2 px-0 px-lg-2">
                    <Card className="h-100">
                      <Card.Body>
                        <Card.Title>Carrinho</Card.Title>
                        {people.length === 0 ? (
                          <div className="empty-cart">
                            <Icons typeIcon="cart" iconSize={48} fill="#ced4da" />
                            <p>Nenhum acampante adicionado ao carrinho</p>
                          </div>
                        ) : (
                          people.map((person, personIndex) => {
                            const personAge = computeAge(person.nascimento, baseDate);
                            const selection = person.__package || {};
                            return (
                              <Card key={personIndex} className="cart-user-card mb-4">
                                <Card.Body>
                                  <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="cart-user-title mb-0">
                                      <b>{person.nome || `Pessoa ${personIndex + 1}`}</b>
                                    </h4>
                                    <div className="d-flex gap-2">
                                      <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => editCamper(personIndex)}
                                      >
                                        <Icons typeIcon="edit" iconSize={22} />
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => deleteCamper(personIndex)}
                                      >
                                        <Icons typeIcon="delete" iconSize={22} fill="#dc3545" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="packages-horizontal-line-cart"></div>
                                  {packageCategories.map((cat) => {
                                    const sel = selection[cat.id] || [];
                                    return packageProducts
                                      .filter((p) => sel.includes(p.id))
                                      .map((p) => (
                                        <div key={p.id} className="cart-item">
                                          <div className="item-info mb-3">
                                            <div className="d-flex justify-content-between">
                                              <h5>{cat.name}:</h5>
                                              <h5>{formatPrice(productPrice(p, ageRules, personAge))}</h5>
                                            </div>
                                            <p>{p.name}</p>
                                          </div>
                                        </div>
                                      ));
                                  })}
                                  <div className="packages-horizontal-line-cart"></div>
                                  <h5 className="cart-user-total fw-bold d-flex justify-content-between">
                                    Total Acampante: <span>{formatPrice(personTotal(person))}</span>
                                  </h5>
                                </Card.Body>
                              </Card>
                            );
                          })
                        )}
                        <div className="text-center">
                          <Button variant="outline-secondary" className="plus-camper-button" size="lg" onClick={addCamper}>
                            <Icons typeIcon="plus" iconSize={25} fill="#6c757d" /> &nbsp;Adicionar Acampante
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col xs={12} xl={4} className="px-0 px-lg-2">
                    <Card className="mb-4">
                      <Card.Body>
                        <Card.Title>Resumo</Card.Title>
                        <div className="packages-horizontal-line-cart"></div>
                        <div className="summary">
                          {registrationFee > 0 && (
                            <div className="summary-individual-base">
                              <div className="d-flex align-items-center gap-1">
                                <h5 className="summary-individual-base-label mb-0">Taxa de Inscrição:</h5>
                                <Tips
                                  classNameWrapper="mt-0"
                                  placement="top"
                                  typeIcon="info"
                                  size={15}
                                  color="#7f7878"
                                  text="Taxa de inscrição do evento, somada ao valor do pacote de cada acampante."
                                />
                              </div>
                              <h5 className="mb-0">{formatPrice(registrationFee)}</h5>
                            </div>
                          )}
                          <div className="summary-total-package">
                            <h5 className="summary-total-package-label mb-0">Total do Pacote:</h5>
                            <h5 className="mb-0">{formatPrice(packagesTotal)}</h5>
                          </div>
                          <div className="packages-horizontal-line-cart"></div>
                          <div className="summary-total-geral mb-3">
                            <h5 className="fw-bold mb-0">Total:</h5>
                            <h5 className="fw-bold mb-0">{formatPrice(grandTotal)}</h5>
                          </div>
                          <div className="summary-buttons d-grid gap-3">
                            {people.length > 0 && (
                              <Button variant="teal-blue" size="lg" onClick={goToPayment}>
                                Pagamento
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            ) : currentStep.kind === 'payment' ? (
              <FormStepLayout
                title="Pagamento"
                footer={
                  <>
                    <Button variant="light" size="lg" onClick={goBack} disabled={submitting}>
                      Voltar
                    </Button>
                    <Button variant="warning" size="lg" onClick={handlePayment} disabled={submitting}>
                      {submitting ? 'Gerando pagamento...' : 'Avançar'}
                    </Button>
                  </>
                }
              >
                <div className="dynamic-form__payment">
                  <p>
                    Escolha a forma de pagamento desejada. <b>Atenção:</b> após selecionar a forma de pagamento, você
                    será redirecionado para a tela de finalização, e não será possível voltar para alterar essa opção.
                    Certifique-se de sua escolha antes de prosseguir. <b>Importante:</b>{' '}
                    <i>não é necessário enviar comprovante de pagamento!</i> Todo o processo é digital e registrado
                    automaticamente em nossa base de dados.
                  </p>
                  <Form.Group className="mt-4" controlId="payment-method">
                    <Form.Label className="fw-bold">Escolha sua forma de pagamento:</Form.Label>
                    <Form.Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option value="">Selecione uma opção</option>
                      <option value="creditCard">Cartão de Crédito (Até 12x)</option>
                      <option value="pix">PIX</option>
                      <option value="ticket">Boleto</option>
                    </Form.Select>
                  </Form.Group>
                  <p className="text-muted mt-4">
                    {people.length} inscrição(ões) · Total <b>{formatPrice(grandTotal)}</b>
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
                  registrationFee={registrationFee}
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
                <div className="dynamic-fields" data-columns={currentStep.section.columns || 1}>
                  {currentStep.section.fields.map((field) => (
                    <div key={field.key} className="dynamic-fields__cell">
                      <DynamicField
                        field={field}
                        value={currentAnswers[field.key]}
                        onChange={(value) => setValue(field.key, value)}
                        error={errors[field.key]}
                      />
                    </div>
                  ))}
                </div>
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
