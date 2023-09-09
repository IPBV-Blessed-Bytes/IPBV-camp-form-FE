import 'react-datepicker/dist/react-datepicker.css';

import { useState } from 'react';

import Footer from '../../components/Footer';
import Header from '../../components/Header';
import FormPayment from '../Payment';
import FormContact from '../Contact';
import FormHome from '../Home';
import FormPackages from '../Packages';
import FormPersonalData from '../PersonalData';
import FormSuccess from '../Success';
import ChooseFormPayment from '../ChooseFormPayment';

export const enumSteps = {
  home: 0,
  personalData: 1,
  contact: 2,
  packages: 3,
  formPayment: 4,
  checkout: 5,
  success: 6,
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
  const [steps, setSteps] = useState(enumSteps.packages);
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

  return (
    <div className="bbp-wrapper">
      <Header />

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

        {steps === enumSteps.checkout && <FormPayment nextStep={nextStep} backStep={backStep} />}

        {steps === enumSteps.success && <FormSuccess />}
      </div>
      <Footer />
    </div>
  );
}

export default FormRoutes;
