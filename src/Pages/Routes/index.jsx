import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { enumSteps, initialValues } from './constants';
import { USER_STORAGE_KEY, USER_STORAGE_ROLE } from '@/config';
import { BASE_URL } from '@/config/index';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import fetcher from '@/fetchers/fetcherWithCredentials';
import Footer from '@/components/GlobalComponents/Footer';
import Header from '@/components/GlobalComponents/Header';
import useAuth from '@/hooks/useAuth';
import calculateAge from '../Packages/utils/calculateAge';
import ProtectedRoute from '@/components/GlobalComponents/ProtectedRoute';
import InfoButton from '../../components/GlobalComponents/InfoButton';
import FormHome from '../Home';
import FormPersonalData from '../PersonalData';
import FormContact from '../Contact';
import FormPackages from '../Packages';
import ExtraMeals from '../ExtraMeals';
import FinalReview from '../FinalReview';
import ChooseFormPayment from '../ChooseFormPayment';
import FormSuccess from '../Success';
import FormFeedback from '../Feedback';
import CpfReview from '../CpfReview';
import CpfData from '../CpfReview/CpfData';
import Login from '../Admin/AdminPages/Login';
import AdminCampers from '../Admin/AdminPages/Campers';
import AdminRide from '../Admin/AdminPages/Ride';
import AdminCoupon from '../Admin/AdminPages/Coupon';
import AdminAggregate from '../Admin/AdminPages/Aggregate';
import AdminExtraMeals from '../Admin/AdminPages/ExtraMeals';
import AdminCheckin from '../Admin/AdminPages/Checkin';
import AdminUserLogs from '../Admin/AdminPages/UserLogs';
import AdminSeatManagement from '../Admin/AdminPages/SeatManagement';
import AdminUsersManagement from '../Admin/AdminPages/UsersManagement';
import AdminFeedback from '../Admin/AdminPages/Feedback';

const SiteRoutes = () => {
  const [steps, setSteps] = useState(enumSteps.home);
  const [formValues, setFormValues] = useState(initialValues);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [totalRegistrations, setTotalRegistrations] = useState({});
  const isNotSuccessPathname = window.location.pathname !== '/sucesso';
  const isNotFeedbackPathname = window.location.pathname !== '/opiniao';
  const isNotVerifyingPathname = window.location.pathname !== '/verificacao';
  const isNotVerifyingDataPathname = window.location.pathname !== '/verificacao/dados';
  const adminPathname = window.location.pathname.startsWith('/admin') || window.location.pathname === '/unauthorized';
  const [availablePackages, setAvailablePackages] = useState({});
  const [totalSeats, setTotalSeats] = useState({});
  const [totalBusVacancies, setTotalBusVacancies] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(undefined);
  const [withFood, setWithFood] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [personData, setPersonData] = useState(null);
  const loggedUserRole = localStorage.getItem(USER_STORAGE_ROLE);

  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

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

      const paymentMethod = formValues.formPayment || 'nonPaid';

      const updatedFormValues = {
        ...formValues,
        formPayment: paymentMethod,
        registrationDate: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
        totalPrice: formValues.package.finalPrice + formValues.extraMeals.totalPrice,
        manualRegistration: false,
      };

      const response = await fetcher.post(`${BASE_URL}/checkout/create`, updatedFormValues);
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
        const response = await fetcher.get(`${BASE_URL}/package-count`);
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
        const response = await fetcher.get(`${BASE_URL}/total-registrations`);
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

  useEffect(() => {
    if (!isLoggedIn && adminPathname) {
      navigate('/admin');
    }
  }, [isLoggedIn, adminPathname, navigate]);

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

  const handlePersonData = (data) => {
    setPersonData(data);
  };
  
  return (
    <div className="form">
      {!adminPathname && isNotFeedbackPathname && isNotVerifyingPathname && isNotVerifyingDataPathname && (
        <div className="components-container">
          <Header currentStep={steps} goBackToStep={goBackToStep} formSubmitted={formSubmitted} showNavMenu={true} />

          <div className="form__container">
            {steps === enumSteps.home && isNotSuccessPathname && <FormHome nextStep={nextStep} backStep={backStep} />}

            {steps === enumSteps.personalData && isNotSuccessPathname && (
              <FormPersonalData
                initialValues={formValues.personalInformation}
                nextStep={nextStep}
                backStep={backStep}
                updateForm={updateFormValues('personalInformation')}
                onDiscountChange={handleDiscountChange}
                formUsername={formValues.personalInformation.name}
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

            {steps === enumSteps.extraMeals && isNotSuccessPathname && (
              <ExtraMeals
                birthDate={formValues.personalInformation.birthday}
                backStep={backStep}
                nextStep={nextStep}
                initialValues={formValues.extraMeals}
                updateForm={updateFormValues('extraMeals')}
              />
            )}

            {steps === enumSteps.finalReview && isNotSuccessPathname && (
              <FinalReview
                nextStep={nextStep}
                backStep={backStep}
                formValues={formValues}
                sendForm={sendForm}
                status={status}
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

          <InfoButton timeout />

          <Footer onAdminClick={handleAdminClick} />
        </div>
      )}

      <div className="routes">
        <Routes>
          <Route
            path="/admin"
            element={
              <Login
                totalRegistrationsGlobal={totalRegistrations}
                userRole={loggedUserRole}
                totalValidWithBus={totalRegistrations.totalValidWithBus}
              />
            }
          />
          <Route
            path="/admin/acampantes"
            element={
              <ProtectedRoute userRole={loggedUserRole} allowedRoles={['admin', 'collaborator', 'collaborator-viewer']}>
                <AdminCampers loggedUsername={splitedLoggedUsername} userRole={loggedUserRole} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/carona"
            element={
              <ProtectedRoute userRole={loggedUserRole} allowedRoles={['admin', 'collaborator']}>
                <AdminRide loggedUsername={splitedLoggedUsername} />
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
            path="/admin/alimentacao"
            element={
              <ProtectedRoute userRole={loggedUserRole} allowedRoles={['admin', 'collaborator']}>
                <AdminExtraMeals />
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
            path="/verificacao"
            element={<CpfReview onAdminClick={handleAdminClick} onPersonDataFetch={handlePersonData} />}
          />
          <Route path="/verificacao/dados" element={<CpfData cpfValues={personData} />} />
          <Route
            path="/unauthorized"
            element={<div className="m-3">Você não tem permissão para acessar esta página.</div>}
          />
        </Routes>
      </div>
    </div>
  );
};

export default SiteRoutes;
