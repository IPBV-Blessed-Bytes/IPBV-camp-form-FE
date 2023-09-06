import 'react-datepicker/dist/react-datepicker.css';

import { useState } from 'react';

import Footer from '../../components/Footer';
import Header from '../../components/Header';
import FormPayment from '../5th-page/FormPayment';
import FormContact from '../FormContact';
import FormHome from '../FormHome';
import FormPackages from '../FormPackages';
import FormPersonalData from '../FormPersonalData';
import FormSuccess from '../Success';

export const enumSteps = {
  home: 0,
  personalData: 1,
  contact: 2,
  packages: 3,
  checkout: 4,
  success: 5,
};

function FormRoutes() {
  const [steps, setSteps] = useState(enumSteps.contact);

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

        {steps === enumSteps.personalData && <FormPersonalData nextStep={nextStep} backStep={backStep} />}

        {steps === enumSteps.contact && <FormContact nextStep={nextStep} backStep={backStep} />}

        {steps === enumSteps.packages && <FormPackages nextStep={nextStep} backStep={backStep} />}

        {steps === enumSteps.checkout && <FormPayment nextStep={nextStep} backStep={backStep} />}

        {steps === enumSteps.success && <FormSuccess />}
      </div>
      <Footer />
    </div>
  );
}

export default FormRoutes;
