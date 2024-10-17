import 'react-datepicker/dist/react-datepicker.css';
import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import privateFetcher from '@/fetchers/fetcherWithCredentials';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ChooseFormPayment from '../ChooseFormPayment';
import FormContact from '../Contact';
import FormHome from '../Home';
import FormPackages from '../Packages';
import FormPersonalData from '../PersonalData';
import FormSuccess from '../Success';
import ExtraMeals from '../ExtraMeals';
import FinalReview from '../FinalReview';
import AdminHome from '../Admin/admin';
import AdminTable from '../Admin/adminComponents/adminTable';
import AdminRide from '../Admin/adminComponents/adminRide';
import { enumSteps, initialValues } from './constants';
import useAuth from '@/hooks/useAuth';
import AdminCoupon from '../Admin/adminComponents/adminCoupon';
import { BASE_URL } from '@/config/index';
import Icons from '@/components/Icons';
import calculateAge from '../Packages/utils/calculateAge';
import AdminUserLogs from '../Admin/adminComponents/adminUserLogs';
import ProtectedRoute from '@/components/ProtectedRoute';
import { USER_STORAGE_KEY, USER_STORAGE_ROLE } from '@/config';
import AdminCheckin from '../Admin/adminComponents/adminCheckin';
import AdminAggregate from '../Admin/adminComponents/adminAggregate';
import AdminSeatManagement from '../Admin/adminComponents/adminSeatManagement';
import AdminUsersManagement from '../Admin/adminComponents/adminUsersManagement';
import AdminFeedback from '../Admin/adminComponents/adminFeedback';
import FormFeedback from '../Feedback';

