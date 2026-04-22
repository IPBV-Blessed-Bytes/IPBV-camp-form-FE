import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isValid } from 'date-fns';
import { toast } from 'react-toastify';
import { useCart } from 'react-use-cart';
import PropTypes from 'prop-types';

import { USER_STORAGE_KEY, USER_STORAGE_ROLE } from '@/config';
import { enumSteps, initialValues } from '@/utils/constants';
import { isAdminPath, shouldRenderForm } from '@/utils/pathname';
import { calculateRegistrationFee } from '@/utils/calculateRegistrationFee';
import { FORM_STORAGE_KEYS, clearTempData, getTempData, saveTempData } from '@/utils/formStorage';
import { getPackageCount, getTotalRegistrations } from '@/services/packages';
import { createCheckout } from '@/services/checkout';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';
import calculateAge, { initBaseDate } from '@/Pages/Packages/utils/calculateAge';
import getDiscountedProducts from '@/Pages/Packages/utils/getDiscountedProducts';
import { products } from '@/Pages/Packages/utils/products';

const SKIP_PERSIST_SECTIONS = ['personalInformation', 'contact', 'package', 'extraMeals'];

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

const sanitizeForms = (forms) =>
  forms.map(({ personalInformation, contact, ...rest }) => ({
    ...rest,
    personalInformation: { ...personalInformation },
    contact,
  }));

const isUserValid = (user) =>
  Boolean(user?.personalInformation?.name?.trim() || user?.personalInformation?.birthday?.trim());

export const FormStateContext = createContext(null);

