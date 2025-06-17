import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';

import { BASE_URL, USER_STORAGE_KEY, USER_STORAGE_ROLE } from '@/config';
import { enumSteps, initialValues } from '@/utils/constants';
import { isAdminPath, shouldRenderForm } from '@/utils/pathname';
import fetcher from '@/fetchers/fetcherWithCredentials';

import useAuth from '@/hooks/useAuth';
import calculateAge from '../Pages/Packages/utils/calculateAge';

import FormRoutes from '.';

const RoutesValidations = ({ formContext }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [steps, setSteps] = useState(enumSteps.personalData);
  const [formValues, setFormValues] = useState(initialValues);
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
  const [savedUsers, setSavedUsers] = useState([]);

  const loggedUserRole = localStorage.getItem(USER_STORAGE_ROLE);
  const savedLoggedUsername = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
  const splitedLoggedUsername = savedLoggedUsername?.split('@')[0];

  const windowPathname = window.location.pathname;
  const adminPathname = isAdminPath(windowPathname);
  const formPath = shouldRenderForm(windowPathname);

  const isNotSuccessPathname = windowPathname !== '/sucesso';

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);

      try {
        const response = await fetcher.get(`${BASE_URL}/package-count`);
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

  // const age = calculateAge(formValues.personalInformation.birthday);
  const age = calculateAge(formValues[currentFormIndex]?.personalInformation?.birthday);

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

  const handleDiscountChange = (discountValue) => {
    setDiscount(discountValue);
    setHasDiscount(discountValue !== 0 && discountValue !== '');
  };

  const resetFormValues = () => setFormValues(initialValues);

  const resetFormSubmitted = () => setFormSubmitted(false);

  const updateFormValues = (index, key) => (value) => {
    setFormValues((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [key]: value,
      };
      return updated;
    });
  };

  // const handleAddPerson = () => {
  //   const newPerson = { ...initialValues };
  //   setFormValues([...formValues, newPerson]);
  //   setCurrentFormIndex(formValues.length);
  // };

  // const handleRemovePerson = (indexToRemove) => {
  //   const updated = formValues.filter((_, index) => index !== indexToRemove);
  //   setFormValues(updated);
  //   if (currentFormIndex === indexToRemove) {
  //     setCurrentFormIndex(0);
  //   } else if (currentFormIndex > indexToRemove) {
  //     setCurrentFormIndex((prev) => prev - 1);
  //   }
  // };

  const handleSaveUser = () => {
    addUserToList(formValues);
    alert('Usuário adicionado à lista com sucesso!');
  };

  const addUserToList = (userData) => {
    setSavedUsers((prev) => [...prev, userData]);
  };

  const initialStep = () => {
    setSteps(enumSteps.home);
    scrollTop();
  };

  const nextStep = () => {
    if (steps < enumSteps.success) {
      const hasFood = formValues.package.food !== 'Sem Alimentação' && formValues.package.food !== '';
      setWithFood(hasFood);
      const skipToReview = hasFood && steps === enumSteps.packages;
      setSteps(skipToReview ? enumSteps.finalReview : steps + 1);
      scrollTop();
    }
  };

  const skipTwoSteps = () => {
    if (steps === enumSteps.formPayment) {
      setSteps(enumSteps.success);
      scrollTop();
    }
  };

  const backStep = () => {
    if (steps === enumSteps.finalReview && withFood) {
      setSteps(enumSteps.packages);
    } else if (steps > 0) {
      setSteps(steps - 1);
    }
    scrollTop();
  };

  const goBackToStep = (step) => {
    setSteps(step);
    scrollTop();
  };

  const sendForm = async () => {
    setLoading(true);
    try {
      setStatus('loading');
      const formsToSend = formValues.map((form) => ({
        ...form,
        formPayment: form.formPayment || 'nonPaid',
        registrationDate: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
        totalPrice: form.package.finalPrice + form.extraMeals.totalPrice,
        manualRegistration: false,
      }));

      const response = await fetcher.post(`${BASE_URL}/checkout/create`, formsToSend);
      const checkoutUrl = response.data.payment_url;
      const checkoutStatus = response.data.checkout_status;
      setStatus('loaded');

      if (checkoutUrl && checkoutStatus === 'Checkout generated') {
        window.open(checkoutUrl, '_self');
        toast.success('Redirecionando para pagamento...');
      } else if (response.status === 201 || response.status === 200) {
        setFormSubmitted(true);
        toast.success('Inscrição validada com sucesso');
      } else if (checkoutStatus === 'Checkout Error') {
        toast.error('Erro ao criar checkout');
      }
    } catch (error) {
      setStatus('error');
      toast.error(error?.response?.data || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormRoutes
      formContext={formContext}
      steps={steps}
      formValues={formValues}
      formSubmitted={formSubmitted}
      availablePackages={availablePackages}
      totalRegistrations={totalRegistrations}
      totalSeats={totalSeats}
      totalBusVacancies={totalBusVacancies}
      totalPackages={totalPackages}
      usedPackages={usedPackages}
      usedValidPackages={usedValidPackages}
      loading={loading}
      status={status}
      hasDiscount={hasDiscount}
      discount={discount}
      personData={personData}
      loggedUserRole={loggedUserRole}
      splitedLoggedUsername={splitedLoggedUsername}
      adminPathname={adminPathname}
      formPath={formPath}
      isNotSuccessPathname={isNotSuccessPathname}
      age={age}
      handleAdminClick={handleAdminClick}
      handlePersonData={handlePersonData}
      handleUpdateTotalSeats={handleUpdateTotalSeats}
      handleUpdateTotalBusVacancies={handleUpdateTotalBusVacancies}
      handleUpdateTotalPackages={handleUpdateTotalPackages}
      handleDiscountChange={handleDiscountChange}
      resetFormValues={resetFormValues}
      resetFormSubmitted={resetFormSubmitted}
      updateFormValues={updateFormValues}
      initialStep={initialStep}
      nextStep={nextStep}
      skipTwoSteps={skipTwoSteps}
      backStep={backStep}
      goBackToStep={goBackToStep}
      sendForm={sendForm}
      addUserToList={addUserToList}
    />
  );
};

RoutesValidations.propTypes = {
  formContext: PropTypes.string,
};

export default RoutesValidations;
