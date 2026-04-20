import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import { enumSteps } from '@/utils/constants';
import { useFormState } from '@/contexts/FormStateContext';

import Footer from '@/components/Global/Footer';
import Header from '@/components/Global/Header';
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
import AdminCampers from '../Pages/Admin/Campers';
import AdminRide from '../Pages/Admin/Ride';
import AdminDiscount from '../Pages/Admin/Discount';
import AdminRooms from '../Pages/Admin/Rooms';
import AdminTeams from '@/Pages/Admin/Teams';
import AdminExtraMeals from '../Pages/Admin/ExtraMeals';
import AdminCheckin from '../Pages/Admin/Checkin';
import AdminUserLogs from '../Pages/Admin/UserLogs';
import AdminSeatManagement from '../Pages/Admin/SeatManagement';
import AdminUsersManagement from '../Pages/Admin/UsersManagement';
import AdminFeedback from '../Pages/Admin/Feedback';
import AdminDataPanel from '../Pages/Admin/DataPanel';
import AdminFormContext from '@/Pages/Admin/FormContext';
import AdminLotManagement from '@/Pages/Admin/LotManagement';
import AdminWristbandsManagement from '@/Pages/Admin/WristbandsManagement';
import Maintenance from '@/Pages/Maintenance';

import FAQ from '../Pages/FAQ';
import WaitingForCamp from '../Pages/WaitingForCamp';
import Offline from '../Pages/Offline';
import BeforePayment from '@/Pages/BeforePayment';
import AdminHomepageInfoManagement from '@/Pages/Admin/HomeInfo';

const FormRoutes = () => {
  const [showInfoButton, setShowInfoButton] = useState(false);
  const {
    adminPathname,
    availablePackages,
    effectiveFormContext,
    formContext,
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
    usedPackages,
    usedValidPackages,
    userRole,
  } = useFormState();

  const adminPath = (segment) => `${effectiveFormContext === 'maintenance' ? '/dev' : '/admin'}${segment}`;

  return (
    <div className="form">
      {!adminPathname && formPath && (
        <div className="components-container">
          {effectiveFormContext === 'form-waiting' && <WaitingForCamp />}
          {effectiveFormContext === 'form-off' && <Offline />}
          {effectiveFormContext === 'maintenance' && <Maintenance />}

          {effectiveFormContext === 'form-on' && (
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
        <Routes>
          <Route
            path={adminPath('')}
            element={
              <Login
                availablePackages={availablePackages}
                formContext={formContext}
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
              >
                <AdminCampers formContext={formContext} loggedUsername={loggedUsername} userRole={userRole} />
              </ProtectedRoute>
            }
          />
          <Route
            path={adminPath('/carona')}
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={userRole}>
                <AdminRide formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={adminPath('/descontos')}
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator', 'collaborator-viewer']} userRole={userRole}>
                <AdminDiscount formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={adminPath('/quartos')}
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={userRole}>
                <AdminRooms formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={adminPath('/times')}
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator', 'team-creator']} userRole={userRole}>
                <AdminTeams formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={adminPath('/alimentacao')}
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={userRole}>
                <AdminExtraMeals />
              </ProtectedRoute>
            }
          />
          <Route
            path={adminPath('/checkin')}
            element={
              <ProtectedRoute allowedRoles={['admin', 'checker']} userRole={userRole}>
                <AdminCheckin formContext={formContext} loggedUsername={loggedUsername} userRole={userRole} />
              </ProtectedRoute>
            }
          />
          <Route
            path={adminPath('/painel')}
            element={
              <ProtectedRoute
                allowedRoles={['admin', 'collaborator', 'collaborator-viewer', 'checker']}
                userRole={userRole}
              >
                <AdminDataPanel
                  formContext={formContext}
                  totalPackages={totalPackages}
                  usedPackages={usedPackages}
                  usedValidPackages={usedValidPackages}
                  userRole={userRole}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path={adminPath('/logs')}
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                <AdminUserLogs formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={adminPath('/vagas')}
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                <AdminSeatManagement
                  formContext={formContext}
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
              <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                <AdminLotManagement
                  formContext={formContext}
                  loading={loading}
                  loggedUsername={loggedUsername}
                  packageCount={packageCount}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path={adminPath('/contexto')}
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                <AdminFormContext formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={adminPath('/usuarios')}
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                <AdminUsersManagement formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={adminPath('/pulseiras')}
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                <AdminWristbandsManagement formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={adminPath('/info')}
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                <AdminHomepageInfoManagement formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={adminPath('/opiniao')}
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={userRole}>
                <AdminFeedback formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unauthorized"
            element={<div className="m-3">Você não tem permissão para acessar esta página.</div>}
          />

          {(effectiveFormContext === 'form-on' || effectiveFormContext === 'form-waiting') && (
            <>
              <Route path="/opiniao" element={<FormFeedback />} />
              <Route path="/verificacao" element={<CpfReview />} />
              <Route path="/verificacao/dados" element={<CpfData />} />
              <Route path="/perguntas" element={<FAQ />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
};

export default FormRoutes;
