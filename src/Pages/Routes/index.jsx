import 'react-datepicker/dist/react-datepicker.css';
import { useState } from 'react';
import axios from 'axios';
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
  const [steps, setSteps] = useState(enumSteps.formPayment);
  const [formValues, setFormValues] = useState(initialValues);

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

  const sendFormValues = async () => {
      const data = {
        name: '',
        birthday: '',
        cpf: '',
        rg: '',
        rgShipper: '',
        rgShipperState: '',
        cellPhone: '',
        email: '',
        isWhatsApp: '',
        hasAllergy: '',
        allergy: '',
        hasAggregate: '',
        aggregate: '',
        price: '',
        accomodation: '',
        transportation: '',
        food: '',
        formPayment: '',
      };

      const response = await axios.post('https://campform.up.railway.app/', data);

      if (response.status === 201) {
        console.log('Dados enviados com sucesso!');
      } else if (response.status === 403) {
        console.error('CPF já cadastrado!');
      } else if (response.status === 500) {
        console.error('Falha no servidor da aplicação!');
      } else {
        console.error('Erro ao enviar dados. Tente novamente mais tarde.');
      }
    } catch (error) {
      console.error('Erro ao enviar dados. Tente novamente mais tarde.', error);
    }
  };
  return (
    <div className="form">
      <Header currentStep={steps} goBackToStep={goBackToStep} />

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
          />
        )}

        {steps === enumSteps.formPayment && (
          <ChooseFormPayment
            nextStep={nextStep}
            skipTwoSteps={skipTwoSteps}
            backStep={backStep}
            updateForm={updateFormValues('formPayment')}
            initialValues={formValues.formPayment}
            sendFormValues={sendFormValues}
          />
        )}

        {steps === enumSteps.success && (
          <FormSuccess
            formPayment={formValues.formPayment.formPayment}
            initialStep={initialStep}
            customerName={formValues.personalInformation.name}
            resetForm={resetFormValues}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FormRoutes;