export const FormStateProvider = ({ children, formContextCloseForm }) => {
  const navigate = useNavigate();
  const { items } = useCart();
  const { formContext, isLoggedIn } = useContext(AuthContext);

  const [steps, setSteps] = useState(enumSteps.home);
  const [formValues, setFormValues] = useState(() => {
    const stored = sessionStorage.getItem(FORM_STORAGE_KEYS.savedUsers);
    return stored ? JSON.parse(stored) : initialValues;
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [availablePackages, setAvailablePackages] = useState({});
  const [totalRegistrations, setTotalRegistrations] = useState({});
  const [totalSeats, setTotalSeats] = useState({});
  const [totalBusVacancies, setTotalBusVacancies] = useState({});
  const [totalPackages, setTotalPackages] = useState({});
  const [usedPackages, setUsedPackages] = useState();
  const [usedValidPackages, setUsedValidPackages] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(undefined);
  const [withFood, setWithFood] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [personData, setPersonData] = useState(null);
  const [currentFormIndex, setCurrentFormIndex] = useState(() => {
    const stored = sessionStorage.getItem(FORM_STORAGE_KEYS.currentFormIndex);
    return stored !== null ? Number(stored) : 0;
  });
  const [preFill, setPreFill] = useState(true);
  const [highestStepReached, setHighestStepReached] = useState(enumSteps.home);
  const [backStepFlag, setBackStepFlag] = useState(true);
  const [basePriceTotal, setBasePriceTotal] = useState(0);
  const [packageCount, setPackageCount] = useState(null);

  const windowPathname = window.location.pathname;
  const adminPathname = isAdminPath(windowPathname);
  const formPath = shouldRenderForm(windowPathname);
  const isNotSuccessPathname = windowPathname !== '/sucesso';
  const effectiveFormContext = formContextCloseForm === 'form-on' ? formContextCloseForm : formContext;

  const userRole = localStorage.getItem(USER_STORAGE_ROLE);
  const savedLoggedUsername = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
  const loggedUsername = savedLoggedUsername?.split('@')[0];

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const data = await getPackageCount();
        setPackageCount(data);
        setAvailablePackages(data);
        setTotalSeats(data?.totalSeats || 0);
        setTotalBusVacancies(data?.totalBusVacancies || 0);
        setTotalPackages(data?.totalPackages || {});
        setUsedPackages(data?.usedPackages || {});
        setUsedValidPackages(data?.usedValidPackages || {});
      } catch (error) {
        console.error('Erro ao buscar pacotes:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTotalRegistrations = async () => {
      try {
        const data = await getTotalRegistrations();
        setTotalRegistrations(data);
      } catch (error) {
        console.error(
          error.message === 'Request failed with status code 503'
            ? 'Banco de dados fora do ar. Tente novamente mais tarde'
            : error.message,
        );
      }
    };

    fetchPackages();
    fetchTotalRegistrations();
    initBaseDate();
  }, []);

  useEffect(() => {
    if (!isLoggedIn && adminPathname) {
      navigate(effectiveFormContext === 'maintenance' ? '/dev' : '/admin');
    }
  }, [isLoggedIn, adminPathname, effectiveFormContext, navigate]);

  useEffect(() => {
    sessionStorage.setItem(FORM_STORAGE_KEYS.savedUsers, JSON.stringify(formValues));
  }, [formValues]);

  useEffect(() => {
    sessionStorage.setItem(FORM_STORAGE_KEYS.currentFormIndex, String(currentFormIndex));
  }, [currentFormIndex]);

  useEffect(() => {
    const storedList = sessionStorage.getItem(FORM_STORAGE_KEYS.discountList);
    if (!storedList) return;

    const parsedList = JSON.parse(storedList);
    const userDiscount = Number(parsedList[currentFormIndex]) || 0;

    setDiscount(userDiscount);
    setHasDiscount(userDiscount !== 0);
  }, [currentFormIndex]);

  const currentFormValues = formValues[currentFormIndex] || {};

  const updatedAge = getTempData();
  const birthday = updatedAge.personalInformation?.birthday;
  const age = birthday ? calculateAge(birthday) : null;

  const existingCartKey = Object.keys(sessionStorage).find((key) => key === `cartItems${currentFormIndex}`);
  const cartKey = existingCartKey || `cartItems${currentFormIndex}`;

  const hasFood = items.some((item) => products.find((p) => p.id === item.id && p.category === 'Alimentação'));

  const handleAdminClick = useCallback(() => navigate('/admin'), [navigate]);

  const handlePersonData = useCallback((data) => setPersonData(data), []);

  const handleUpdateTotalSeats = useCallback((value) => setTotalSeats(value), []);
  const handleUpdateTotalBusVacancies = useCallback((value) => setTotalBusVacancies(value), []);
  const handleUpdateTotalPackages = useCallback((value) => setTotalPackages(value), []);

  const handleDiscountChange = useCallback((discountValue, userIndex) => {
    const currentDiscounts = JSON.parse(sessionStorage.getItem(FORM_STORAGE_KEYS.discountList) || '[]');
    currentDiscounts[userIndex] = Number(discountValue);
    sessionStorage.setItem(FORM_STORAGE_KEYS.discountList, JSON.stringify(currentDiscounts));

    setDiscount(discountValue);
    setHasDiscount(Number(discountValue) !== 0);
  }, []);

  const resetFormValues = useCallback(() => {
    setFormValues(initialValues);
    setCurrentFormIndex(0);
  }, []);
  const resetFormSubmitted = useCallback(() => setFormSubmitted(false), []);
  const handlePreFill = useCallback((value) => setPreFill(Boolean(value)), []);
  const handleBasePriceChange = useCallback((value) => setBasePriceTotal(value), []);

  const updateFormValues = useCallback(
    (sectionKey) => (newData, callback) => {
      const isFinalReview = sectionKey === 'finalReview';
      const shouldSkipPersist = SKIP_PERSIST_SECTIONS.includes(sectionKey) && !isFinalReview;

      if (shouldSkipPersist) {
        saveTempData(sectionKey, newData);
        if (typeof callback === 'function') setTimeout(callback, 0);
        return;
      }

      const sessionData = getTempData();

      setFormValues((prev) => {
        const updated = [...prev];
        const previous = prev[currentFormIndex] || {};

        if (isFinalReview) {
          updated[currentFormIndex] = {
            ...previous,
            ...sessionData,
            ...(typeof newData === 'object' && newData !== null ? newData : {}),
          };
          clearTempData();
        } else {
          updated[currentFormIndex] = { ...previous, [sectionKey]: newData };
        }

        return updated;
      });

      if (typeof callback === 'function') setTimeout(callback, 0);
    },
    [currentFormIndex],
  );

  const handleAddNewUser = useCallback(() => {
    sessionStorage.removeItem(FORM_STORAGE_KEYS.previousUserData);
    setFormValues((prev) => {
      const validUsers = prev.filter(isUserValid);
      const updated = [...validUsers, initialValues[0]];
      setCurrentFormIndex(updated.length - 1);
      return updated;
    });
    setSteps(enumSteps.personalData);
    scrollTop();
  }, []);

  const prepareNewDraft = useCallback(() => {
    sessionStorage.removeItem(FORM_STORAGE_KEYS.previousUserData);
    setFormValues((prev) => {
      const last = prev[prev.length - 1];
      if (last && !isUserValid(last)) {
        setCurrentFormIndex(prev.length - 1);
        return prev;
      }
      setCurrentFormIndex(prev.length);
      return [...prev, initialValues[0]];
    });
  }, []);

  const initialStep = useCallback(() => {
    setSteps(enumSteps.home);
    scrollTop();
  }, []);

  const nextStep = useCallback(
    (skipToReview = false) => {
      setSteps((current) => {
        if (current >= enumSteps.success) return current;
        const next = skipToReview && current === enumSteps.packages ? enumSteps.finalReview : current + 1;
        setHighestStepReached((prev) => Math.max(prev, next));
        return next;
      });
      setWithFood(skipToReview);
      scrollTop();
    },
    [],
  );

  const goToSuccessPage = useCallback(() => {
    navigate('/sucesso');
    setSteps(enumSteps.success);
    scrollTop();
  }, [navigate]);

  const backStep = useCallback(() => {
    setSteps((current) => {
      if (current === enumSteps.finalReview && withFood) return enumSteps.packages;
      return current > 0 ? current - 1 : current;
    });
    scrollTop();
  }, [withFood]);

  const goToStep = useCallback((step) => {
    setSteps(step);
    scrollTop();
  }, []);

  const goToEditStep = useCallback((index) => {
    setCurrentFormIndex(index);
    setSteps(enumSteps.personalData);
    scrollTop();
  }, []);

  const handleCheckoutResponse = useCallback(
    (response) => {
      const checkoutUrl = response.data.payment_url;
      const checkoutStatus = response.data.checkout_status;
      setStatus('loaded');

      if (checkoutUrl && checkoutStatus === 'Checkout generated') {
        window.open(checkoutUrl, '_self');
        toast.success('Redirecionando para pagamento...');
      } else if ([200, 201].includes(response.status)) {
        goToSuccessPage();
        setFormSubmitted(true);
        toast.success('Inscrição validada com sucesso');
      } else if (checkoutStatus === 'Checkout Error') {
        toast.error('Erro ao criar checkout');
      }
    },
    [goToSuccessPage],
  );

  const sendForm = useCallback(
    async (formikValues) => {
      setLoading(true);
      try {
        setStatus('loading');

        const discountList = JSON.parse(sessionStorage.getItem(FORM_STORAGE_KEYS.discountList) || '[]');
        const registrationFeePerUser = basePriceTotal;

        const buildFormPayload = (form, index) => {
          const formBirthday = new Date(form?.personalInformation?.birthday);
          const formAge = isValid(formBirthday) ? calculateAge(formBirthday) : 0;

          const discountedProducts = getDiscountedProducts(formAge);
          const getProductPrice = (id) => discountedProducts.find((p) => p.id === id)?.price || 0;

          const accomodationPrice = getProductPrice(form.package?.accomodation?.id);
          const transportationPrice = getProductPrice(form.package?.transportation?.id);
          const foodPrice = form.package?.food?.id ? getProductPrice(form.package?.food?.id) : 0;
          const extraMealsPrice = Number(form.extraMeals?.totalPrice || 0);
          const registrationFee = calculateRegistrationFee(registrationFeePerUser, formAge);

          const subtotal =
            Number(accomodationPrice) +
            Number(transportationPrice) +
            Number(foodPrice) +
            Number(extraMealsPrice) +
            Number(registrationFee);

          const rawDiscount = Number(discountList[index] || 0);
          const appliedDiscount = Math.min(subtotal, rawDiscount);
          const totalPrice = subtotal - appliedDiscount;

          return {
            ...form,
            package: {
              accomodation: {
                id: form.package?.accomodation?.id || '',
                price: accomodationPrice,
              },
              accomodationName: form.package?.accomodation?.name || '',
              transportation: {
                id: form.package?.transportation?.id || '',
                price: transportationPrice,
              },
              transportationName: form.package?.transportation?.name || '',
              food: {
                id: form.package?.food?.id || '',
                price: foodPrice,
              },
              foodName: form.package?.food?.name || '',
              price: subtotal,
              finalPrice: totalPrice,
            },
            formPayment: formikValues.formPayment || 'nonPaid',
            registrationDate: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
            totalPrice,
            manualRegistration: false,
            appliedDiscount,
          };
        };

        const formsToSend = formValues.map(buildFormPayload);
        const finalPriceCheckout = formsToSend.reduce((acc, curr) => acc + Number(curr.totalPrice || 0), 0);

        const response = await createCheckout({
          forms: sanitizeForms(formsToSend),
          finalPriceCheckout,
        });

        handleCheckoutResponse(response);
      } catch (error) {
        setStatus('error');
        toast.error(error?.response?.data || 'Ocorreu um erro');
      } finally {
        sessionStorage.removeItem(FORM_STORAGE_KEYS.previousUserData);
        sessionStorage.removeItem(FORM_STORAGE_KEYS.savedUsers);
        sessionStorage.removeItem(FORM_STORAGE_KEYS.currentFormIndex);
        setLoading(false);
      }
    },
    [basePriceTotal, formValues, handleCheckoutResponse],
  );

  const value = useMemo(
    () => ({
      adminPathname,
      age,
      availablePackages,
      backStep,
      backStepFlag,
      cartKey,
      currentFormIndex,
      currentFormValues,
      discount,
      effectiveFormContext,
      formContext,
      formContextCloseForm,
      formPath,
      formSubmitted,
      formValues,
      goToEditStep,
      goToStep,
      goToSuccessPage,
      handleAddNewUser,
      handleAdminClick,
      handleBasePriceChange,
      handleDiscountChange,
      handlePersonData,
      handlePreFill,
      handleUpdateTotalBusVacancies,
      handleUpdateTotalPackages,
      handleUpdateTotalSeats,
      hasDiscount,
      hasFood,
      highestStepReached,
      initialStep,
      isNotSuccessPathname,
      loading,
      loggedUsername,
      nextStep,
      packageCount,
      personData,
      preFill,
      prepareNewDraft,
      resetFormSubmitted,
      resetFormValues,
      sendForm,
      setBackStepFlag,
      setFormValues,
      setPreFill,
      status,
      steps,
      totalBusVacancies,
      totalPackages,
      totalRegistrations,
      totalSeats,
      updateFormValues,
      usedPackages,
      usedValidPackages,
      userRole,
    }),
    [
      adminPathname,
      age,
      availablePackages,
      backStep,
      backStepFlag,
      cartKey,
      currentFormIndex,
      currentFormValues,
      discount,
      effectiveFormContext,
      formContext,
      formContextCloseForm,
      formPath,
      formSubmitted,
      formValues,
      goToEditStep,
      goToStep,
      goToSuccessPage,
      handleAddNewUser,
      handleAdminClick,
      handleBasePriceChange,
      handleDiscountChange,
      handlePersonData,
      handlePreFill,
      handleUpdateTotalBusVacancies,
      handleUpdateTotalPackages,
      handleUpdateTotalSeats,
      hasDiscount,
      hasFood,
      highestStepReached,
      initialStep,
      isNotSuccessPathname,
      loading,
      loggedUsername,
      nextStep,
      packageCount,
      personData,
      preFill,
      prepareNewDraft,
      resetFormSubmitted,
      resetFormValues,
      sendForm,
      status,
      steps,
      totalBusVacancies,
      totalPackages,
      totalRegistrations,
      totalSeats,
      updateFormValues,
      usedPackages,
      usedValidPackages,
      userRole,
    ],
  );

  return <FormStateContext.Provider value={value}>{children}</FormStateContext.Provider>;
};

FormStateProvider.propTypes = {
  children: PropTypes.node,
  formContextCloseForm: PropTypes.string,
};

export const useFormState = ({ optional = false } = {}) => {
  const context = useContext(FormStateContext);
  if (!context && !optional) {
    throw new Error('useFormState must be used within a FormStateProvider');
  }
  return context;
};
