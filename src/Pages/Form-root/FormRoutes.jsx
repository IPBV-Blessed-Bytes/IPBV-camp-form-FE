import Footer from '../../components/Footer.jsx';
import Header from '../../components/Header.jsx';
import FormHome from '../1st-page/FormHome.jsx';
import FormPersonalData from '../2nd-page/FormPersonalData.jsx';
import FormContact from '../3rd-page/FormContact.jsx';
import FormPackages from '../4th-page/FormPackages.jsx';
import FormPayment from '../5th-page/FormPayment.jsx';
import FormSuccess from '../6th-page/FormSuccess.jsx';
import { Routes, Route } from 'react-router-dom';

function FormRoutes() {
  return (
    <div className="bbp-wrapper">
      <Header />
      <div className="bbp-container">
        <Routes>
          <Route path="/" element={<FormHome />}></Route>
          <Route path="/dados" element={<FormPersonalData />}></Route>
          <Route path="/contato" element={<FormContact />}></Route>
          <Route path="/pacotes" element={<FormPackages />}></Route>
          <Route path="/pagamento" element={<FormPayment />}></Route>
          <Route path="/enviado" element={<FormSuccess />}></Route>
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default FormRoutes;
