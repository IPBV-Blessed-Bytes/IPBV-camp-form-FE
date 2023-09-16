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
    accomodation: '',
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
  const [payment, setPayment] = useState(false);
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

  const noPaymentRequired = () => {
    if (steps < enumSteps.success) {
      setSteps(enumSteps.success);
      scrollTop();
      setPayment(true);
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

  const sendForm = (totalValue) => {
    totalValue === 0 && sendFormValues();
  };

  const sendFormValues = async () => {
    try {
      const data = formValues;

      const response = await axios.post('https://campform.up.railway.app/', data);
      console.log('response API', response.data);

      if (response.status === 201) {
        toast.success('Dados enviados com sucesso!');
        setFormSubmitted(true);
        console.log('formValues', formValues);

        // window.location.href = response.data.data.payment_url;
      }
    } catch (error) {
      console.error('CPF já Cadastrado!', error);
      toast.error('CPF já Cadastrado!');
    }
  };

  return (
    <div className="form">
      <Header currentStep={steps} goBackToStep={goBackToStep} formSubmitted={formSubmitted} />

      <div className="form__container">
        {steps === enumSteps.home && <FormHome nextStep={nextStep} backStep={backStep} />}

        {steps === enumSteps.personalData && (
          <FormPersonalData
            nextStep={nextStep}
            backStep={backStep}
            updateForm={updateFormValues('personalInformation')}
            initialValues={formValues.personalInformation}
          />
        )}

        {steps === enumSteps.contact && (
          <FormContact
            nextStep={nextStep}
            backStep={backStep}
            updateForm={updateFormValues('contact')}
            initialValues={formValues.contact}
          />
        )}

        {steps === enumSteps.packages && (
          <FormPackages
            nextStep={nextStep}
            backStep={backStep}
            birthDate={formValues.personalInformation.birthday}
            updateForm={updateFormValues('package')}
            noPaymentRequired={noPaymentRequired}
            sendForm={sendForm}
          />
        )}

        {steps === enumSteps.formPayment && (
          <ChooseFormPayment
            nextStep={nextStep}
            skipTwoSteps={skipTwoSteps}
            backStep={backStep}
            updateForm={updateFormValues('formPayment')}
            initialValues={formValues.formPayment}
            sendForm={sendForm}
          />
        )}

        {steps === enumSteps.success && (
          <FormSuccess
            formPayment={formValues.formPayment.formPayment}
            initialStep={initialStep}
            customerName={formValues.personalInformation.name}
            resetForm={resetFormValues}
            noPaymentRequired={payment}
            resetFormSubmitted={resetFormSubmitted}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FormRoutes;
