import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Container, Row, Col, Button, Card, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { parse, isValid } from 'date-fns';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';

import useEventSchema from '@/hooks/useEventSchema';
import { buildValidationSchema, initialAnswers } from '@/form/dynamic/buildValidation';
import DynamicField from '@/form/dynamic/DynamicField';
import PackageStep from '@/form/dynamic/PackageStep';
import WorkshopStep from '@/form/dynamic/WorkshopStep';
import RideStep from '@/form/dynamic/RideStep';
import { computeAge, packageTotal, packageFullTotal, formatPrice, productPrice } from '@/form/dynamic/packagePricing';
import { createSubmission } from '@/services/submissions';
import { createGenericCheckout } from '@/services/checkout';
import { validateCouponCode } from '@/services/couponCodes';
import { buildEventCalendarUrl } from '@/utils/calendar';
import { getEventSchedule } from '@/Pages/Packages/utils/calculateAge';
import { getPublicHomeInfo } from '@/services/homeInfo';
import { getProducts } from '@/services/products';
import { listPublicWorkshops } from '@/services/workshops';
import { getLots } from '@/services/lots';
import { listPackageCategories } from '@/services/packageCategories';
import { listAgePriceRules } from '@/services/agePriceRules';
import { getPublicBaseDate } from '@/services/baseDate';
import { findActiveLot } from '@/utils/activeLot';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';
import { useEventBranding } from '@/contexts/EventBrandingContext';
import { getEventSlug, eventPath } from '@/config/eventScope';
import { getApiErrorMessage } from '@/fetchers/helpers';
import { getInscriptionDraft, deleteInscriptionDraft, getPrefillSource } from '@/services/me';
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

