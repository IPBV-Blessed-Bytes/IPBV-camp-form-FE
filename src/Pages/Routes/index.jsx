import 'react-datepicker/dist/react-datepicker.css';
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ChooseFormPayment from '../ChooseFormPayment';
import FormContact from '../Contact';
import FormHome from '../Home';
import FormPackages from '../Packages';
import FormPersonalData from '../PersonalData';
import FormSuccess from '../Success';
import ExtraMeals from '../ExtraMeals';
import FinalReview from '../FinalReview';
import AdminHome from '../Admin/admin';
import AdminTable from '../Admin/adminComponents/adminTable';
import AdminRide from '../Admin/adminComponents/adminRide';
import { enumSteps, initialValues } from './constants';
import useAuth from '@/hooks/useAuth';
import AdminCoupon from '../Admin/adminComponents/adminCoupon';
import { BASE_URL } from '@/config/index';
import Icons from '@/components/Icons';

const FormRoutes = () => {
  const [steps, setSteps] = useState(enumSteps.home);
  const [formValues, setFormValues] = useState(initialValues);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [totalRegistrations, setTotalRegistrations] = useState({});
  const isNotSuccessPathname = window.location.pathname !== '/sucesso';
  const isAdminPathname = window.location.pathname === '/admin';
  const isAdminTablePathname = window.location.pathname === '/admin/tabela';
  const isAdminRidePathname = window.location.pathname === '/admin/carona';
  const isAdminCouponsPathname = window.location.pathname === '/admin/cupom';
  const [availablePackages, setAvailablePackages] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(undefined);
  const [withFood, setWithFood] = useState(false);
  const [showWhatsAppButtons, setShowWhatsAppButtons] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const updateFormValues = (key) => (value) => {
    setFormValues({
      ...formValues,
      [key]: value,
    });
  };

  const resetFormValues = () => {
    setFormValues(initialValues);
  };

  const resetFormSubmitted = () => {
    setFormSubmitted(false);
  };

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextStep = () => {
    if (steps < enumSteps.success) {
      const hasFood = formValues.package.food !== 'Sem Alimentação' && formValues.package.food !== '';

      setWithFood(hasFood);

      const shouldSkipToFinalReview = hasFood && steps === enumSteps.packages;

      if (shouldSkipToFinalReview) {
        setSteps(enumSteps.finalReview);
      } else {
        setSteps(steps + 1);
      }
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

  const initialStep = () => {
    setSteps(enumSteps.home);
    scrollTop();
  };

  const sendForm = async () => {
    setLoading(true);
    sendFormValues();
  };

  const sendFormValues = async () => {
    try {
      setStatus('loading');
      const updatedFormValues = {
        ...formValues,
        registrationDate: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
        totalPrice: formValues.package.finalPrice + formValues.extraMeals.totalPrice,
        manualRegistration: false,
      };

      const response = await axios.post(`${BASE_URL}/checkout/create`, updatedFormValues);
      const checkoutUrl = response.data.payment_url;
      const checkoutStatus = response.data.checkout_status;
      setStatus('loaded');

      if (checkoutUrl && checkoutStatus === 'Checkout generated') {
        window.open(checkoutUrl, '_self');
        toast.success('Redirecionando para pagamento...');
      } else if (response.status === 201) {
        setFormSubmitted(true);
        toast.success('Inscrição validada com sucesso');
      } else if (checkoutStatus === 'Checkout Error') {
        toast.error('Erro ao criar checkout');
      }
    } catch (error) {
      setStatus('error');
      toast.error('Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/package-count`);
        setAvailablePackages(response);
      } catch (error) {
        console.error(
          error.message === 'Request failed with status code 503'
            ? 'Banco de dados fora do ar. Tente novamente mais tarde'
            : error.message,
        );
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    const fetchTotalRegistrations = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/total-registrations`);
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

  const toggleWhatsAppButtons = () => {
    setShowWhatsAppButtons(!showWhatsAppButtons);
  };

  useEffect(() => {
    if (!isLoggedIn && (isAdminPathname || isAdminTablePathname || isAdminRidePathname || isAdminCouponsPathname)) {
      navigate('/admin');
    }
  }, [isLoggedIn, isAdminPathname, isAdminTablePathname, isAdminRidePathname, isAdminCouponsPathname, navigate]);

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <div className="form">
      {!isAdminPathname && !isAdminTablePathname && !isAdminRidePathname && !isAdminCouponsPathname && (
        <div className="components-container">
          <Header
            className={isAdminPathname && 'd-none'}
            currentStep={steps}
            goBackToStep={goBackToStep}
            formSubmitted={formSubmitted}
            showNavMenu={true}
          />

          <div className="form__container">
            {steps === enumSteps.home && isNotSuccessPathname && <FormHome nextStep={nextStep} backStep={backStep} />}

            {steps === enumSteps.personalData && isNotSuccessPathname && (
              <FormPersonalData
                initialValues={formValues.personalInformation}
                nextStep={nextStep}
                backStep={backStep}
                updateForm={updateFormValues('personalInformation')}
              />
            )}

            {steps === enumSteps.contact && isNotSuccessPathname && (
              <FormContact
                initialValues={formValues.contact}
                nextStep={nextStep}
                backStep={backStep}
                updateForm={updateFormValues('contact')}
              />
            )}

            {steps === enumSteps.packages && isNotSuccessPathname && (
              <FormPackages
                birthDate={formValues.personalInformation.birthday}
                nextStep={nextStep}
                backStep={backStep}
                updateForm={updateFormValues('package')}
                sendForm={sendForm}
                spinnerLoading={loading}
                availablePackages={availablePackages}
                totalRegistrationsGlobal={totalRegistrations}
                formUsername={formValues.personalInformation.name}
              />
            )}

            {steps === enumSteps.extraMeals && isNotSuccessPathname && (
              <ExtraMeals
                birthDate={formValues.personalInformation.birthday}
                backStep={backStep}
                nextStep={nextStep}
                initialValues={formValues.extraMeals}
                updateForm={updateFormValues('extraMeals')}
              />
            )}

            {steps === enumSteps.finalReview && isNotSuccessPathname && (
              <FinalReview
                nextStep={nextStep}
                backStep={backStep}
                formValues={formValues}
                sendForm={sendForm}
                status={status}
              />
            )}

            {steps === enumSteps.formPayment && isNotSuccessPathname && (
              <ChooseFormPayment
                initialValues={formValues}
                skipTwoSteps={skipTwoSteps}
                backStep={backStep}
                updateForm={updateFormValues('formPayment')}
                sendForm={sendForm}
                spinnerLoading={loading}
                status={status}
              />
            )}

            <Routes>
              <Route
                path="/sucesso"
                element={
                  <FormSuccess
                    initialStep={initialStep}
                    resetForm={resetFormValues}
                    resetFormSubmitted={resetFormSubmitted}
                  />
                }
              />
            </Routes>
          </div>

          <button className="whatsapp-btn" onClick={toggleWhatsAppButtons}>
            <Icons typeIcon="whatsapp" iconSize={25} fill={'#fff'} />
          </button>

          <div className={`whatsapp-floating-buttons ${showWhatsAppButtons ? 'show' : ''}`}>
            <button
              className="whatsapp-message-button"
              onClick={() => window.open('https://wa.me/5581998390194', '_blank')}
            >
              Fale Conosco&nbsp;
              <Icons className="whatsapp-icons" typeIcon="message" iconSize={25} fill={'#fff'} />
            </button>
            <button
              className="whatsapp-share-button"
              onClick={() =>
                window.open(
                  'https://wa.me/?text=Faça%20sua%20inscrição%20no%20acampamento%20da%20IPBV%202025%3A%20https://inscricaoipbv.com.br/',
                  '_blank',
                )
              }
            >
              Compartilhar&nbsp;
              <Icons className="whatsapp-icons" typeIcon="share" iconSize={25} fill={'#fff'} />
            </button>
          </div>

          <Footer onAdminClick={handleAdminClick} />
        </div>
      )}
      <Routes>
        <Route path="/admin" element={<AdminHome totalRegistrationsGlobal={totalRegistrations} />} />
        <Route path="/admin/tabela" element={<AdminTable />} />
        <Route path="/admin/carona" element={<AdminRide />} />
        <Route path="/admin/cupom" element={<AdminCoupon />} />
      </Routes>
    </div>
  );
};

export default FormRoutes;
