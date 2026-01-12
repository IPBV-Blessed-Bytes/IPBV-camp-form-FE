import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isValid } from 'date-fns';
import getDiscountedProducts from '@/Pages/Packages/utils/getDiscountedProducts';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import { products } from '@/Pages/Packages/utils/products';
import { useCart } from 'react-use-cart';

import { BASE_URL, USER_STORAGE_KEY, USER_STORAGE_ROLE } from '@/config';
import { enumSteps, initialValues } from '@/utils/constants';
import { isAdminPath, shouldRenderForm } from '@/utils/pathname';
import { calculateRegistrationFee } from '@/utils/calculateRegistrationFee';
import fetcher from '@/fetchers/fetcherWithCredentials';

import useAuth from '@/hooks/useAuth';
import calculateAge from '../Pages/Packages/utils/calculateAge';

import FormRoutes from '.';

const RoutesValidations = ({ formContextCloseForm }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { items } = useCart();

  const [steps, setSteps] = useState(enumSteps.home);
  const [formValues, setFormValues] = useState(() => {
    const stored = sessionStorage.getItem('savedUsers');
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
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [preFill, setPreFill] = useState(true);
  const [highestStepReached, setHighestStepReached] = useState(enumSteps.home);
  const [backStepFlag, setBackStepFlag] = useState(true);
  const [basePriceTotal, setBasePriceTotal] = useState(0);
  const [packageCount, setPackageCount] = useState(null);

  const userRole = localStorage.getItem(USER_STORAGE_ROLE);
  const savedLoggedUsername = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
  const loggedUsername = savedLoggedUsername?.split('@')[0];

  const windowPathname = window.location.pathname;
  const adminPathname = isAdminPath(windowPathname);
  const formPath = shouldRenderForm(windowPathname);

  const isNotSuccessPathname = windowPathname !== '/sucesso';

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);

      try {
        const response = await fetcher.get(`${BASE_URL}/package-count`);
        setPackageCount(response.data);
        setAvailablePackages(response.data);
        setTotalSeats(response.data?.totalSeats || 0);
        setTotalBusVacancies(response.data?.totalBusVacancies || 0);
        setTotalPackages(response.data?.totalPackages || {});
        setUsedPackages(response.data?.usedPackages || {});
        setUsedValidPackages(response.data?.usedValidPackages || {});
      } catch (error) {
        console.error('Erro ao buscar pacotes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    const fetchTotalRegistrations = async () => {
      try {
        const response = await fetcher.get(`${BASE_URL}/total-registrations`);
        setTotalRegistrations(response.data);
      } catch (error) {
        console.error(
          error.message === 'Request failed with status code 503'
            ? 'Banco de dados fora do ar. Tente novamente mais tarde'
            : error.message,
        );
      }
    };
    fetchTotalRegistrations();
  }, []);

  useEffect(() => {
    if (!isLoggedIn && adminPathname) {
      navigate('/admin');
    }
  }, [isLoggedIn, adminPathname, navigate]);

  useEffect(() => {
    sessionStorage.setItem('savedUsers', JSON.stringify(formValues));
  }, [formValues]);

  const currentFormValues = formValues[currentFormIndex] || {};

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handlePersonData = (data) => {
    setPersonData(data);
  };

  const handleUpdateTotalSeats = (newTotalSeats) => {
    setTotalSeats(newTotalSeats);
  };

  const handleUpdateTotalBusVacancies = (newTotalBusVacancies) => {
    setTotalBusVacancies(newTotalBusVacancies);
  };

  const handleUpdateTotalPackages = (updatedPackages) => {
    setTotalPackages(updatedPackages);
  };

  const handleDiscountChange = (discountValue, userIndex) => {
    const currentDiscounts = JSON.parse(sessionStorage.getItem('discountList') || '[]');

    currentDiscounts[userIndex] = Number(discountValue);

    sessionStorage.setItem('discountList', JSON.stringify(currentDiscounts));

    setDiscount(discountValue);
    setHasDiscount(Number(discountValue) !== 0);
  };

  useEffect(() => {
    const storedList = sessionStorage.getItem('discountList');

    if (storedList !== null) {
      const parsedList = JSON.parse(storedList);
      const userDiscount = Number(parsedList[currentFormIndex]) || 0;

      setDiscount(userDiscount);
      setHasDiscount(userDiscount !== 0);
    }
  }, [currentFormIndex]);

  const resetFormValues = () => setFormValues(initialValues);

  const resetFormSubmitted = () => setFormSubmitted(false);

  const updateFormValues = (sectionKey) => (newData, callback) => {
    const skipPersistSections = ['personalInformation', 'contact', 'package', 'extraMeals'];
    const isFinalReview = sectionKey === 'finalReview';
    const shouldSkipPersist = skipPersistSections.includes(sectionKey) && !isFinalReview;

    if (shouldSkipPersist) {
      saveTempData(sectionKey, newData);

      if (typeof callback === 'function') {
        setTimeout(callback, 0);
      }
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

        sessionStorage.removeItem('formTempData');
      } else {
        updated[currentFormIndex] = {
          ...previous,
          [sectionKey]: newData,
        };
      }

      return updated;
    });

    if (typeof callback === 'function') {
      setTimeout(callback, 0);
    }
  };

  const saveTempData = (key, data) => {
    const existing = JSON.parse(sessionStorage.getItem('formTempData')) || {};
    existing[key] = data;
    sessionStorage.setItem('formTempData', JSON.stringify(existing));
  };

  const getTempData = () => JSON.parse(sessionStorage.getItem('formTempData')) || {};

  const updatedAge = getTempData();

  const birthday = updatedAge.personalInformation?.birthday;

  const age = birthday ? calculateAge(birthday) : null;

  const sanitizeForms = (forms) =>
    forms.map((form) => {
      const { personalInformation, contact } = form;

      const { ...cleanPersonalInfo } = personalInformation;

      return {
        ...form,
        personalInformation: cleanPersonalInfo,
        contact,
      };
    });

  const isUserValid = (user) => {
    const hasName = user?.personalInformation?.name && user.personalInformation.name.trim() !== '';
    const hasBirthday = user?.personalInformation?.birthday && user.personalInformation.birthday.trim() !== '';
    return hasName || hasBirthday;
  };

  const handleAddNewUser = () => {
    sessionStorage.removeItem('previousUserData');
    setFormValues((prev) => {
      const validUsers = prev.filter(isUserValid);
      const updated = [...validUsers, initialValues[0]];
      setCurrentFormIndex(updated.length - 1);
      return updated;
    });
    setSteps(enumSteps.personalData);
    scrollTop();
  };

  const existingCartKey = Object.keys(sessionStorage).find((key) => key === `cartItems${currentFormIndex}`);
  const cartKey = existingCartKey || `cartItems${currentFormIndex}`;

  const initialStep = () => {
    setSteps(enumSteps.home);
    scrollTop();
  };

  const nextStep = (skipToReview = false) => {
    if (steps < enumSteps.success) {
      const next = skipToReview && steps === enumSteps.packages ? enumSteps.finalReview : steps + 1;
      setWithFood(skipToReview);
      setSteps(next);
      scrollTop();
      setHighestStepReached((prev) => Math.max(prev, next));
    }
  };

  const goToSuccessPage = () => {
    navigate('/sucesso');
    setSteps(enumSteps.success);
    scrollTop();
  };

  const backStep = () => {
    if (steps === enumSteps.finalReview && withFood) {
      setSteps(enumSteps.packages);
    } else if (steps > 0) {
      setSteps(steps - 1);
    }
    scrollTop();
  };

  const goToStep = (step) => {
    setSteps(step);
    scrollTop();
  };

  const goToEditStep = (index) => {
    setCurrentFormIndex(index);
    setSteps(enumSteps.personalData);
    scrollTop();
  };

  const handlePreFill = (preFillValue) => {
    if (preFillValue) {
      setPreFill(true);
    } else {
      setPreFill(false);
    }
  };

  const hasFood = items.some((item) => products.find((p) => p.id === item.id && p.category === 'Alimentação'));

  const handleBasePriceChange = (basePriceTotal) => {
    setBasePriceTotal(basePriceTotal);
  };

  const sendForm = async (formikValues) => {
    setLoading(true);
    try {
      setStatus('loading');

      const discountList = JSON.parse(sessionStorage.getItem('discountList') || '[]');
      const registrationFeePerUser = basePriceTotal;

      const buildFormPayload = (form, index) => {
        const birthday = new Date(form?.personalInformation?.birthday);
        const age = isValid(birthday) ? calculateAge(birthday) : 0;

        const discountedProducts = getDiscountedProducts(age);
        const getProductPrice = (id) => discountedProducts.find((p) => p.id === id)?.price || 0;

        const accomodationPrice = getProductPrice(form.package?.accomodation?.id);
        const transportationPrice = getProductPrice(form.package?.transportation?.id);
        const foodPrice = form.package?.food?.id ? getProductPrice(form.package?.food?.id) : 0;
        const extraMealsPrice = Number(form.extraMeals?.totalPrice || 0);
        const registrationFee = calculateRegistrationFee(registrationFeePerUser, age);

        const subtotal =
          Number(accomodationPrice) +
          Number(transportationPrice) +
          Number(foodPrice) +
          Number(extraMealsPrice) +
          Number(registrationFee);

        const rawDiscount = Number(discountList[index] || 0);
        const discount = Math.min(subtotal, rawDiscount);
        const totalPrice = subtotal - discount;
        const appliedDiscount = discount;

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

      const sanitizedForms = sanitizeForms(formsToSend);
      const response = await fetcher.post(`${BASE_URL}/checkout/create`, {
        forms: sanitizedForms,
        finalPriceCheckout,
      });

      handleCheckoutResponse(response);
    } catch (error) {
      setStatus('error');
      toast.error(error?.response?.data || 'Ocorreu um erro');
    } finally {
      sessionStorage.removeItem('previousUserData');
      sessionStorage.removeItem('savedUsers');
      setLoading(false);
    }
  };

  const handleCheckoutResponse = (response) => {
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
  };

  return (
    <FormRoutes
      adminPathname={adminPathname}
      age={age}
      availablePackages={availablePackages}
      backStep={backStep}
      backStepFlag={backStepFlag}
      cartKey={cartKey}
      currentFormIndex={currentFormIndex}
      currentFormValues={currentFormValues}
      discount={discount}
      formContextCloseForm={formContextCloseForm}
      formPath={formPath}
      formSubmitted={formSubmitted}
      formValues={formValues}
      goToEditStep={goToEditStep}
      goToStep={goToStep}
      goToSuccessPage={goToSuccessPage}
      handleAddNewUser={handleAddNewUser}
      handleAdminClick={handleAdminClick}
      handleBasePriceChange={handleBasePriceChange}
      handleDiscountChange={handleDiscountChange}
      handlePersonData={handlePersonData}
      handlePreFill={handlePreFill}
      handleUpdateTotalBusVacancies={handleUpdateTotalBusVacancies}
      handleUpdateTotalPackages={handleUpdateTotalPackages}
      handleUpdateTotalSeats={handleUpdateTotalSeats}
      hasDiscount={hasDiscount}
      hasFood={hasFood}
      highestStepReached={highestStepReached}
      initialStep={initialStep}
      isNotSuccessPathname={isNotSuccessPathname}
      loading={loading}
      loggedUsername={loggedUsername}
      nextStep={nextStep}
      packageCount={packageCount}
      personData={personData}
      preFill={preFill}
      resetFormSubmitted={resetFormSubmitted}
      resetFormValues={resetFormValues}
      sendForm={sendForm}
      setBackStepFlag={setBackStepFlag}
      setFormValues={setFormValues}
      setPreFill={setPreFill}
      status={status}
      steps={steps}
      totalBusVacancies={totalBusVacancies}
      totalPackages={totalPackages}
      totalRegistrations={totalRegistrations}
      totalSeats={totalSeats}
      updateFormValues={updateFormValues}
      usedPackages={usedPackages}
      usedValidPackages={usedValidPackages}
      userRole={userRole}
    />
  );
};

RoutesValidations.propTypes = {
  formContextCloseForm: PropTypes.string,
};

export default RoutesValidations;
