import 'react-datepicker/dist/react-datepicker.css';

import { useState } from 'react';

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
    sendFormValues();
  };

  const sendFormValues = async () => {
    try {
      const response = await axios.post('https://campform.up.railway.app/', formValues);

      if (response.status === 201) {
        setFormSubmitted(true);
        setSteps(enumSteps.success);
        if (response.data.data.payment_url) {
          window.open(response.data.data.payment_url, '_blank');
        }
      }
    } catch (error) {
      const errorMessage = error.message ? error.message : String(error);
      toast.error(errorMessage || 'Erro ao enviar os dados!');
    }
  };

  return (
    <div className="form">
      <Header currentStep={steps} goBackToStep={goBackToStep} formSubmitted={formSubmitted} />

      <div className="form__container">
        {steps === enumSteps.home && <FormHome nextStep={nextStep} backStep={backStep} />}

        {steps === enumSteps.personalData && (
          <FormPersonalData
            initialValues={formValues.personalInformation}
            nextStep={nextStep}
            backStep={backStep}
            updateForm={updateFormValues('personalInformation')}
          />
        )}

        {steps === enumSteps.contact && (
          <FormContact
            initialValues={formValues.contact}
            nextStep={nextStep}
            backStep={backStep}
            updateForm={updateFormValues('contact')}
          />
        )}

        {steps === enumSteps.packages && (
          <FormPackages
            birthDate={formValues.personalInformation.birthday}
            nextStep={nextStep}
            backStep={backStep}
            updateForm={updateFormValues('package')}
            sendForm={sendForm}
          />
        )}

        {steps === enumSteps.formPayment && (
          <ChooseFormPayment
            initialValues={formValues.formPayment}
            skipTwoSteps={skipTwoSteps}
            backStep={backStep}
            updateForm={updateFormValues('formPayment')}
            sendForm={sendForm}
          />
        )}

        {steps === enumSteps.success && (
          <FormSuccess
            formPayment={formValues.formPayment.formPayment}
            customerName={formValues.personalInformation.name}
            noPaymentRequired={formValues.package.price === 0}
            initialStep={initialStep}
            resetForm={resetFormValues}
            resetFormSubmitted={resetFormSubmitted}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FormRoutes;
