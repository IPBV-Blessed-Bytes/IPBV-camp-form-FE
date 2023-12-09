import 'react-datepicker/dist/react-datepicker.css';
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import ChooseFormPayment from '../ChooseFormPayment';
import FormContact from '../Contact';
import FormHome from '../Home';
import FormPackages from '../Packages';
import FormPersonalData from '../PersonalData';
import FormSuccess from '../Success';
import Admin from '../Admin';

export const enumSteps = {
  home: 0,
  personalData: 1,
  contact: 2,
  packages: 3,
  formPayment: 4,
  success: 5,
};

const initialValues = {
  personalInformation: {
    name: '',
    birthday: '',
    cpf: '',
    rg: '',
    rgShipper: '',
    rgShipperState: '',
  },
  contact: {
    cellPhone: '',
    email: '',
    isWhatsApp: '',
    hasAllergy: '',
    allergy: '',
    hasAggregate: '',
    aggregate: '',
  },
  package: {
    accomodation: {
      id: '',
      name: '',
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
  const isNotSuccessPathname = window.location.pathname !== '/sucesso';
  const isChurchPathname = window.location.pathname === '/igreja/admin';
  const [availablePackages, setAvailablePackages] = useState({});
  const [loading, setLoading] = useState(false);
  const navigateTo = useNavigate();

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
      const response = await axios.post('https://ipbv-camp-form-be-production.up.railway.app/', formValues);
      if (response.data.data.payment_url) {
        window.open(response.data.data.payment_url, '_self');
      } else if (response.status === 201) {
        setFormSubmitted(true);
        navigateTo('/sucesso');
      }
    } catch (error) {
      const errorMessage = error.message ? error.message : String(error);
      toast.error(
        errorMessage == 'Request failed with status code 403'
          ? 'CPF já cadastrado!'
          : errorMessage || 'Erro ao enviar os dados!',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get('https://ipbv-camp-form-be-production.up.railway.app/contagem-pacotes');

        setAvailablePackages(response);
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchPackages();
  }, []);

  return (
    <div className="form">
      <div className={isChurchPathname && 'd-none'}>
        <Header
          className={isChurchPathname && 'd-none'}
          currentStep={steps}
          goBackToStep={goBackToStep}
          formSubmitted={formSubmitted}
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
        <Footer />
      </div>
      <Routes>
        <Route path="/igreja/admin" element={<Admin />} />
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
