import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import { enumSteps } from '@/utils/constants';
import { useFormState } from '@/contexts/FormStateContext';

import Footer from '@/components/Global/Footer';
import Header from '@/components/Global/Header';
import Loading from '@/components/Global/Loading';
import InfoButton from '../components/Global/InfoButton';
import ProtectedRoute from '@/components/Global/ProtectedRoute';
import CustomCarousel from '@/components/Global/CustomCarousel';

import FormHome from '../Pages/Home';
import FormPersonalData from '../Pages/PersonalData';
import FormContact from '../Pages/Contact';
import FormPackages from '../Pages/Packages';
import ExtraMeals from '../Pages/ExtraMeals';
import FinalReview from '../Pages/FinalReview';
import ChooseFormPayment from '../Pages/ChooseFormPayment';
import FormSuccess from '../Pages/Success';
import FormFeedback from '../Pages/Feedback';
import CpfReview from '../Pages/CpfReview';
import CpfData from '../Pages/CpfReview/CpfData';

import Login from '../Pages/Admin/Login';
import Maintenance from '@/Pages/Maintenance';

import WaitingForCamp from '../Pages/WaitingForCamp';
import Offline from '../Pages/Offline';
import BeforePayment from '@/Pages/BeforePayment';

const AdminCampers = lazy(() => import('../Pages/Admin/Campers'));
const AdminRide = lazy(() => import('../Pages/Admin/Ride'));
const AdminBus = lazy(() => import('../Pages/Admin/Bus'));
const AdminDiscount = lazy(() => import('../Pages/Admin/Discount'));
const AdminRooms = lazy(() => import('../Pages/Admin/Rooms'));
const AdminTeams = lazy(() => import('@/Pages/Admin/Teams'));
const AdminExtraMeals = lazy(() => import('../Pages/Admin/ExtraMeals'));
const AdminCheckin = lazy(() => import('../Pages/Admin/Checkin'));
const AdminBoletos = lazy(() => import('../Pages/Admin/Boletos'));
const AdminUserLogs = lazy(() => import('../Pages/Admin/UserLogs'));
const AdminSeatManagement = lazy(() => import('../Pages/Admin/SeatManagement'));
const AdminUsersManagement = lazy(() => import('../Pages/Admin/UsersManagement'));
const AdminProductsManagement = lazy(() => import('@/Pages/Admin/ProductsManagement'));
const AdminRolesManagement = lazy(() => import('@/Pages/Admin/RolesManagement'));
const AdminChangeRequests = lazy(() => import('@/Pages/Admin/ChangeRequests'));
const ForgotPassword = lazy(() => import('@/Pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/Pages/Auth/ResetPassword'));
const Unlock = lazy(() => import('@/Pages/Auth/Unlock'));
const CustomerSignUp = lazy(() => import('@/Pages/Customer/SignUp'));
const CustomerLogin = lazy(() => import('@/Pages/Customer/Login'));
const CustomerConfirmEmail = lazy(() => import('@/Pages/Customer/ConfirmEmail'));
const CustomerMyAccount = lazy(() => import('@/Pages/Customer/MyAccount'));
const Boletos = lazy(() => import('@/Pages/Boletos'));
const AdminFeedback = lazy(() => import('../Pages/Admin/Feedback'));
const AdminFormStage = lazy(() => import('@/Pages/Admin/FormStage'));
const AdminLotManagement = lazy(() => import('@/Pages/Admin/LotManagement'));
const AdminWristbandsManagement = lazy(() => import('@/Pages/Admin/WristbandsManagement'));
const AdminHomepageInfoManagement = lazy(() => import('@/Pages/Admin/HomeInfo'));
const AdminFaqBuilder = lazy(() => import('@/Pages/Admin/FaqBuilder'));
const AdminUtilitySettings = lazy(() => import('@/Pages/Admin/UtilitySettings'));
const FAQ = lazy(() => import('../Pages/FAQ'));

