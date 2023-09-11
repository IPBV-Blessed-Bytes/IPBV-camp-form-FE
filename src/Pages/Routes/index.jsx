import { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FormHome from '../Home';
import FormPersonalData from '../PersonalData';
import FormContact from '../Contact';
import FormPackages from '../Packages';
import ChooseFormPayment from '../ChooseFormPayment';
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
  },
  package: {
    accomodation: '',
    transportation: '',
  },
  formPayment: {
    formPayment: '',
  },
};

function FormRoutes() {
  const [steps, setSteps] = useState(enumSteps.success);
  const [formValues, setFormValues] = useState(initialValues);

  const updateFormValues = (key) => {
    return (value) => {
      setFormValues({
        ...formValues,
        [key]: value,
      });
    };
  };

  const nextStep = () => {
    if (steps < enumSteps.success) {
      setSteps(steps + 1);
    }
  };

  const skipTwoSteps = () => {
    if (steps === enumSteps.formPayment) {
      setSteps(enumSteps.success);
    }
  };

  const backStep = () => {
    if (steps > 0) {
      setSteps(steps - 1);
    }
  };

  const goBackToStep = (step) => {
    setSteps(step);
  };

  return (
    <div className="bbp-wrapper">
      <Header currentStep={steps} goBackToStep={goBackToStep} />

      <div className="form-container">
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

        {steps === enumSteps.packages && <FormPackages nextStep={nextStep} backStep={backStep} />}

        {steps === enumSteps.formPayment && (
          <ChooseFormPayment
            nextStep={nextStep}
            skipTwoSteps={skipTwoSteps}
            backStep={backStep}
            updateForm={updateFormValues('formPayment')}
            initialValues={formValues.formPayment}
          />
        )}

        {steps === enumSteps.success && <FormSuccess formPayment={formValues.formPayment.formPayment} />}
      </div>
      <Footer />
    </div>
  );
}

export default FormRoutes;
