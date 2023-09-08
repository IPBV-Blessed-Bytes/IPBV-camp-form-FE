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

export const enumSteps = {
  home: 0,
  personalData: 1,
  contact: 2,
  packages: 3,
  checkout: 4,
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

        {steps === enumSteps.checkout && <FormPayment nextStep={nextStep} backStep={backStep} />}

        {steps === enumSteps.success && <FormSuccess />}
      </div>
      <Footer />
    </div>
  );
}

export default FormRoutes;
