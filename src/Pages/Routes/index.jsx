import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';

import { BASE_URL, USER_STORAGE_KEY, USER_STORAGE_ROLE } from '@/config';
import { enumSteps, initialValues } from '@/utils/constants';
import { isAdminPath, shouldRenderForm } from '@/utils/pathname';
import fetcher from '@/fetchers/fetcherWithCredentials';

import useAuth from '@/hooks/useAuth';
import calculateAge from '../Packages/utils/calculateAge';

import Footer from '@/components/Global/Footer';
import Header from '@/components/Global/Header';
import InfoButton from '../../components/Global/InfoButton';
import ProtectedRoute from '@/components/Global/ProtectedRoute';

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

import Login from '../Admin/Login';
import AdminCampers from '../Admin/Campers';
import AdminRide from '../Admin/Ride';
import AdminDiscount from '../Admin/Discount';
import AdminRooms from '../Admin/Rooms';
import AdminExtraMeals from '../Admin/ExtraMeals';
import AdminCheckin from '../Admin/Checkin';
import AdminUserLogs from '../Admin/UserLogs';
import AdminSeatManagement from '../Admin/SeatManagement';
import AdminUsersManagement from '../Admin/UsersManagement';
import AdminFeedback from '../Admin/Feedback';
import AdminDataPanel from '../Admin/DataPanel';

import FAQ from '../FAQ';
import WaitingForCamp from '../WaitingForCamp';
import Offline from '../Offline';

