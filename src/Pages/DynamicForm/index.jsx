import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Container, Row, Col, Button, Card, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { parse, isValid } from 'date-fns';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';

import useEventSchema from '@/hooks/useEventSchema';
import { buildValidationSchema, initialAnswers } from '@/form/dynamic/buildValidation';
import DynamicField from '@/form/dynamic/DynamicField';
import PackageStep from '@/form/dynamic/PackageStep';
import RideStep from '@/form/dynamic/RideStep';
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
import { getEventSlug, eventPath } from '@/config/eventScope';
import { getApiErrorMessage } from '@/fetchers/helpers';
import { getInscriptionDraft, deleteInscriptionDraft } from '@/services/me';
import {
  buildInscriptionDraft,
  saveInscriptionDraftLocal,
  getInscriptionDraftLocal,
  clearInscriptionDraftLocal,
  draftHasContent,
} from '@/utils/formStorage';
import Header from '@/components/Global/Header';
import Footer from '@/components/Global/Footer';
import FormStepLayout from '@/components/Global/FormStepLayout';
import Loading from '@/components/Global/Loading';
import InfoButton from '@/components/Global/InfoButton';
import Icons from '@/components/Global/Icons';
import Tips from '@/components/Global/Tips';
import BoletoList from '@/components/Global/BoletoList';
import PaymentSimulatorModal from '@/components/Global/PaymentSimulatorModal';
import { DEFAULT_FEES } from '@/utils/paymentFees';
import '@/Pages/Home/style.scss';
import '@/components/Style/Cart.scss';
import '@/Pages/BeforePayment/style.scss';
import '@/form/dynamic/dynamicFields.scss';
import SpinnerButton from '@/components/Global/SpinnerButton';

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

const PAYMENT_OPTIONS = [
  { key: 'creditCard', label: 'Cartão de Crédito', description: 'Parcele em até 12x', icon: 'credit-card' },
  { key: 'pix', label: 'PIX', description: 'Aprovação na hora', icon: 'cash' },
  { key: 'ticket', label: 'Boleto', description: 'Boletos mensais', icon: 'barcode' },
];

