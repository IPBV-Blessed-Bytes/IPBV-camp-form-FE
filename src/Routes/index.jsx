import { Routes, Route } from 'react-router-dom';
import { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import { enumSteps } from '@/utils/constants';

import Footer from '@/components/Global/Footer';
import Header from '@/components/Global/Header';
import InfoButton from '../components/Global/InfoButton';
import ProtectedRoute from '@/components/Global/ProtectedRoute';
import CustomCarousel from '@/components/Global/CustomCarousel';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';
import { Col, Row } from 'react-bootstrap';

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

const FormRoutes = ({
  adminPathname,
  age,
  availablePackages,
  backStep,
  backStepFlag,
  cartKey,
  currentFormIndex,
  currentFormValues,
  discount,
  formContextCloseForm,
  formPath,
  formSubmitted,
  formValues,
  goToEditStep,
  goToStep,
  handleAddNewUser,
  handleAdminClick,
  handleBasePriceChange,
  handleDiscountChange,
  handlePersonData,
  handlePreFill,
  handleUpdateTotalBusVacancies,
  handleUpdateTotalPackages,
  handleUpdateTotalSeats,
  hasDiscount,
  hasFood,
  highestStepReached,
  initialStep,
  isNotSuccessPathname,
  loading,
  userRole,
  nextStep,
  packageCount,
  personData,
  preFill,
  resetFormSubmitted,
  resetFormValues,
  sendForm,
  setBackStepFlag,
  setFormValues,
  setPreFill,
  loggedUsername,
  status,
  steps,
  goToSuccessPage,
  totalBusVacancies,
  totalPackages,
  totalRegistrations,
  totalSeats,
  updateFormValues,
  usedPackages,
  usedValidPackages,
}) => {
  const [showInfoButton, setShowInfoButton] = useState(false);

  const { formContext } = useContext(AuthContext);

  const effectiveFormContext = formContextCloseForm === 'form-on' ? formContextCloseForm : formContext;

  return (
    <div className="form">
      {!adminPathname && formPath && (
        <div className="components-container">
          {effectiveFormContext === 'form-waiting' && <WaitingForCamp />}
          {effectiveFormContext === 'form-off' && <Offline />}
          {effectiveFormContext === 'maintenance' && <Maintenance />}

          {effectiveFormContext === 'form-on' && (
            <>
              <Header
                backStepFlag={backStepFlag}
                formSubmitted={formSubmitted}
                formValues={formValues}
                goToStep={goToStep}
                handlePreFill={handlePreFill}
                hasFood={hasFood}
                highestStepReached={highestStepReached}
                showNavMenu={true}
                steps={steps}
              />

              {steps !== enumSteps.packages && steps !== enumSteps.beforePayment && (
                <div className="form__container container">
                  <Row className="justify-content-center">
                    <Col lg={10} className="px-0">
                      {steps === enumSteps.home && isNotSuccessPathname && (
                        <FormHome nextStep={nextStep} onLgpdClose={() => setShowInfoButton(true)} />
                      )}

                      {steps === enumSteps.personalData && isNotSuccessPathname && (
                        <FormPersonalData
                          backStep={backStep}
                          currentFormIndex={currentFormIndex}
                          formUsername={currentFormValues.personalInformation?.name}
                          formValues={formValues}
                          handleDiscountChange={handleDiscountChange}
                          initialValues={formValues[currentFormIndex]?.personalInformation || {}}
                          nextStep={nextStep}
                          preFill={preFill}
                          setBackStepFlag={setBackStepFlag}
                          setPreFill={setPreFill}
                          updateForm={updateFormValues('personalInformation')}
                        />
                      )}

                      {steps === enumSteps.contact && isNotSuccessPathname && (
                        <FormContact
                          backStep={backStep}
                          handlePreFill={handlePreFill}
                          initialValues={formValues[currentFormIndex]?.contact || {}}
                          nextStep={nextStep}
                          updateForm={updateFormValues('contact')}
                        />
                      )}

                      {steps === enumSteps.extraMeals && isNotSuccessPathname && (
                        <ExtraMeals
                          backStep={backStep}
                          initialValues={formValues[currentFormIndex]?.extraMeals || {}}
                          nextStep={nextStep}
                          updateForm={updateFormValues('extraMeals')}
                        />
                      )}

                      {steps === enumSteps.finalReview && isNotSuccessPathname && (
                        <FinalReview
                          backStep={backStep}
                          nextStep={nextStep}
                          updateForm={updateFormValues('finalReview')}
                        />
                      )}

                      {steps === enumSteps.formPayment && isNotSuccessPathname && (
                        <ChooseFormPayment
                          backStep={backStep}
                          formValues={formValues}
                          initialValues={currentFormValues}
                          loading={loading}
                          sendForm={sendForm}
                          setBackStepFlag={setBackStepFlag}
                          status={status}
                          updateForm={updateFormValues('formPayment')}
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
                    </Col>
                  </Row>
                </div>
              )}

              {steps === enumSteps.packages && isNotSuccessPathname && (
                <div className="form__container container-fluid ">
                  <Row className="justify-content-center">
                    <Col lg={10} className="px-0">
                      <FormPackages
                        age={age}
                        backStep={backStep}
                        cartKey={cartKey}
                        currentFormIndex={currentFormIndex}
                        currentFormValues={currentFormValues}
                        discount={discount}
                        hasDiscount={hasDiscount}
                        nextStep={nextStep}
                        packageCount={packageCount}
                        totalRegistrationsGlobal={totalRegistrations}
                        totalSeats={totalSeats}
                        updateForm={updateFormValues('package')}
                      />
                    </Col>
                  </Row>
                </div>
              )}

              {steps === enumSteps.beforePayment && isNotSuccessPathname && (
                <div className="form__container container-fluid ">
                  <Row className="justify-content-center">
                    <Col lg={10} className="px-0">
                      <BeforePayment
                        cartKey={cartKey}
                        formValues={formValues}
                        goToEditStep={goToEditStep}
                        goToPersonalData={handleAddNewUser}
                        goToSuccessPage={goToSuccessPage}
                        handleBasePriceChange={handleBasePriceChange}
                        nextStep={nextStep}
                        sendForm={sendForm}
                        setBackStepFlag={setBackStepFlag}
                        setFormValues={setFormValues}
                        status={status}
                      />
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
            path={effectiveFormContext === 'maintenance' ? '/dev' : '/admin'}
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
            path={effectiveFormContext === 'maintenance' ? '/dev/acampantes' : '/admin/acampantes'}
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
            path={effectiveFormContext === 'maintenance' ? '/dev/carona' : '/admin/carona'}
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={userRole}>
                <AdminRide formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={effectiveFormContext === 'maintenance' ? '/dev/descontos' : '/admin/descontos'}
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator', 'collaborator-viewer']} userRole={userRole}>
                <AdminDiscount formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={effectiveFormContext === 'maintenance' ? '/dev/quartos' : '/admin/quartos'}
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={userRole}>
                <AdminRooms formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={effectiveFormContext === 'maintenance' ? '/dev/times' : '/admin/times'}
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator', 'team-creator']} userRole={userRole}>
                <AdminTeams formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={effectiveFormContext === 'maintenance' ? '/dev/alimentacao' : '/admin/alimentacao'}
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={userRole}>
                <AdminExtraMeals />
              </ProtectedRoute>
            }
          />
          <Route
            path={effectiveFormContext === 'maintenance' ? '/dev/checkin' : '/admin/checkin'}
            element={
              <ProtectedRoute allowedRoles={['admin', 'checker']} userRole={userRole}>
                <AdminCheckin formContext={formContext} loggedUsername={loggedUsername} userRole={userRole} />
              </ProtectedRoute>
            }
          />
          <Route
            path={effectiveFormContext === 'maintenance' ? '/dev/painel' : '/admin/painel'}
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
            path={effectiveFormContext === 'maintenance' ? '/dev/logs' : '/admin/logs'}
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                <AdminUserLogs formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={effectiveFormContext === 'maintenance' ? '/dev/vagas' : '/admin/vagas'}
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
            path={effectiveFormContext === 'maintenance' ? '/dev/lotes' : '/admin/lotes'}
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
            path={effectiveFormContext === 'maintenance' ? '/dev/contexto' : '/admin/contexto'}
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                <AdminFormContext formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={effectiveFormContext === 'maintenance' ? '/dev/usuarios' : '/admin/usuarios'}
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                <AdminUsersManagement formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={effectiveFormContext === 'maintenance' ? '/dev/pulseiras' : '/admin/pulseiras'}
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                <AdminWristbandsManagement formContext={formContext} loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path={effectiveFormContext === 'maintenance' ? '/dev/opiniao' : '/admin/opiniao'}
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

          {effectiveFormContext === 'form-on' && (
            <>
              <Route path="/opiniao" element={<FormFeedback />} />
              <Route path="/verificacao" element={<CpfReview handlePersonData={handlePersonData} />} />
              <Route path="/verificacao/dados" element={<CpfData personData={personData} />} />
              <Route path="/perguntas" element={<FAQ />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
};

FormRoutes.propTypes = {
  adminPathname: PropTypes.bool,
  age: PropTypes.number,
  availablePackages: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  backStep: PropTypes.func,
  backStepFlag: PropTypes.bool,
  cartKey: PropTypes.string,
  currentFormIndex: PropTypes.number,
  currentFormValues: PropTypes.shape({
    personalInformation: PropTypes.shape({
      name: PropTypes.string,
      birthday: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    }),
    contact: PropTypes.object,
    package: PropTypes.object,
    extraMeals: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    formPayment: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
  discount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  formContext: PropTypes.string,
  formContextCloseForm: PropTypes.string,
  formPath: PropTypes.bool,
  formSubmitted: PropTypes.bool,
  formValues: PropTypes.arrayOf(
    PropTypes.shape({
      personalInformation: PropTypes.shape({
        name: PropTypes.string,
        birthday: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      }),
      contact: PropTypes.object,
      package: PropTypes.object,
      extraMeals: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
      formPayment: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    }),
  ),
  goToEditStep: PropTypes.func,
  goToStep: PropTypes.func,
  goToSuccessPage: PropTypes.func,
  handleAddNewUser: PropTypes.func,
  handleAdminClick: PropTypes.func,
  handleBasePriceChange: PropTypes.func,
  handleDiscountChange: PropTypes.func,
  handlePersonData: PropTypes.func,
  handlePreFill: PropTypes.func,
  highestStepReached: PropTypes.number,
  handleUpdateTotalBusVacancies: PropTypes.func,
  handleUpdateTotalPackages: PropTypes.func,
  handleUpdateTotalSeats: PropTypes.func,
  hasDiscount: PropTypes.bool,
  hasFood: PropTypes.bool,
  initialStep: PropTypes.func,
  isNotSuccessPathname: PropTypes.bool,
  loading: PropTypes.bool,
  userRole: PropTypes.string,
  nextStep: PropTypes.func,
  packageCount: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
  personData: PropTypes.object,
  preFill: PropTypes.bool,
  resetFormSubmitted: PropTypes.func,
  resetFormValues: PropTypes.func,
  sendForm: PropTypes.func,
  setBackStepFlag: PropTypes.func,
  setFormValues: PropTypes.func,
  setPreFill: PropTypes.func,
  loggedUsername: PropTypes.string,
  status: PropTypes.string,
  steps: PropTypes.number,
  totalBusVacancies: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  totalPackages: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  totalRegistrations: PropTypes.shape({
    totalValidWithBus: PropTypes.number,
  }),
  totalSeats: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  updateFormValues: PropTypes.func,
  usedPackages: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  usedValidPackages: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

export default FormRoutes;
