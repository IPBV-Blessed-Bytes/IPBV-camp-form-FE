import 'react-datepicker/dist/react-datepicker.css';
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
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
import useAuth from '../../hooks/useAuth';

const API_URL = 'http://ec2-35-89-80-98.us-west-2.compute.amazonaws.com:8080';

const FormRoutes = () => {
  const [steps, setSteps] = useState(enumSteps.home);
  const [formValues, setFormValues] = useState(initialValues);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [totalRegistrations, setTotalRegistrations] = useState({});
  const isNotSuccessPathname = window.location.pathname !== '/sucesso';
  const isAdminPathname = window.location.pathname === '/admin';
  const isAdminTablePathname = window.location.pathname === '/admin/tabela';
  const isAdminRidePathname = window.location.pathname === '/admin/carona';
  const [availablePackages, setAvailablePackages] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(undefined);
  const [withFood, setWithFood] = useState(false);
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
      if (withFood && steps === enumSteps.packages) {
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
        registrationDate: format(new Date(), 'dd-MM-yyyy HH:mm:ss'),
        totalPrice: formValues.package.price + formValues.extraMeals.totalPrice,
      };

      const response = await axios.post(`${API_URL}/checkout/create`, updatedFormValues);
      setStatus('loaded');

      if (response.data.data.payment_url) {
        window.open(response.data.data.payment_url, '_self');
      } else if (response.status === 201) {
        setFormSubmitted(true);
        toast.success('Inscrição validada com sucesso');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(`${API_URL}/package-count`);
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
        const response = await axios.get(`${API_URL}/total-registrations`);
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
    if (!isLoggedIn && (isAdminPathname || isAdminTablePathname || isAdminRidePathname)) {
      navigate('/admin');
    }
  }, [isLoggedIn, isAdminPathname, navigate]);

  const handleAdminClick = () => {
    navigate('/admin');
  };

  useEffect(() => {
    if (formValues.package.food !== 'Sem Alimentação' && formValues.package.food !== '') {
      setWithFood(true);
    } else {
      setWithFood(false);
    }
  }, [formValues.package.food]);

  return (
    <div className="form">
      {!isAdminPathname && !isAdminTablePathname && !isAdminRidePathname && (
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
              />
            )}

            {steps === enumSteps.extraMeals && isNotSuccessPathname && (
              <ExtraMeals
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
          <Footer onAdminClick={handleAdminClick} />
        </div>
      )}
      <Routes>
        <Route path="/admin" element={<AdminHome totalRegistrationsGlobal={totalRegistrations} />} />
        <Route path="/admin/tabela" element={<AdminTable />} />
        <Route path="/admin/carona" element={<AdminRide />} />
      </Routes>
    </div>
  );
};

export default FormRoutes;