const SiteRoutes = ({ formContext }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [steps, setSteps] = useState(enumSteps.home);
  const [formValues, setFormValues] = useState(initialValues);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [availablePackages, setAvailablePackages] = useState({});
  const [totalRegistrations, setTotalRegistrations] = useState({});
  const [totalSeats, setTotalSeats] = useState({});
  const [totalBusVacancies, setTotalBusVacancies] = useState({});
  const [totalPackages, setTotalPackages] = useState({});
  const [usedPackages, setUsedPackages] = useState();
  const [usedValidPackages, setUsedValidPackages] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(undefined);
  const [withFood, setWithFood] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [personData, setPersonData] = useState(null);

  const loggedUserRole = localStorage.getItem(USER_STORAGE_ROLE);
  const savedLoggedUsername = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
  const splitedLoggedUsername = savedLoggedUsername?.split('@')[0];

  const windowPathname = window.location.pathname;
  const adminPathname = isAdminPath(windowPathname);
  const formPath = shouldRenderForm(windowPathname);

  const isNotSuccessPathname = windowPathname !== '/sucesso';

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);

      try {
        const response = await fetcher.get(`${BASE_URL}/package-count`);
        setAvailablePackages(response.data);
        setTotalSeats(response.data?.totalSeats || 0);
        setTotalBusVacancies(response.data?.totalBusVacancies || 0);
        setTotalPackages(response.data?.totalPackages || {});
        setUsedPackages(response.data?.usedPackages || {});
        setUsedValidPackages(response.data?.usedValidPackages || {});
      } catch (error) {
        console.error('Erro ao buscar pacotes:', error);
      } finally {
        setLoading(false);
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

  const age = calculateAge(formValues.personalInformation.birthday);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handlePersonData = (data) => {
    setPersonData(data);
  };

  const handleUpdateTotalSeats = (newTotalSeats) => {
    setTotalSeats(newTotalSeats);
  };

  const handleUpdateTotalBusVacancies = (newTotalBusVacancies) => {
    setTotalBusVacancies(newTotalBusVacancies);
  };

  const handleUpdateTotalPackages = (updatedPackages) => {
    setTotalPackages(updatedPackages);
  };

  const handleDiscountChange = (discountValue) => {
    setDiscount(discountValue);
    setHasDiscount(discountValue !== 0 && discountValue !== '');
  };

  const resetFormValues = () => setFormValues(initialValues);

  const resetFormSubmitted = () => setFormSubmitted(false);

  const updateFormValues = (key) => (value) => {
    setFormValues({
      ...formValues,
      [key]: value,
    });
  };

  const initialStep = () => {
    setSteps(enumSteps.home);
    scrollTop();
  };

  const nextStep = () => {
    if (steps < enumSteps.success) {
      const hasFood = formValues.package.food !== 'Sem Alimentação' && formValues.package.food !== '';
      setWithFood(hasFood);
      const skipToReview = hasFood && steps === enumSteps.packages;
      setSteps(skipToReview ? enumSteps.finalReview : steps + 1);
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

  const sendForm = async () => {
    setLoading(true);
    try {
      setStatus('loading');
      const updatedForm = {
        ...formValues,
        formPayment: formValues.formPayment || 'nonPaid',
        registrationDate: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
        totalPrice: formValues.package.finalPrice + formValues.extraMeals.totalPrice,
        manualRegistration: false,
      };

      const response = await fetcher.post(`${BASE_URL}/checkout/create`, updatedForm);
      const checkoutUrl = response.data.payment_url;
      const checkoutStatus = response.data.checkout_status;
      setStatus('loaded');

      if (checkoutUrl && checkoutStatus === 'Checkout generated') {
        window.open(checkoutUrl, '_self');
        toast.success('Redirecionando para pagamento...');
      } else if (response.status === 201 || response.status === 200) {
        setFormSubmitted(true);
        toast.success('Inscrição validada com sucesso');
      } else if (checkoutStatus === 'Checkout Error') {
        toast.error('Erro ao criar checkout');
      }
    } catch (error) {
      setStatus('error');
      toast.error(error?.response?.data || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form">
      {!adminPathname && formPath && (
        <div className="components-container">
          {formContext === 'form-waiting' && <WaitingForCamp />}
          {formContext === 'form-off' && <Offline />}

          {formContext === 'form-on' && (
            <>
              <Header
                currentStep={steps}
                goBackToStep={goBackToStep}
                formSubmitted={formSubmitted}
                showNavMenu={true}
              />

              <div className="form__container">
                {steps === enumSteps.home && isNotSuccessPathname && (
                  <FormHome nextStep={nextStep} backStep={backStep} />
                )}

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
                    loading={loading}
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
            </>
          )}
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
                availablePackages={availablePackages}
                totalSeats={totalSeats}
                totalBusVacancies={totalBusVacancies}
                spinnerLoading={loading}
              />
            }
          />
          <Route
            path="/admin/acampantes"
            element={
              <ProtectedRoute
                userRole={loggedUserRole}
                allowedRoles={['admin', 'collaborator', 'collaborator-viewer', 'ride-manager']}
              >
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
            path="/admin/descontos"
            element={
              <ProtectedRoute userRole={loggedUserRole} allowedRoles={['admin', 'collaborator', 'collaborator-viewer']}>
                <AdminDiscount loggedUsername={splitedLoggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quartos"
            element={
              <ProtectedRoute userRole={loggedUserRole} allowedRoles={['admin', 'collaborator']}>
                <AdminRooms loggedUsername={splitedLoggedUsername} />
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
            path="/admin/painel"
            element={
              <ProtectedRoute
                userRole={loggedUserRole}
                allowedRoles={['admin', 'collaborator', 'collaborator-viewer', 'checker']}
              >
                <AdminDataPanel
                  userRole={loggedUserRole}
                  totalPackages={totalPackages}
                  usedPackages={usedPackages}
                  usedValidPackages={usedValidPackages}
                />
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
                <AdminSeatManagement
                  loggedUsername={splitedLoggedUsername}
                  totalSeats={totalSeats}
                  onUpdateTotalSeats={handleUpdateTotalSeats}
                  totalBusVacancies={totalBusVacancies}
                  onUpdateTotalBusVacancies={handleUpdateTotalBusVacancies}
                  totalPackages={totalPackages}
                  onUpdateTotalPackages={handleUpdateTotalPackages}
                  loading={loading}
                />
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
                <AdminFeedback loggedUsername={splitedLoggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unauthorized"
            element={<div className="m-3">Você não tem permissão para acessar esta página.</div>}
          />

          {formContext === 'form-on' && (
            <>
              <Route path="/opiniao" element={<FormFeedback />} />
              <Route
                path="/verificacao"
                element={<CpfReview onAdminClick={handleAdminClick} onPersonDataFetch={handlePersonData} />}
              />
              <Route path="/verificacao/dados" element={<CpfData cpfValues={personData} />} />
              <Route path="/perguntas" element={<FAQ />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
};

SiteRoutes.propTypes = {
  formContext: PropTypes.string,
};

export default SiteRoutes;