const FormRoutes = () => {
  const [showInfoButton, setShowInfoButton] = useState(false);
  const {
    adminPathname,
    availablePackages,
    effectiveFormStage,
    formStage,
    formPath,
    handleAdminClick,
    handleUpdateTotalBusVacancies,
    handleUpdateTotalPackages,
    handleUpdateTotalSeats,
    isNotSuccessPathname,
    loading,
    loggedUsername,
    packageCount,
    steps,
    totalBusVacancies,
    totalPackages,
    totalRegistrations,
    totalSeats,
    userRole,
  } = useFormState();

  const adminPath = (segment) => `${effectiveFormStage === 'maintenance' ? '/dev' : '/admin'}${segment}`;

  return (
    <div className="form">
      {!adminPathname && formPath && (
        <div className="components-container">
          {effectiveFormStage === 'form-waiting' && <WaitingForCamp />}
          {effectiveFormStage === 'form-off' && <Offline />}
          {effectiveFormStage === 'maintenance' && <Maintenance />}

          {effectiveFormStage === 'form-on' && (
            <>
              <Header showNavMenu />

              {steps !== enumSteps.packages && steps !== enumSteps.beforePayment && (
                <div className="form__container container">
                  <Row className="justify-content-center">
                    <Col lg={10} className="px-0">
                      {steps === enumSteps.home && isNotSuccessPathname && (
                        <FormHome onLgpdClose={() => setShowInfoButton(true)} />
                      )}

                      {steps === enumSteps.personalData && isNotSuccessPathname && <FormPersonalData />}

                      {steps === enumSteps.contact && isNotSuccessPathname && <FormContact />}

                      {steps === enumSteps.extraMeals && isNotSuccessPathname && <ExtraMeals />}

                      {steps === enumSteps.finalReview && isNotSuccessPathname && <FinalReview />}

                      {steps === enumSteps.formPayment && isNotSuccessPathname && <ChooseFormPayment />}

                      <Routes>
                        <Route path="/sucesso" element={<FormSuccess />} />
                      </Routes>
                    </Col>
                  </Row>
                </div>
              )}

              {steps === enumSteps.packages && isNotSuccessPathname && (
                <div className="form__container container-fluid ">
                  <Row className="justify-content-center">
                    <Col lg={10} className="px-0">
                      <FormPackages />
                    </Col>
                  </Row>
                </div>
              )}

              {steps === enumSteps.beforePayment && isNotSuccessPathname && (
                <div className="form__container container-fluid ">
                  <Row className="justify-content-center">
                    <Col lg={10} className="px-0">
                      <BeforePayment />
                    </Col>
                  </Row>
                </div>
              )}

              {showInfoButton && <InfoButton timeout />}

              {(steps === enumSteps.home || steps === enumSteps.success) && (
                <CustomCarousel title="Parceiros" images={[]} />
              )}

              <Footer handleAdminClick={handleAdminClick} />
            </>
          )}
        </div>
      )}

      <div className="routes">
        <Suspense fallback={<Loading loading />}>
          <Routes>
            <Route
              path={adminPath('')}
              element={
                <Login
                  availablePackages={availablePackages}
                  formStage={formStage}
                  spinnerLoading={loading}
                  totalBusVacancies={totalBusVacancies}
                  totalRegistrations={totalRegistrations}
                  totalSeats={totalSeats}
                  totalValidWithBus={totalRegistrations.totalValidWithBus}
                  userRole={userRole}
                />
              }
            />
            <Route
              path={adminPath('/acampantes')}
              element={
                <ProtectedRoute
                  allowedRoles={['admin', 'collaborator', 'collaborator-viewer', 'ride-manager', 'team-creator']}
                  userRole={userRole}
                  requiredPermission="REGISTRATIONS_READ"
                >
                  <AdminCampers formStage={formStage} loggedUsername={loggedUsername} userRole={userRole} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/carona')}
              element={
                <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={userRole} requiredPermission="RIDES_MANAGE">
                  <AdminRide formStage={formStage} loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/onibus')}
              element={
                <ProtectedRoute
                  allowedRoles={['admin', 'collaborator', 'collaborator-viewer', 'ride-manager', 'team-creator']}
                  userRole={userRole}
                  requiredPermission="REGISTRATIONS_READ"
                >
                  <AdminBus formStage={formStage} loggedUsername={loggedUsername} userRole={userRole} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/descontos')}
              element={
                <ProtectedRoute allowedRoles={['admin', 'collaborator', 'collaborator-viewer']} userRole={userRole} requiredPermission="COUPONS_MANAGE">
                  <AdminDiscount formStage={formStage} loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/quartos')}
              element={
                <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={userRole} requiredPermission="ROOMS_MANAGE">
                  <AdminRooms formStage={formStage} loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/times')}
              element={
                <ProtectedRoute allowedRoles={['admin', 'collaborator', 'team-creator']} userRole={userRole} requiredPermission="TEAMS_MANAGE">
                  <AdminTeams formStage={formStage} loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/alimentacao')}
              element={
                <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={userRole} requiredPermission="EXTRAMEALS_VIEW">
                  <AdminExtraMeals />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/checkin')}
              element={
                <ProtectedRoute allowedRoles={['admin', 'checker']} userRole={userRole} requiredPermission="CHECKIN">
                  <AdminCheckin formStage={formStage} loggedUsername={loggedUsername} userRole={userRole} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/boletos')}
              element={
                <ProtectedRoute allowedRoles={['admin']} userRole={userRole} requiredPermission="SETTINGS">
                  <AdminBoletos loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/logs')}
              element={
                <ProtectedRoute allowedRoles={['admin']} userRole={userRole} requiredPermission="SETTINGS">
                  <AdminUserLogs formStage={formStage} loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/vagas')}
              element={
                <ProtectedRoute allowedRoles={['admin']} userRole={userRole} requiredPermission="SETTINGS">
                  <AdminSeatManagement
                    formStage={formStage}
                    loading={loading}
                    loggedUsername={loggedUsername}
                    handleUpdateTotalBusVacancies={handleUpdateTotalBusVacancies}
                    handleUpdateTotalPackages={handleUpdateTotalPackages}
                    handleUpdateTotalSeats={handleUpdateTotalSeats}
                    totalBusVacancies={totalBusVacancies}
                    totalPackages={totalPackages}
                    totalSeats={totalSeats}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/lotes')}
              element={
                <ProtectedRoute allowedRoles={['admin']} userRole={userRole} requiredPermission="SETTINGS">
                  <AdminLotManagement
                    formStage={formStage}
                    loading={loading}
                    loggedUsername={loggedUsername}
                    packageCount={packageCount}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/estagio')}
              element={
                <ProtectedRoute allowedRoles={['admin']} userRole={userRole} requiredPermission="SETTINGS">
                  <AdminFormStage formStage={formStage} loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/faq')}
              element={
                <ProtectedRoute allowedRoles={['admin']} userRole={userRole} requiredPermission="SETTINGS">
                  <AdminFaqBuilder formStage={formStage} loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/utilitarios')}
              element={
                <ProtectedRoute allowedRoles={['admin']} userRole={userRole} requiredPermission="SETTINGS">
                  <AdminUtilitySettings formStage={formStage} loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/usuarios')}
              element={
                <ProtectedRoute allowedRoles={['admin']} userRole={userRole} requiredPermission="USERS_READ">
                  <AdminUsersManagement formStage={formStage} loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/produtos')}
              element={
                <ProtectedRoute
                  allowedRoles={['admin', 'collaborator']}
                  userRole={userRole}
                  requiredPermission="PRODUCTS_WRITE"
                >
                  <AdminProductsManagement formStage={formStage} loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/papeis')}
              element={
                <ProtectedRoute allowedRoles={['admin']} userRole={userRole} requiredPermission="ROLES_READ">
                  <AdminRolesManagement formStage={formStage} loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/solicitacoes')}
              element={
                <ProtectedRoute
                  allowedRoles={['admin', 'collaborator']}
                  userRole={userRole}
                  requiredPermission="REGISTRATIONS_WRITE"
                >
                  <AdminChangeRequests formStage={formStage} loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/pulseiras')}
              element={
                <ProtectedRoute allowedRoles={['admin']} userRole={userRole} requiredPermission="SETTINGS">
                  <AdminWristbandsManagement formStage={formStage} loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/info')}
              element={
                <ProtectedRoute allowedRoles={['admin']} userRole={userRole} requiredPermission="SETTINGS">
                  <AdminHomepageInfoManagement formStage={formStage} loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path={adminPath('/opiniao')}
              element={
                <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={userRole} requiredPermission="FEEDBACK_VIEW">
                  <AdminFeedback formStage={formStage} loggedUsername={loggedUsername} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/unauthorized"
              element={<div className="m-3">Você não tem permissão para acessar esta página.</div>}
            />

            <Route path="/esqueci-senha" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unlock" element={<Unlock />} />

            <Route path="/criar-conta" element={<CustomerSignUp />} />
            <Route path="/entrar" element={<CustomerLogin />} />
            <Route path="/confirmar-email" element={<CustomerConfirmEmail />} />
            <Route path="/minha-conta" element={<CustomerMyAccount />} />
            <Route path="/minha-conta/boletos" element={<Boletos />} />

            {(effectiveFormStage === 'form-on' || effectiveFormStage === 'form-waiting') && (
              <>
                <Route path="/opiniao" element={<FormFeedback />} />
                <Route path="/verificacao" element={<CpfReview />} />
                <Route path="/verificacao/dados" element={<CpfData />} />
                <Route path="/perguntas" element={<FAQ />} />
              </>
            )}
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default FormRoutes;
