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
  
  const loggedUserRole = localStorage.getItem(USER_STORAGE_ROLE);
  const savedLoggedUsername = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
  const splitedLoggedUsername = savedLoggedUsername?.split('@')[0];
  
  const windowPathname = window.location.pathname;
  const adminPathname = isAdminPath(windowPathname);
  const formPath = shouldRenderForm(windowPathname);
  
  const isNotSuccessPathname = windowPathname !== '/sucesso';

  useEffect(() => {
    sessionStorage.setItem('savedUsers', JSON.stringify(formValues));
  }, [formValues]);

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

  const updateFormValues = (sectionKey) => (newData, callback) => {
    setFormValues((prev) => {
      const updated = [...prev];
      updated[currentFormIndex] = {
        ...updated[currentFormIndex],
        [sectionKey]: newData,
      };
      return updated;
    });

    if (callback && typeof callback === 'function') {
      setTimeout(callback, 0);
    }
  };

  const handleAddNewUser = () => {
    setFormValues((prev) => {
      const updated = [...prev, initialValues[0]];
      setCurrentFormIndex(updated.length - 1);
      return updated;
    });
    setSteps(enumSteps.personalData);
    scrollTop();
  };

  // MOVER ESSA VALIDAÇÃO PRA ALGUM OUTRO STEP

  //  const addUserToList = (userData) => {
  //   const newCpf = userData?.personalInformation?.cpf;

  //   if (!newCpf) {
  //     toast.error('CPF não encontrado nos dados do usuário. Não foi possível adicionar.');
  //     return;
  //   }

  //   setSavedUsers((prev) => {
  //     const alreadyExists = prev.some((user) => user.personalInformation?.cpf === newCpf);

  //     if (alreadyExists) {
  //       toast.info(`Usuário com CPF ${newCpf} já está salvo. Ignorando duplicação.`);
  //       return prev;
  //     }

  //     toast.success('Usuário adicionado com sucesso');
  //     return [...prev, userData];
  //   });
  // };

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

  const sendForm = async (formikValues) => {
    setLoading(true);
    try {
      setStatus('loading');

      const payerIndex = formValues.length === 1 ? 0 : Number(formikValues.mainPayerIndex ?? -1);
      const form = formValues[payerIndex];
      const formsToSend = [
        {
          ...form,
          formPayment: formikValues.formPayment || 'nonPaid',
          registrationDate: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
          totalPrice: form.package.finalPrice + form.extraMeals.totalPrice,
          manualRegistration: false,
        },
      ];

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
      goToStep={goToStep}
      sendForm={sendForm}
      handleAddNewUser={handleAddNewUser}
      currentFormIndex={currentFormIndex}
      setFormValues={setFormValues}
      goToEditStep={goToEditStep}
      cartKey={cartKey}
      handlePreFill={handlePreFill}
      preFill={preFill}
      setPreFill={setPreFill}
      highestStepReached={highestStepReached}
      backStepFlag={backStepFlag}
      setBackStepFlag={setBackStepFlag}
    />
  );
};

RoutesValidations.propTypes = {
  formContext: PropTypes.string,
};

export default RoutesValidations;