const DynamicForm = () => {
  const navigate = useNavigate();
  const { fields, sections: allSections, loading } = useEventSchema();
  const { isLoggedIn } = useContext(AuthContext);
  const { color: eventColor, paymentEnabled, registrationFeeEnabled, registrationsOpen, boletoEnabled, boletoMaxInstallments, boletoMinDaysBeforeEvent } = useEventBranding();
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
  const [boletoInstallments, setBoletoInstallments] = useState(1);
  const [boletoResult, setBoletoResult] = useState(null);
  const [pixResult, setPixResult] = useState(null);
  const [donation, setDonation] = useState('');
  const [showSimulator, setShowSimulator] = useState(false);

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

  const sections = useMemo(
    () => allSections.filter((section) => section.fields.length > 0 || section.moduleType),
    [allSections],
  );

  const initializedAnswers = useMemo(() => initialAnswers(fields), [fields]);
  const currentAnswers = Object.keys(answers).length ? answers : initializedAnswers;

  const age = useMemo(() => computeAge(currentAnswers.nascimento, baseDate), [currentAnswers.nascimento, baseDate]);

  const wizardSteps = useMemo(() => {
    const steps = [];
    sections.forEach((s) => {
      if (s.moduleType === 'package') {
        steps.push({ kind: 'package', section: s });
        return;
      }
      if (s.moduleType === 'ride') {
        if (people.length === 0) steps.push({ kind: 'ride', section: s });
        return;
      }
      steps.push({ kind: 'section', section: s });
    });
    if (paymentEnabled && !steps.some((s) => s.kind === 'package')) steps.push({ kind: 'package' });
    steps.push({ kind: 'review' });
    if (paymentEnabled) {
      steps.push({ kind: 'cart' });
      steps.push({ kind: 'payment' });
    }
    return steps;
  }, [sections, paymentEnabled, people.length]);

  const currentStep = wizardSteps[stepIndex];
  const isReview = currentStep?.kind === 'review';
  const stepLabel = (st) =>
    ({ section: st.section?.name, package: st.section?.name || 'Pacote', ride: st.section?.name || 'Carona', review: 'Revisão', cart: 'Carrinho', payment: 'Pagamento' })[
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
    if (currentStep.kind === 'ride') {
      const ride = currentAnswers.__ride || {};
      if (ride.mode === 'offer' && !(Number(ride.seats) > 0)) {
        toast.error('Informe quantas vagas você tem no carro.');
        return false;
      }
      if ((ride.mode === 'offer' || ride.mode === 'need') && !(ride.phone || '').trim()) {
        toast.error('Informe um WhatsApp para combinar a carona.');
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

  const cartRestoredRef = useRef(false);
  useEffect(() => {
    if (cartRestoredRef.current || cartStepIndex < 0 || !isLoggedIn) return;
    cartRestoredRef.current = true;

    const applyRestore = (savedPeople, savedAnswers) => {
      if (!Array.isArray(savedPeople) || !savedPeople.length) return false;
      setPeople(savedPeople);
      if (savedAnswers && Object.keys(savedAnswers).length) setAnswers(savedAnswers);
      setStepIndex(cartStepIndex);
      setMaxStepReached((max) => Math.max(max, cartStepIndex));
      toast.info('Seu carrinho foi restaurado. Você já pode finalizar o pagamento.');
      return true;
    };

    const cleanupBridges = () => {
      try {
        sessionStorage.removeItem(`dynamic-cart:${slug}`);
      } catch {
        // ignore
      }
      clearInscriptionDraftLocal();
    };

    // Retoma a inscrição em andamento em camadas: mesma aba (sessionStorage) ->
    // outra aba do mesmo navegador (localStorage) -> outro dispositivo (servidor).
    const restore = async () => {
      try {
        const saved = sessionStorage.getItem(`dynamic-cart:${slug}`);
        if (saved) {
          const { people: p, answers: a } = JSON.parse(saved);
          if (applyRestore(p, a)) {
            cleanupBridges();
            return;
          }
        }
      } catch {
        // ignore
      }

      const localDraft = getInscriptionDraftLocal();
      if (draftHasContent(localDraft) && localDraft.slug === slug && applyRestore(localDraft.people, localDraft.answers)) {
        cleanupBridges();
        deleteInscriptionDraft().catch(() => {});
        return;
      }

      try {
        const serverDraft = await getInscriptionDraft();
        if (
          draftHasContent(serverDraft) &&
          serverDraft.slug === slug &&
          applyRestore(serverDraft.people, serverDraft.answers)
        ) {
          cleanupBridges();
          deleteInscriptionDraft().catch(() => {});
          return;
        }
      } catch {
        // ignore
      }

      cleanupBridges();
    };

    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartStepIndex, isLoggedIn, slug]);

  const requireLogin = () => {
    try {
      sessionStorage.setItem(`dynamic-cart:${slug}`, JSON.stringify({ people, answers: currentAnswers }));
    } catch {
      // ignore storage errors
    }
    // Ponte em localStorage (sobrevive à confirmação de e-mail em outra aba) e,
    // no cadastro, o draft também vai pro servidor (retomada cross-device).
    saveInscriptionDraftLocal(buildInscriptionDraft(slug, people, currentAnswers));
    toast.info('Crie sua conta e confirme seu e-mail para finalizar a inscrição.');
    navigate('/entrar', { state: { from: eventPath('/') } });
  };

  const clearInscriptionDraft = () => {
    clearInscriptionDraftLocal();
    try {
      sessionStorage.removeItem(`dynamic-cart:${slug}`);
    } catch {
      // ignore
    }
    deleteInscriptionDraft().catch(() => {});
  };

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
      requireLogin();
      return;
    }

    if (!validateCurrentPerson()) return;

    const registrations = [...people, currentAnswers].map((personAnswers) => ({ answers: personAnswers }));

    setSubmitting(true);
    try {
      await createSubmission({ registrations });
      clearInscriptionDraft();
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
      requireLogin();
      return;
    }

    if (!people.length) {
      toast.error('Adicione ao menos um inscrito ao carrinho.');
      return;
    }
    if (!paymentMethod) {
      toast.error('Escolha uma forma de pagamento.');
      return;
    }

    const registrations = people.map((personAnswers) => ({ answers: personAnswers }));

    setSubmitting(true);
    try {
      const result = await createGenericCheckout({
        registrations,
        paymentMethod,
        boletoInstallments,
        donation: Number(donation) || 0,
      });
      if (result?.boletos?.length) {
        clearInscriptionDraft();
        setBoletoResult(result.boletos.map((boleto) => ({ ...boleto, boletoUrl: boleto.url || boleto.boletoUrl })));
        window.scrollTo(0, 0);
        return;
      }
      if (result?.pix?.qr_code || result?.pix?.qr_code_url) {
        clearInscriptionDraft();
        setPixResult(result.pix);
        window.scrollTo(0, 0);
        return;
      }
      const paymentUrl = result?.payment_url;
      if (!paymentUrl) {
        toast.error('Não foi possível gerar o pagamento. Tente novamente.');
        return;
      }
      clearInscriptionDraft();
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
    setBoletoInstallments(1);
    setBoletoResult(null);
    setPixResult(null);
    setDonation('');
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

  if (boletoResult) {
    return (
      <div className="components-container">
        <Header />
        <div className="form__container container">
          <Row className="justify-content-center">
            <Col lg={10} className="my-5">
              <div className="text-center">
                <h2>Boletos gerados! 🎉</h2>
                <p className="mt-3">
                  Pague o <b>1º boleto</b> para confirmar sua vaga. Enviamos todos os boletos também para o seu e-mail.
                </p>
              </div>
              <BoletoList boletos={boletoResult} />
              <div className="text-center d-flex flex-column align-items-center gap-2">
                <button className="btn btn-outline-teal-blue mt-3" onClick={() => navigate('/minhas-inscricoes')}>
                  Ver minhas inscrições
                </button>
                <button className="btn btn-teal-blue" onClick={restart}>
                  Voltar ao início
                </button>
              </div>
            </Col>
          </Row>
        </div>
        <Footer handleAdminClick={() => navigate('/admin')} />
      </div>
    );
  }

  if (pixResult) {
    return (
      <div className="components-container">
        <Header />
        <div className="form__container container">
          <Row className="justify-content-center">
            <Col lg={8} className="my-5">
              <div className="text-center">
                <h2>Pague com Pix para confirmar</h2>
                <p className="mt-3">
                  Escaneie o QR code no app do seu banco ou copie o código Pix abaixo. A confirmação é automática.
                </p>
                {pixResult.qr_code_url && (
                  <img
                    src={pixResult.qr_code_url}
                    alt="QR code Pix"
                    style={{ maxWidth: '260px', width: '100%', margin: '1rem auto', display: 'block' }}
                  />
                )}
                {pixResult.qr_code && (
                  <div className="d-flex flex-column align-items-center gap-2 mt-3">
                    <textarea
                      readOnly
                      value={pixResult.qr_code}
                      rows={3}
                      className="form-control"
                      style={{ maxWidth: '480px', fontSize: '0.8rem' }}
                    />
                    <button
                      className="btn btn-teal-blue"
                      onClick={() => {
                        navigator.clipboard?.writeText(pixResult.qr_code);
                        toast.success('Código Pix copiado!');
                      }}
                    >
                      Copiar código Pix
                    </button>
                  </div>
                )}
                <div className="text-center d-flex flex-column align-items-center gap-2 mt-4">
                  <button className="btn btn-outline-teal-blue" onClick={() => navigate('/minhas-inscricoes')}>
                    Ver minhas inscrições
                  </button>
                  <button className="btn btn-teal-blue" onClick={restart}>
                    Voltar ao início
                  </button>
                </div>
              </div>
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
              <div className="d-flex flex-column align-items-center gap-2">
                <button className="btn btn-outline-teal-blue mt-3" onClick={() => navigate('/minhas-inscricoes')}>
                  Ver minhas inscrições
                </button>
                <button className="btn btn-teal-blue" onClick={restart}>
                  Voltar ao início
                </button>
              </div>
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
                            <p>Nenhum inscrito adicionado ao carrinho</p>
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
                                    Total Inscrito: <span>{formatPrice(personTotal(person))}</span>
                                  </h5>
                                </Card.Body>
                              </Card>
                            );
                          })
                        )}
                        <div className="text-center">
                          <Button variant="outline-secondary" className="plus-camper-button" size="lg" onClick={addCamper}>
                            <Icons typeIcon="plus" iconSize={25} fill="#6c757d" /> &nbsp;Adicionar Inscrito
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
                                  text="Taxa de inscrição do evento, somada ao valor do pacote de cada inscrito."
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
                            {grandTotal > 0 && (
                              <Button variant="outline-secondary" onClick={() => setShowSimulator(true)}>
                                <Icons typeIcon="money" iconSize={20} fill="#6c757d" /> Simular Taxas de Pagamento
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <PaymentSimulatorModal
                  show={showSimulator}
                  onHide={() => setShowSimulator(false)}
                  base={grandTotal}
                  fees={DEFAULT_FEES}
                  maxBoletoInstallments={boletoEnabled ? boletoMaxInstallments : 1}
                />
              </div>
            ) : currentStep.kind === 'payment' ? (
              <FormStepLayout
                title="Pagamento"
                footer={
                  <>
                    <Button variant="light" size="lg" onClick={goBack} disabled={submitting}>
                      Voltar
                    </Button>
                    <SpinnerButton variant="warning" size="lg" onClick={handlePayment} loading={submitting}>Avançar</SpinnerButton>
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
                  <p className="payment-heading fw-bold mt-4 mb-2">Escolha sua forma de pagamento:</p>
                  <div className="payment-grid">
                    {PAYMENT_OPTIONS.filter((option) => option.key !== 'ticket' || boletoEnabled).map((option) => {
                      const active = paymentMethod === option.key;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          className={`payment-card ${active ? 'is-active' : ''}`}
                          onClick={() => {
                            setPaymentMethod(option.key);
                            setBoletoInstallments(1);
                          }}
                        >
                          <span className="payment-card__icon">
                            <Icons typeIcon={option.icon} iconSize={26} fill={active ? '#fff' : iconColor} />
                          </span>
                          <span className="payment-card__title">{option.label}</span>
                          <span className="payment-card__desc">{option.description}</span>
                          {active && <span className="payment-card__badge">Selecionado</span>}
                        </button>
                      );
                    })}
                  </div>

                  {paymentMethod === 'ticket' && boletoMaxInstallments >= 2 && (
                    <div className="mt-4">
                      <Form.Label className="fw-bold">Em quantas parcelas (boletos mensais)?</Form.Label>
                      <div className="dynamic-form__installments">
                        {Array.from({ length: boletoMaxInstallments }, (_, i) => i + 1).map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={`installment-chip ${boletoInstallments === n ? 'is-active' : ''}`}
                            onClick={() => setBoletoInstallments(n)}
                          >
                            {n}x
                          </button>
                        ))}
                      </div>
                      <p className="text-secondary small mt-2 mb-0">
                        Serão gerados {boletoInstallments} {boletoInstallments === 1 ? 'boleto' : 'boletos mensais'}. O
                        1º confirma sua vaga; os demais mantêm a inscrição em dia.
                      </p>
                      <p className="text-secondary small mt-2 mb-0">
                        Se o vencimento da <b>última parcela</b> ficar a <b>menos de {boletoMinDaysBeforeEvent} dias</b> do início do evento, ele
                        é <b>antecipado automaticamente</b> para garantir que o pagamento seja compensado a tempo.
                      </p>
                    </div>
                  )}

                  <Form.Group className="mt-4" controlId="donation-input">
                    <Form.Label className="fw-bold">Quer incluir uma doação social? (opcional)</Form.Label>
                    <InputGroup style={{ maxWidth: '220px' }}>
                      <InputGroup.Text>R$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={donation}
                        onChange={(e) => setDonation(e.target.value.replace(/[^0-9]/g, ''))}
                      />
                    </InputGroup>
                    <Form.Text className="text-muted-italic">
                      A doação é somada ao seu pagamento e destinada ao projeto social do evento.
                    </Form.Text>
                  </Form.Group>

                  <p className="text-muted mt-4">
                    {people.length} inscrição(ões)
                    {Number(donation) > 0 && ` + doação ${formatPrice(Number(donation))}`} · Total{' '}
                    <b>{formatPrice(grandTotal + (Number(donation) || 0))}</b>
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
                  <Button variant="light" size="lg" onClick={goBack} disabled={stepIndex === 0}>
                    Voltar
                  </Button>
                  <Button variant="warning" size="lg" onClick={goNext}>
                    {wizardSteps[stepIndex + 1]?.kind === 'review' ? 'Revisar' : 'Avançar'}
                  </Button>
                </div>
              </div>
            ) : currentStep.kind === 'ride' ? (
              <FormStepLayout
                title={currentStep.section?.name || 'Carona'}
                onBack={stepIndex === 0 ? undefined : goBack}
                onNext={goNext}
                nextLabel={wizardSteps[stepIndex + 1]?.kind === 'review' ? 'Revisar' : 'Avançar'}
              >
                <RideStep value={currentAnswers.__ride} onChange={(sel) => setValue('__ride', sel)} />
              </FormStepLayout>
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