const FormRoutes = () => {
  const [steps, setSteps] = useState(enumSteps.home);
  const [formValues, setFormValues] = useState(initialValues);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [totalRegistrations, setTotalRegistrations] = useState({});
  const isNotSuccessAndFeedbackPathname = window.location.pathname !== '/sucesso';
  const adminPages = window.location.pathname.startsWith('/admin') || window.location.pathname === '/unauthorized';
  const isFeedbackPage = window.location.pathname !== '/opiniao';
  const [availablePackages, setAvailablePackages] = useState({});
  const [totalSeats, setTotalSeats] = useState({});
  const [totalBusVacancies, setTotalBusVacancies] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(undefined);
  const [withFood, setWithFood] = useState(false);
  const [showWhatsAppButtons, setShowWhatsAppButtons] = useState(false);
  const [showWhatsAppIcon, setShowWhatsAppIcon] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discount, setDiscount] = useState(0);
  const loggedUserRole = localStorage.getItem(USER_STORAGE_ROLE);

  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const whatsappButtonRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWhatsAppIcon(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (whatsappButtonRef.current && !whatsappButtonRef.current.contains(event.target)) {
        setShowWhatsAppButtons(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [whatsappButtonRef]);

  const updateFormValues = (key) => (value) => {
    setFormValues({
      ...formValues,
      [key]: value,
    });
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
      const hasFood = formValues.package.food !== 'Sem Alimentação' && formValues.package.food !== '';

      setWithFood(hasFood);

      const shouldSkipToFinalReview = hasFood && steps === enumSteps.packages;

      if (shouldSkipToFinalReview) {
        setSteps(enumSteps.finalReview);
      } else {
        setSteps(steps + 1);
      }
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
    if (steps === enumSteps.finalReview && withFood) {
      setSteps(enumSteps.packages);
    } else if (steps > 0) {
      setSteps(steps - 1);
    }
    scrollTop();
  };

  const goBackToStep = (step) => {
    setSteps(step);
    scrollTop();
  };

  const initialStep = () => {
    setSteps(enumSteps.home);
    scrollTop();
  };

  const sendForm = async () => {
    setLoading(true);
    sendFormValues();
  };

  const sendFormValues = async () => {
    try {
      setStatus('loading');
      const updatedFormValues = {
        ...formValues,
        registrationDate: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
        totalPrice: formValues.package.finalPrice + formValues.extraMeals.totalPrice,
        manualRegistration: false,
      };

      const response = await privateFetcher.post(`${BASE_URL}/checkout/create`, updatedFormValues);
      const checkoutUrl = response.data.payment_url;
      const checkoutStatus = response.data.checkout_status;
      setStatus('loaded');

      if (checkoutUrl && checkoutStatus === 'Checkout generated') {
        window.open(checkoutUrl, '_self');
        toast.success('Redirecionando para pagamento...');
      } else if (response.status === 201) {
        setFormSubmitted(true);
        toast.success('Inscrição validada com sucesso');
      } else if (checkoutStatus === 'Checkout Error') {
        toast.error('Erro ao criar checkout');
      }
    } catch (error) {
      setStatus('error');
      toast.error('Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await privateFetcher.get(`${BASE_URL}/package-count`);
        setAvailablePackages(response);
        setTotalSeats(response.data.totalSeats);
        setTotalBusVacancies(response.data.totalBusVacancies);
      } catch (error) {
        console.error(
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
        const response = await privateFetcher.get(`${BASE_URL}/total-registrations`);
        setTotalRegistrations(response.data);
      } catch (error) {
        console.error(
          error.message === 'Request failed with status code 503'
            ? 'Banco de dados fora do ar. Tente novamente mais tarde'
            : error.message,
        );
      }
    };

    fetchTotalRegistrations();
  }, []);

  const toggleWhatsAppButtons = () => {
    setShowWhatsAppButtons(!showWhatsAppButtons);
  };

  useEffect(() => {
    if (!isLoggedIn && adminPages) {
      navigate('/admin');
    }
  }, [isLoggedIn, adminPages, navigate]);

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const age = calculateAge(formValues.personalInformation.birthday);

  const handleDiscountChange = (discountValue) => {
    setDiscount(discountValue);
    if (discountValue !== 0 && discountValue !== '') {
      setHasDiscount(true);
    } else {
      setHasDiscount(false);
    }
  };

  const savedLoggedUsername = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
  const splitedLoggedUsername = savedLoggedUsername?.split('@')[0];

  return (
    <div className="form">
      {!adminPages && isFeedbackPage && (
        <div className="components-container">
          <Header currentStep={steps} goBackToStep={goBackToStep} formSubmitted={formSubmitted} showNavMenu={true} />

          <div className="form__container">
            {steps === enumSteps.home && isNotSuccessAndFeedbackPathname && (
              <FormHome nextStep={nextStep} backStep={backStep} />
            )}

            {steps === enumSteps.personalData && isNotSuccessAndFeedbackPathname && (
              <FormPersonalData
                initialValues={formValues.personalInformation}
                nextStep={nextStep}
                backStep={backStep}
                updateForm={updateFormValues('personalInformation')}
                onDiscountChange={handleDiscountChange}
                formUsername={formValues.personalInformation.name}
              />
            )}

            {steps === enumSteps.contact && isNotSuccessAndFeedbackPathname && (
              <FormContact
                initialValues={formValues.contact}
                nextStep={nextStep}
                backStep={backStep}
                updateForm={updateFormValues('contact')}
              />
            )}

            {steps === enumSteps.packages && isNotSuccessAndFeedbackPathname && (
              <FormPackages
                age={age}
                nextStep={nextStep}
                backStep={backStep}
                updateForm={updateFormValues('package')}
                sendForm={sendForm}
                availablePackages={availablePackages}
                totalRegistrationsGlobal={totalRegistrations}
                discountValue={discount}
                hasDiscount={hasDiscount}
                totalSeats={totalSeats}
                totalBusVacancies={totalBusVacancies}
                totalValidWithBus={totalRegistrations.totalValidWithBus}
              />
            )}

            {steps === enumSteps.extraMeals && isNotSuccessAndFeedbackPathname && (
              <ExtraMeals
                birthDate={formValues.personalInformation.birthday}
                backStep={backStep}
                nextStep={nextStep}
                initialValues={formValues.extraMeals}
                updateForm={updateFormValues('extraMeals')}
              />
            )}

            {steps === enumSteps.finalReview && isNotSuccessAndFeedbackPathname && (
              <FinalReview
                nextStep={nextStep}
                backStep={backStep}
                formValues={formValues}
                sendForm={sendForm}
                status={status}
              />
            )}

            {steps === enumSteps.formPayment && isNotSuccessAndFeedbackPathname && (
              <ChooseFormPayment
                initialValues={formValues}
                skipTwoSteps={skipTwoSteps}
                backStep={backStep}
                updateForm={updateFormValues('formPayment')}
                sendForm={sendForm}
                spinnerLoading={loading}
                status={status}
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

          {showWhatsAppIcon && (
            <button ref={whatsappButtonRef} className="whatsapp-btn" onClick={toggleWhatsAppButtons}>
              <Icons typeIcon="whatsapp" iconSize={25} fill={'#fff'} />
            </button>
          )}

          <div className={`whatsapp-floating-buttons ${showWhatsAppButtons ? 'show' : ''}`}>
            <button
              className="whatsapp-message-button"
              onClick={() => window.open('https://wa.me/5581998390194', '_blank')}
            >
              Fale Conosco&nbsp;
              <Icons className="whatsapp-icons" typeIcon="message" iconSize={25} fill={'#fff'} />
            </button>
            <button
              className="whatsapp-share-button"
              onClick={() =>
                window.open(
                  'https://wa.me/?text=Faça%20sua%20inscrição%20no%20acampamento%20da%20IPBV%202025%3A%20https://inscricaoipbv.com.br/',
                  '_blank',
                )
              }
            >
              Compartilhar&nbsp;
              <Icons className="whatsapp-icons" typeIcon="share" iconSize={25} fill={'#fff'} />
            </button>
          </div>

          <Footer onAdminClick={handleAdminClick} />
        </div>
      )}

      <div className="routes">
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminHome
                totalRegistrationsGlobal={totalRegistrations}
                userRole={loggedUserRole}
                totalValidWithBus={totalRegistrations.totalValidWithBus}
              />
            }
          />
          <Route
            path="/admin/tabela"
            element={
              <ProtectedRoute userRole={loggedUserRole} allowedRoles={['admin', 'collaborator', 'collaborator-viewer']}>
                <AdminTable loggedUsername={splitedLoggedUsername} userRole={loggedUserRole} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/carona"
            element={
              <ProtectedRoute userRole={loggedUserRole} allowedRoles={['admin', 'collaborator']}>
                <AdminRide />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cupom"
            element={
              <ProtectedRoute userRole={loggedUserRole} allowedRoles={['admin', 'collaborator', 'collaborator-viewer']}>
                <AdminCoupon loggedUsername={splitedLoggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agregado"
            element={
              <ProtectedRoute userRole={loggedUserRole} allowedRoles={['admin', 'collaborator']}>
                <AdminAggregate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/checkin"
            element={
              <ProtectedRoute userRole={loggedUserRole} allowedRoles={['admin', 'checker']}>
                <AdminCheckin loggedUsername={splitedLoggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute userRole={loggedUserRole} allowedRoles={['admin']}>
                <AdminUserLogs loggedUsername={splitedLoggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vagas"
            element={
              <ProtectedRoute userRole={loggedUserRole} allowedRoles={['admin']}>
                <AdminSeatManagement loggedUsername={splitedLoggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute userRole={loggedUserRole} allowedRoles={['admin']}>
                <AdminUsersManagement loggedUsername={splitedLoggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/opiniao"
            element={
              <ProtectedRoute userRole={loggedUserRole} allowedRoles={['admin', 'collaborator']}>
                <AdminFeedback />
              </ProtectedRoute>
            }
          />

          <Route path="/opiniao" element={<FormFeedback />} />
          <Route
            path="/unauthorized"
            element={<div className="m-3">Você não tem permissão para acessar esta página.</div>}
          />
        </Routes>
      </div>
    </div>
  );
};

export default FormRoutes;
