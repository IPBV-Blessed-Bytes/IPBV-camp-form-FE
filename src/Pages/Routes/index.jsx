import 'react-datepicker/dist/react-datepicker.css';
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
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
import Admin from '../Admin';
import FinalReview from '../FinalReview';

export const enumSteps = {
  home: 0,
  personalData: 1,
  contact: 2,
  packages: 3,
  finalReview: 4,
  formPayment: 5,
  success: 6,
};

const initialValues = {
  registrationDate: '',
  personalInformation: {
    name: '',
    birthday: '',
    cpf: '',
    rg: '',
    rgShipper: '',
    rgShipperState: '',
    gender: '',
  },
  contact: {
    cellPhone: '',
    email: '',
    isWhatsApp: '',
    church: '',
    hasAllergy: '',
    allergy: '',
    hasAggregate: '',
    aggregate: '',
  },
  package: {
    accomodation: {
      id: '',
      name: '',
      subAccomodation: '',
    },
    transportation: '',
    food: '',
    price: '',
  },
  formPayment: {
    formPayment: '',
  },
};

const FormRoutes = () => {
  const [steps, setSteps] = useState(enumSteps.home);
  const [formValues, setFormValues] = useState(initialValues);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [totalRegistrations, setTotalRegistrations] = useState({});
  const isNotSuccessPathname = window.location.pathname !== '/sucesso';
  const isAdminPathname = window.location.pathname === '/admin';
  const [availablePackages, setAvailablePackages] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateFormValues = (key) => {
    return (value) => {
      setFormValues({
        ...formValues,
        [key]: value,
      });
    };
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
      setSteps(steps + 1);
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
    if (steps > 0) {
      setSteps(steps - 1);
      scrollTop();
    }
  };

  const goBackToStep = (step) => {
    setSteps(step);
    scrollTop();
  };

  const initialStep = () => {
    setSteps(enumSteps.home);
    scrollTop();
  };

  const sendForm = () => {
    setLoading(true);
    sendFormValues();
  };

  const sendFormValues = async () => {
    try {
      const updatedFormValues = {
        ...formValues,
        registrationDate: format(new Date(), 'dd-MM-yyyy HH:mm:ss'),
      };

      const response = await axios.post('https://ipbv-camp-form-be-production.up.railway.app/send-values', updatedFormValues);
      // const storedData = JSON.parse(localStorage.getItem('formValues')) || [];
      // storedData.push(initialValues);
      // localStorage.setItem('formValues', JSON.stringify(formValues));
      // console.log('Envios anteriores: ', storedData);

      if (response.data.data.payment_url) {
        window.open(response.data.data.payment_url, '_self');
      } else if (response.status === 201) {
        setFormSubmitted(true);
        nextStep();

        // localStorage.removeItem('formValues');
        // const storedData = JSON.parse(localStorage.getItem('formValues')) || [];
        // console.log('BD Limpo: ', storedData);
      }
    } catch (error) {
      const errorMessage = error.message ? error.message : String(error);
      toast.error(
        errorMessage === 'Request failed with status code 403'
          ? 'CPF já Cadastrado'
          : errorMessage || 'Erro ao enviar os dados!',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get('https://ipbv-camp-form-be-production.up.railway.app/package-count');
        setAvailablePackages(response);
      } catch (error) {
        toast.error(
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
        const response = await axios.get('https://ipbv-camp-form-be-production.up.railway.app/total-registrations');
        setTotalRegistrations(response.data);
      } catch (error) {
        toast.error(
          error.message === 'Request failed with status code 503'
            ? 'Banco de dados fora do ar. Tente novamente mais tarde'
            : error.message,
        );
      }
    };

    fetchTotalRegistrations();
  }, []);

  // useEffect(() => {
  // }, [updatedFormValues]);
  // console.log(formValues)

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <div className="form">
      {!isAdminPathname && (
        <div>
          <Header
            className={isAdminPathname && 'd-none'}
            currentStep={steps}
            goBackToStep={goBackToStep}
            formSubmitted={formSubmitted}
            showNavMenu
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

            {steps === enumSteps.finalReview && isNotSuccessPathname && (
              <FinalReview
                nextStep={nextStep}
                backStep={backStep}
                updateForm={updateFormValues('finalReview')}
                formValues={formValues}
                sendForm={sendForm}
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
        <Route path="/admin" element={<Admin totalRegistrationsGlobal={totalRegistrations} />} />
      </Routes>
    </div>
  );
};

Header.propTypes = {
  goBackToStep: PropTypes.func.isRequired,
  currentStep: PropTypes.number.isRequired,
  formSubmitted: PropTypes.bool.isRequired,
};

export default FormRoutes;