const displayValue = (field, value, t) => {
  if (value == null || value === '') return '—';
  if (field.type === 'consent') return value ? t('form.dynamic.consentAccepted') : '—';
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { fields, sections: allSections, loading } = useEventSchema();
  const { isLoggedIn } = useContext(AuthContext);
  const { color: eventColor, paymentEnabled, registrationFeeEnabled, registrationsOpen, boletoEnabled, boletoMaxInstallments, boletoMinDaysBeforeEvent, groupDiscountThresholdCents, groupDiscountPercent, storeDeliveryNote, couponCodesEnabled, name: eventName, mapQuery, refundProtectionEnabled, protectionFeeType, protectionFeeAmount, pixEnabled, cardEnabled, cardMaxInstallments, prefillEnabled } = useEventBranding();

  const calendarUrl = (() => {
    const schedule = getEventSchedule() || {};
    return buildEventCalendarUrl({
      title: eventName || 'Acampamento',
      baseDate: schedule.baseDate,
      startTime: schedule.startTime,
      endDate: schedule.endDate,
      endTime: schedule.endTime,
      location: mapQuery,
      details: eventName ? `Inscrição confirmada — ${eventName}` : 'Inscrição confirmada',
    });
  })();
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

  const { data: workshopsData } = useQuery({
    queryKey: ['workshops', slug],
    queryFn: listPublicWorkshops,
  });
  const workshopsEnabled = Boolean(workshopsData?.enabled);
  const workshops = useMemo(() => workshopsData?.workshops || [], [workshopsData]);
  const workshopMinChoices = workshopsData?.minChoices ?? null;
  const workshopMaxChoices = workshopsData?.maxChoices ?? null;
  const workshopById = useMemo(() => new Map(workshops.map((w) => [w.id, w])), [workshops]);
  const workshopsTotalFor = useCallback(
    (ids) => (ids || []).reduce((sum, id) => sum + Number(workshopById.get(id)?.price || 0), 0),
    [workshopById],
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
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [protectionOpted, setProtectionOpted] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [prefillSource, setPrefillSource] = useState(null);
  const [noPrefill, setNoPrefill] = useState(false);

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
    if (workshopsEnabled && workshops.length > 0) steps.push({ kind: 'workshop' });
    steps.push({ kind: 'review' });
    if (paymentEnabled) {
      steps.push({ kind: 'cart' });
      steps.push({ kind: 'payment' });
    }
    return steps;
  }, [sections, paymentEnabled, people.length, workshopsEnabled, workshops.length]);

  const currentStep = wizardSteps[stepIndex];
  const isReview = currentStep?.kind === 'review';
  const stepLabel = useCallback(
    (st) =>
      ({ section: st.section?.name, package: st.section?.name || t('form.dynamic.packageLabel'), workshop: t('form.dynamic.workshops.stepTitle'), ride: st.section?.name || t('form.dynamic.rideLabel'), review: t('form.dynamic.review'), cart: t('form.dynamic.cart'), payment: t('form.dynamic.payment') })[
        st.kind
      ],
    [t],
  );
  const stepperSteps = useMemo(() => wizardSteps.map(stepLabel), [wizardSteps, stepLabel]);

  const personPackageTotal = useCallback(
    (person) => packageTotal(person.__package, packageProducts, ageRules, computeAge(person.nascimento, baseDate)),
    [packageProducts, ageRules, baseDate],
  );
  const personTotal = useCallback(
    (person) => personPackageTotal(person) + registrationFee + workshopsTotalFor(person.__workshops),
    [personPackageTotal, registrationFee, workshopsTotalFor],
  );
  const packagesTotal = useMemo(
    () => people.reduce((sum, person) => sum + personPackageTotal(person), 0),
    [people, personPackageTotal],
  );
  const packagesDiscountTotal = useMemo(
    () =>
      people.reduce(
        (sum, person) => sum + (packageFullTotal(person.__package, packageProducts) - personPackageTotal(person)),
        0,
      ),
    [people, packageProducts, personPackageTotal],
  );
  const grandTotal = useMemo(
    () => people.reduce((sum, person) => sum + personTotal(person), 0),
    [people, personTotal],
  );
  const groupDiscountAmount = useMemo(() => {
    const threshold = (Number(groupDiscountThresholdCents) || 0) / 100;
    const percent = Math.min(Number(groupDiscountPercent) || 0, 100);
    if (percent <= 0 || threshold <= 0 || packagesTotal < threshold) return 0;
    return packagesTotal * (percent / 100);
  }, [packagesTotal, groupDiscountThresholdCents, groupDiscountPercent]);
  const netGrandTotal = useMemo(
    () => Math.max(0, grandTotal - groupDiscountAmount),
    [grandTotal, groupDiscountAmount],
  );
  const couponBase = useMemo(
    () => Math.max(0, packagesTotal - groupDiscountAmount),
    [packagesTotal, groupDiscountAmount],
  );
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || couponBase <= 0) return 0;
    const amount = Number(appliedCoupon.discountAmount) || 0;
    if (appliedCoupon.discountType === 'VALUE') return Math.min(amount, couponBase);
    return couponBase * (Math.min(amount, 100) / 100);
  }, [appliedCoupon, couponBase]);
  const finalTotal = useMemo(
    () => Math.max(0, netGrandTotal - couponDiscount),
    [netGrandTotal, couponDiscount],
  );
  const protectionPreview = useMemo(() => {
    if (!refundProtectionEnabled || !protectionFeeAmount || people.length === 0) return 0;
    if (protectionFeeType === 'VALUE') return people.length * Number(protectionFeeAmount);
    return finalTotal * (Math.min(Number(protectionFeeAmount), 100) / 100);
  }, [refundProtectionEnabled, protectionFeeAmount, protectionFeeType, people.length, finalTotal]);
  const protectionTotal = protectionOpted ? protectionPreview : 0;
  const payableTotal = useMemo(() => finalTotal + protectionTotal, [finalTotal, protectionTotal]);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponChecking(true);
    try {
      const cpf = people[0]?.cpf || '';
      const result = await validateCouponCode({ code, cpf });
      if (result?.valid) {
        setAppliedCoupon(result);
        toast.success('Cupom aplicado!');
      } else {
        setAppliedCoupon(null);
        toast.error(result?.message || 'Cupom inválido');
      }
    } catch (e) {
      setAppliedCoupon(null);
      toast.error('Não foi possível validar o cupom');
    } finally {
      setCouponChecking(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const setValue = (key, value) => {
    setAnswers((prev) => ({ ...(Object.keys(prev).length ? prev : initializedAnswers), [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const prefillFetchedRef = useRef(false);
  useEffect(() => {
    if (!prefillEnabled || !isLoggedIn || prefillFetchedRef.current) return;
    prefillFetchedRef.current = true;
    getPrefillSource()
      .then((source) => {
        if (source && Object.keys(source).length) setPrefillSource(source);
      })
      .catch(() => {});
  }, [prefillEnabled, isLoggedIn]);

  const applyPrefill = () => {
    if (!prefillSource) return;
    const fieldByKey = new Map(fields.map((field) => [field.key, field]));
    const next = { ...(Object.keys(answers).length ? answers : initializedAnswers) };
    let filled = 0;
    Object.entries(prefillSource).forEach(([key, value]) => {
      if (key.startsWith('__')) return;
      const field = fieldByKey.get(key);
      if (!field || field.type === 'file') return;
      next[key] = value;
      filled += 1;
    });
    if (!filled) return;
    setAnswers(next);
    setErrors({});
    toast.success(t('form.dynamic.prefill.applied'));
  };

  const validateStep = () => {
    if (currentStep.kind === 'section') {
      try {
        buildValidationSchema(currentStep.section.fields).validateSync(currentAnswers, { abortEarly: false });
        return true;
      } catch (validationError) {
        setErrors((prev) => ({ ...prev, ...collectErrors(validationError) }));
        toast.error(t('form.dynamic.fillRequired'));
        return false;
      }
    }
    if (currentStep.kind === 'package') {
      const selection = currentAnswers.__package || {};
      const missing = packageCategories.filter((c) => c.required && !(selection[c.id]?.length));
      if (missing.length) {
        toast.error(t('form.dynamic.chooseOptionIn', { fields: missing.map((m) => m.name).join(', ') }));
        return false;
      }
      return true;
    }
    if (currentStep.kind === 'workshop') {
      const selected = currentAnswers.__workshops || [];
      if (workshopMinChoices && selected.length < workshopMinChoices) {
        toast.error(t('form.dynamic.workshops.minError', { count: workshopMinChoices }));
        return false;
      }
      if (workshopMaxChoices && selected.length > workshopMaxChoices) {
        toast.error(t('form.dynamic.workshops.maxError', { count: workshopMaxChoices }));
        return false;
      }
      return true;
    }
    if (currentStep.kind === 'ride') {
      const ride = currentAnswers.__ride || {};
      if (ride.mode === 'offer' && !(Number(ride.seats) > 0)) {
        toast.error(t('form.dynamic.rideSeatsRequired'));
        return false;
      }
      if ((ride.mode === 'offer' || ride.mode === 'need') && !(ride.phone || '').trim()) {
        toast.error(t('form.dynamic.rideWhatsappRequired'));
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
      toast.error(t('form.dynamic.fillRequiredBeforeContinue'));
      return false;
    }
  };

  const addPerson = () => {
    if (!validateCurrentPerson()) return;
    setPeople((prev) => [...prev, currentAnswers]);
    setAnswers({});
    setErrors({});
    setStepIndex(0);
    toast.success(t('form.dynamic.personAdded'));
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
      toast.info(t('form.dynamic.cartRestored'));
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
    toast.info(t('form.dynamic.createAccountToFinish'));
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

    const registrations = [...people, currentAnswers].map((personAnswers) => ({
      answers: prefillEnabled ? { ...personAnswers, __noPrefill: noPrefill } : personAnswers,
    }));

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
      toast.error(t('form.dynamic.addAtLeastOne'));
      return;
    }
    if (!paymentMethod) {
      toast.error(t('form.dynamic.choosePaymentMethod'));
      return;
    }

    const registrations = people.map((personAnswers) => ({
      answers: {
        ...personAnswers,
        __refundProtection: refundProtectionEnabled && protectionOpted,
        ...(prefillEnabled ? { __noPrefill: noPrefill } : {}),
      },
    }));

    setSubmitting(true);
    try {
      const result = await createGenericCheckout({
        registrations,
        paymentMethod,
        boletoInstallments,
        donation: Number(donation) || 0,
        couponCode: appliedCoupon?.code || null,
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
        toast.error(t('form.dynamic.paymentFailed'));
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
    setNoPrefill(false);
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
              <h2>{t('form.dynamic.registrationsClosedTitle')}</h2>
              <p className="mt-3">{t('form.dynamic.registrationsClosedText')}</p>
              <button
                className="btn btn-teal-blue mt-3"
                onClick={() => navigate(isLoggedIn ? '/minha-conta' : '/entrar')}
              >
                {isLoggedIn ? t('form.dynamic.goToMyAccount') : t('form.dynamic.loginToMyAccount')}
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
                <h2>{t('form.dynamic.boletosGeneratedTitle')}</h2>
                <p className="mt-3">
                  {t('form.dynamic.boletoResultPart1')}<b>{t('form.dynamic.firstBoleto')}</b>{t('form.dynamic.boletoResultPart2')}
                </p>
              </div>
              <BoletoList boletos={boletoResult} />
              <div className="text-center d-flex flex-column align-items-center gap-2">
                {calendarUrl && (
                  <a className="btn btn-outline-teal-blue mt-3" href={calendarUrl} target="_blank" rel="noopener noreferrer">
                    Adicionar ao Google Agenda
                  </a>
                )}
                <button className="btn btn-outline-teal-blue mt-3" onClick={() => navigate('/minhas-inscricoes')}>
                  {t('form.dynamic.viewMyRegistrations')}
                </button>
                <button className="btn btn-teal-blue" onClick={restart}>
                  {t('form.dynamic.backToStart')}
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
                <h2>{t('form.dynamic.pixTitle')}</h2>
                <p className="mt-3">{t('form.dynamic.pixInstructions')}</p>
                {pixResult.qr_code_url && (
                  <img
                    src={pixResult.qr_code_url}
                    alt={t('form.dynamic.pixQrAlt')}
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
                        toast.success(t('form.dynamic.pixCodeCopied'));
                      }}
                    >
                      {t('form.dynamic.copyPixCode')}
                    </button>
                  </div>
                )}
                <div className="text-center d-flex flex-column align-items-center gap-2 mt-4">
                  {calendarUrl && (
                    <a className="btn btn-outline-teal-blue" href={calendarUrl} target="_blank" rel="noopener noreferrer">
                      Adicionar ao Google Agenda
                    </a>
                  )}
                  <button className="btn btn-outline-teal-blue" onClick={() => navigate('/minhas-inscricoes')}>
                    {t('form.dynamic.viewMyRegistrations')}
                  </button>
                  <button className="btn btn-teal-blue" onClick={restart}>
                    {t('form.dynamic.backToStart')}
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
              <h2>{t('form.dynamic.submittedTitle')}</h2>
              <p className="mt-3">{t('form.dynamic.submittedText')}</p>
              <div className="d-flex flex-column align-items-center gap-2">
                <button className="btn btn-outline-teal-blue mt-3" onClick={() => navigate('/minhas-inscricoes')}>
                  {t('form.dynamic.viewMyRegistrations')}
                </button>
                <button className="btn btn-teal-blue" onClick={restart}>
                  {t('form.dynamic.backToStart')}
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
          <p className="text-center my-5">{t('form.dynamic.noFormConfigured')}</p>
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
                              {top.speaker ? ` • ${t('form.dynamic.speakerLabel')} ${top.speaker}` : ''}
                            </span>
                          )}
                        </span>
                        {top.registrationsDeadline && (
                          <span className="d-flex gap-3 align-items-center justify-content-center">
                            <Icons className="flex-shrink-0" typeIcon="simple-info" iconSize={35} fill={iconColor} />
                            <span>
                              {t('form.dynamic.registrationsUntil')}{' '}
                              <em>
                                <b>{top.registrationsDeadline}</b>
                              </em>{' '}
                              {t('form.dynamic.orUntilSoldOut')}
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
                        <h4 className="mb-4 fw-bold">{t('form.dynamic.importantInfo')}</h4>
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

  const showPrefillBanner = Boolean(
    prefillEnabled && isLoggedIn && prefillSource && currentStep?.kind === 'section',
  );

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
            {showPrefillBanner && (
              <div
                className="dynamic-form__prefill mb-3 p-3 d-flex flex-wrap gap-2 align-items-center justify-content-between"
                style={{ border: '1px solid #e6e8eb', borderRadius: '0.5rem' }}
              >
                <span className="d-flex align-items-center gap-2">
                  <Icons typeIcon="simple-info" iconSize={22} fill={iconColor} />
                  {t('form.dynamic.prefill.bannerText')}
                </span>
                <Button variant="outline-teal-blue" size="sm" onClick={applyPrefill}>
                  {t('form.dynamic.prefill.useMyData')}
                </Button>
              </div>
            )}
            {isReview ? (
              <FormStepLayout
                title={people.length ? t('form.dynamic.reviewTitlePerson', { number: people.length + 1 }) : t('form.dynamic.review')}
                description={
                  paymentEnabled
                    ? t('form.dynamic.reviewDescCart')
                    : t('form.dynamic.reviewDescNoPayment')
                }
                footer={
                  <>
                    <Button variant="light" size="lg" onClick={goBack} disabled={submitting}>
                      {t('form.dynamic.back')}
                    </Button>
                    {paymentEnabled ? (
                      <Button variant="warning" size="lg" onClick={commitAndGoToCart} disabled={submitting}>
                        {t('form.dynamic.continue')}
                      </Button>
                    ) : (
                      <div className="d-flex gap-2">
                        <Button variant="outline-warning" size="lg" onClick={addPerson} disabled={submitting}>
                          {t('form.dynamic.addPerson')}
                        </Button>
                        <Button variant="warning" size="lg" onClick={handleSubmit} disabled={submitting}>
                          {submitting ? t('form.dynamic.sending') : t('form.dynamic.sendCount', { count: people.length + 1 })}
                        </Button>
                      </div>
                    )}
                  </>
                }
              >
                {people.length > 0 && (
                  <p className="text-muted">
                    {t('form.dynamic.peopleAddedNote', { count: people.length, next: people.length + 1 })}
                  </p>
                )}
                <div className="dynamic-form__review">
                  {sections.map((sec) => (
                    <div key={sec.name} className="mb-4">
                      <h5>{sec.name}</h5>
                      {sec.fields.map((field) => (
                        <div key={field.key} className="d-flex justify-content-between border-bottom py-2">
                          <span className="fw-bold">{field.label}</span>
                          <span>{displayValue(field, currentAnswers[field.key], t)}</span>
                        </div>
                      ))}
                    </div>
                  ))}

                  {workshopsEnabled && (currentAnswers.__workshops || []).length > 0 && (
                    <div className="mb-4">
                      <h5>{t('form.dynamic.workshops.stepTitle')}</h5>
                      {(currentAnswers.__workshops || []).map((id) => {
                        const workshop = workshopById.get(id);
                        if (!workshop) return null;
                        return (
                          <div key={id} className="d-flex justify-content-between border-bottom py-2">
                            <span className="fw-bold">{workshop.title}</span>
                            <span>
                              {Number(workshop.price || 0) === 0
                                ? t('form.dynamic.workshops.free')
                                : formatPrice(workshop.price)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {paymentEnabled && (
                    <div className="mb-4">
                      <h5>{t('form.dynamic.packageLabel')}</h5>
                      {packageCategories.map((cat) => {
                        const sel = (currentAnswers.__package || {})[cat.id] || [];
                        return packageProducts
                          .filter((p) => sel.includes(p.id))
                          .map((p) => (
                            <div key={p.id} className="d-flex justify-content-between border-bottom py-2">
                              <span className="fw-bold cart-item__product">
                                {p.iconKey && <Icons typeIcon={p.iconKey} iconSize={16} fill={iconColor} />}
                                {cat.name}: {p.name}
                              </span>
                              <span>{formatPrice(productPrice(p, ageRules, age))}</span>
                            </div>
                          ));
                      })}
                      {registrationFee > 0 && (
                        <div className="d-flex justify-content-between border-bottom py-2">
                          <span className="fw-bold">{t('form.dynamic.registrationFeeLabel')}</span>
                          <span>{formatPrice(registrationFee)}</span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between py-2">
                        <span className="fw-bold">{t('form.dynamic.total')}</span>
                        <b>{formatPrice(personTotal(currentAnswers))}</b>
                      </div>
                    </div>
                  )}
                </div>
                {prefillEnabled && (
                  <Form.Check
                    type="checkbox"
                    id="no-prefill-optout"
                    className="mt-3"
                    label={t('form.dynamic.prefill.optOutLabel')}
                    checked={noPrefill}
                    onChange={(e) => setNoPrefill(e.target.checked)}
                  />
                )}
              </FormStepLayout>
            ) : currentStep.kind === 'cart' ? (
              <div className="dynamic-cart">
                <Row>
                  <Col xs={12} xl={8} className="mb-2 px-0 px-lg-2">
                    <Card className="h-100">
                      <Card.Body>
                        <Card.Title>{t('form.dynamic.cart')}</Card.Title>
                        {people.length === 0 ? (
                          <div className="empty-cart">
                            <Icons typeIcon="cart" iconSize={48} fill="#ced4da" />
                            <p>{t('form.dynamic.emptyCart')}</p>
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
                                      <b>{person.nome || t('form.dynamic.personFallback', { number: personIndex + 1 })}</b>
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
                                            <p className="cart-item__product">
                                              {p.iconKey && <Icons typeIcon={p.iconKey} iconSize={18} fill={iconColor} />}
                                              {p.name}
                                            </p>
                                          </div>
                                        </div>
                                      ));
                                  })}
                                  {workshopsEnabled &&
                                    (person.__workshops || []).map((id) => {
                                      const workshop = workshopById.get(id);
                                      if (!workshop) return null;
                                      return (
                                        <div key={id} className="cart-item">
                                          <div className="item-info mb-3">
                                            <div className="d-flex justify-content-between">
                                              <h5>{t('form.dynamic.workshops.stepTitle')}:</h5>
                                              <h5>
                                                {Number(workshop.price || 0) === 0
                                                  ? t('form.dynamic.workshops.free')
                                                  : formatPrice(workshop.price)}
                                              </h5>
                                            </div>
                                            <p className="cart-item__product">{workshop.title}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  <div className="packages-horizontal-line-cart"></div>
                                  <h5 className="cart-user-total fw-bold d-flex justify-content-between">
                                    {t('form.dynamic.totalPerPerson')} <span>{formatPrice(personTotal(person))}</span>
                                  </h5>
                                </Card.Body>
                              </Card>
                            );
                          })
                        )}
                        <div className="text-center">
                          <Button variant="outline-secondary" className="plus-camper-button" size="lg" onClick={addCamper}>
                            <Icons typeIcon="plus" iconSize={25} fill="#6c757d" /> &nbsp;{t('form.dynamic.addRegistrant')}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col xs={12} xl={4} className="px-0 px-lg-2">
                    <Card className="mb-4">
                      <Card.Body>
                        <Card.Title>{t('form.dynamic.summary')}</Card.Title>
                        <div className="packages-horizontal-line-cart"></div>
                        <div className="summary">
                          {registrationFee > 0 && (
                            <div className="summary-individual-base">
                              <div className="d-flex align-items-center gap-1">
                                <h5 className="summary-individual-base-label mb-0">{t('form.dynamic.registrationFeeColon')}</h5>
                                <Tips
                                  classNameWrapper="mt-0"
                                  placement="top"
                                  typeIcon="info"
                                  size={15}
                                  color="#7f7878"
                                  text={t('form.dynamic.registrationFeeTooltip')}
                                />
                              </div>
                              <h5 className="mb-0">{formatPrice(registrationFee)}</h5>
                            </div>
                          )}
                          <div className="summary-total-package">
                            <h5 className="summary-total-package-label mb-0">{t('form.dynamic.packageTotalColon')}</h5>
                            <h5 className="mb-0">{formatPrice(packagesTotal)}</h5>
                          </div>
                          {packagesDiscountTotal > 0 && (
                            <div className="summary-total-package">
                              <h5 className="summary-total-package-label mb-0">{t('form.dynamic.discountColon')}</h5>
                              <h5 className="mb-0 summary-discount-value">-{formatPrice(packagesDiscountTotal)}</h5>
                            </div>
                          )}
                          {groupDiscountAmount > 0 && (
                            <div className="summary-total-package">
                              <h5 className="summary-total-package-label mb-0">{t('form.dynamic.groupDiscount', { percent: groupDiscountPercent })}</h5>
                              <h5 className="mb-0 summary-discount-value">-{formatPrice(groupDiscountAmount)}</h5>
                            </div>
                          )}
                          {couponCodesEnabled && appliedCoupon && couponDiscount > 0 && (
                            <div className="summary-total-package">
                              <h5 className="summary-total-package-label mb-0">
                                Cupom {appliedCoupon.code}
                              </h5>
                              <h5 className="mb-0 summary-discount-value">-{formatPrice(couponDiscount)}</h5>
                            </div>
                          )}
                          {couponCodesEnabled && (
                            <div className="summary-coupon mt-2 mb-2">
                              {appliedCoupon ? (
                                <Button variant="link" size="sm" className="p-0" onClick={handleRemoveCoupon}>
                                  Remover cupom
                                </Button>
                              ) : (
                                <div className="d-flex gap-2 align-items-start">
                                  <Form.Control
                                    type="text"
                                    placeholder="Cupom de desconto"
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                  />
                                  <SpinnerButton
                                    variant="outline-teal-blue"
                                    onClick={handleApplyCoupon}
                                    loading={couponChecking}
                                  >
                                    Aplicar
                                  </SpinnerButton>
                                </div>
                              )}
                            </div>
                          )}
                          {refundProtectionEnabled && protectionPreview > 0 && (
                            <div className="summary-protection mt-3 mb-2 p-3" style={{ border: '1px solid #e6e8eb', borderRadius: '0.5rem' }}>
                              <div className="fw-bold mb-1">Proteção da Inscrição</div>
                              <div className="text-secondary small mb-2">
                                Se não puder comparecer por algum imprevisto, você pode solicitar o reembolso do
                                ingresso. Adicione por apenas uma fração do ingresso.
                              </div>
                              <Form.Check
                                type="radio"
                                id="refund-protection-yes"
                                name="refund-protection"
                                label={`Garanta seu reembolso por ${formatPrice(protectionPreview)}`}
                                checked={protectionOpted}
                                onChange={() => setProtectionOpted(true)}
                              />
                              <Form.Check
                                type="radio"
                                id="refund-protection-no"
                                name="refund-protection"
                                label="Não quero proteger minha inscrição"
                                checked={!protectionOpted}
                                onChange={() => setProtectionOpted(false)}
                              />
                            </div>
                          )}
                          {protectionTotal > 0 && (
                            <div className="summary-total-package">
                              <h5 className="summary-total-package-label mb-0">Proteção da inscrição</h5>
                              <h5 className="mb-0">+{formatPrice(protectionTotal)}</h5>
                            </div>
                          )}
                          <div className="packages-horizontal-line-cart"></div>
                          <div className="summary-total-geral mb-3">
                            <h5 className="fw-bold mb-0">{t('form.dynamic.totalColon')}</h5>
                            <h5 className="fw-bold mb-0">{formatPrice(payableTotal)}</h5>
                          </div>
                          <div className="summary-buttons d-grid gap-3">
                            {people.length > 0 && (
                              <Button variant="teal-blue" size="lg" onClick={goToPayment}>
                                {t('form.dynamic.payment')}
                              </Button>
                            )}
                            {grandTotal > 0 && (
                              <Button variant="outline-secondary" onClick={() => setShowSimulator(true)}>
                                <Icons typeIcon="money" iconSize={20} fill="#6c757d" /> {t('form.dynamic.simulateFees')}
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
                  base={payableTotal}
                  fees={DEFAULT_FEES}
                  maxBoletoInstallments={boletoEnabled ? boletoMaxInstallments : 1}
                  maxCardInstallments={cardMaxInstallments}
                  showPix={pixEnabled}
                  showCard={cardEnabled}
                  showBoleto={boletoEnabled}
                />
              </div>
            ) : currentStep.kind === 'payment' ? (
              <FormStepLayout
                title={t('form.dynamic.payment')}
                footer={
                  <>
                    <Button variant="light" size="lg" onClick={goBack} disabled={submitting}>
                      {t('form.dynamic.back')}
                    </Button>
                    <SpinnerButton variant="warning" size="lg" onClick={handlePayment} loading={submitting}>{t('form.dynamic.advance')}</SpinnerButton>
                  </>
                }
              >
                <div className="dynamic-form__payment">
                  <p>
                    {t('form.dynamic.paymentWarnPart1')}<b>{t('form.dynamic.attention')}</b>{t('form.dynamic.paymentWarnPart2')}<b>{t('form.dynamic.important')}</b>{' '}
                    <i>{t('form.dynamic.noReceiptNeeded')}</i>{t('form.dynamic.paymentWarnPart3')}
                  </p>
                  <p className="payment-heading fw-bold mt-4 mb-2">{t('form.dynamic.choosePaymentHeading')}</p>
                  <div className="payment-grid">
                    {PAYMENT_OPTIONS.filter((option) => {
                      if (option.key === 'ticket') return boletoEnabled;
                      if (option.key === 'pix') return pixEnabled;
                      if (option.key === 'creditCard') return cardEnabled;
                      return true;
                    }).map((option) => {
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
                          <span className="payment-card__title">{t(`form.dynamic.pm_${option.key}_label`)}</span>
                          <span className="payment-card__desc">{t(`form.dynamic.pm_${option.key}_desc`)}</span>
                          {active && <span className="payment-card__badge">{t('form.dynamic.selected')}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {paymentMethod === 'ticket' && boletoMaxInstallments >= 2 && (
                    <div className="mt-4">
                      <Form.Label className="fw-bold">{t('form.dynamic.installmentsQuestion')}</Form.Label>
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
                        {boletoInstallments === 1
                          ? t('form.dynamic.boletoGeneratedSingular', { count: boletoInstallments })
                          : t('form.dynamic.boletoGeneratedPlural', { count: boletoInstallments })}
                      </p>
                      <p className="text-secondary small mt-2 mb-0">
                        {t('form.dynamic.boletoWarnPart1')}<b>{t('form.dynamic.lastInstallment')}</b>{t('form.dynamic.boletoWarnPart2')}<b>{t('form.dynamic.lessThanDays', { days: boletoMinDaysBeforeEvent })}</b>{t('form.dynamic.boletoWarnPart3')}<b>{t('form.dynamic.autoAnticipated')}</b>{t('form.dynamic.boletoWarnPart4')}
                      </p>
                    </div>
                  )}

                  <Form.Group className="mt-4" controlId="donation-input">
                    <Form.Label className="fw-bold">{t('form.dynamic.donationQuestion')}</Form.Label>
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
                      {t('form.dynamic.donationHelp')}
                    </Form.Text>
                  </Form.Group>

                  <p className="text-muted mt-4">
                    {t('form.dynamic.registrationsCount', { count: people.length })}
                    {Number(donation) > 0 && t('form.dynamic.plusDonation', { price: formatPrice(Number(donation)) })} · {t('form.dynamic.total')}{' '}
                    <b>{formatPrice(payableTotal + (Number(donation) || 0))}</b>
                  </p>
                </div>
              </FormStepLayout>
            ) : currentStep.kind === 'package' ? (
              <div className="dynamic-package">
                {storeDeliveryNote && <p className="dynamic-package__delivery-note">{storeDeliveryNote}</p>}
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
                    {t('form.dynamic.back')}
                  </Button>
                  <Button variant="warning" size="lg" onClick={goNext}>
                    {wizardSteps[stepIndex + 1]?.kind === 'review' ? t('form.dynamic.reviewAction') : t('form.dynamic.advance')}
                  </Button>
                </div>
              </div>
            ) : currentStep.kind === 'workshop' ? (
              <div className="dynamic-package">
                <WorkshopStep
                  workshops={workshops}
                  minChoices={workshopMinChoices}
                  maxChoices={workshopMaxChoices}
                  value={currentAnswers.__workshops}
                  onChange={(sel) => setValue('__workshops', sel)}
                />
                <div className="form-step__nav dynamic-package__nav">
                  <Button variant="light" size="lg" onClick={goBack} disabled={stepIndex === 0}>
                    {t('form.dynamic.back')}
                  </Button>
                  <Button variant="warning" size="lg" onClick={goNext}>
                    {wizardSteps[stepIndex + 1]?.kind === 'review' ? t('form.dynamic.reviewAction') : t('form.dynamic.advance')}
                  </Button>
                </div>
              </div>
            ) : currentStep.kind === 'ride' ? (
              <FormStepLayout
                title={currentStep.section?.name || t('form.dynamic.rideLabel')}
                onBack={stepIndex === 0 ? undefined : goBack}
                onNext={goNext}
                nextLabel={wizardSteps[stepIndex + 1]?.kind === 'review' ? t('form.dynamic.reviewAction') : t('form.dynamic.advance')}
              >
                <RideStep value={currentAnswers.__ride} onChange={(sel) => setValue('__ride', sel)} />
              </FormStepLayout>
            ) : (
              <FormStepLayout
                title={currentStep.section.name}
                onBack={stepIndex === 0 ? undefined : goBack}
                onNext={goNext}
                nextLabel={wizardSteps[stepIndex + 1]?.kind === 'review' ? t('form.dynamic.reviewAction') : t('form.dynamic.advance')}
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
