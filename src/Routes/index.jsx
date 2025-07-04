import { Routes, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import { enumSteps } from '@/utils/constants';

import Footer from '@/components/Global/Footer';
import Header from '@/components/Global/Header';
import InfoButton from '../components/Global/InfoButton';
import ProtectedRoute from '@/components/Global/ProtectedRoute';

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
import AdminExtraMeals from '../Pages/Admin/ExtraMeals';
import AdminCheckin from '../Pages/Admin/Checkin';
import AdminUserLogs from '../Pages/Admin/UserLogs';
import AdminSeatManagement from '../Pages/Admin/SeatManagement';
import AdminUsersManagement from '../Pages/Admin/UsersManagement';
import AdminFeedback from '../Pages/Admin/Feedback';
import AdminDataPanel from '../Pages/Admin/DataPanel';
import AdminFormContext from '@/Pages/Admin/FormContext';

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
  discount,
  formContext,
  formPath,
  formSubmitted,
  formValues,
  goToEditStep,
  goToStep,
  handleAddNewUser,
  handleAdminClick,
  handleDiscountChange,
  handlePersonData,
  handlePreFill,
  handleUpdateTotalBusVacancies,
  handleUpdateTotalPackages,
  handleUpdateTotalSeats,
  hasDiscount,
  highestStepReached,
  initialStep,
  isNotSuccessPathname,
  loading,
  loggedUserRole,
  nextStep,
  personData,
  preFill,
  resetFormSubmitted,
  resetFormValues,
  sendForm,
  setBackStepFlag,
  setFormValues,
  setPreFill,
  skipTwoSteps,
  splitedLoggedUsername,
  status,
  steps,
  totalBusVacancies,
  totalPackages,
  totalRegistrations,
  totalSeats,
  updateFormValues,
  usedPackages,
  usedValidPackages,
}) => {
  const currentFormValues = formValues[currentFormIndex] || {};

  return (
    <div className="form">
      {!adminPathname && formPath && (
        <div className="components-container">
          {formContext === 'form-waiting' && <WaitingForCamp />}
          {formContext === 'form-off' && <Offline />}

          {formContext === 'form-on' && (
            <>
              <Header
                backStepFlag={backStepFlag}
                currentStep={steps}
                formSubmitted={formSubmitted}
                goToStep={goToStep}
                handlePreFill={handlePreFill}
                highestStepReached={highestStepReached}
                showNavMenu={true}
              />

              <div className="form__container">
                {steps === enumSteps.home && isNotSuccessPathname && <FormHome nextStep={nextStep} />}
                {steps === enumSteps.personalData && isNotSuccessPathname && (
                  <FormPersonalData
                    backStep={backStep}
                    currentFormIndex={currentFormIndex}
                    formUsername={currentFormValues.personalInformation?.name}
                    formValues={formValues}
                    initialValues={formValues[currentFormIndex]?.personalInformation || {}}
                    nextStep={nextStep}
                    onDiscountChange={handleDiscountChange}
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

                {steps === enumSteps.packages && isNotSuccessPathname && (
                  <FormPackages
                    age={age}
                    availablePackages={availablePackages}
                    backStep={backStep}
                    cartKey={cartKey}
                    currentFormIndex={currentFormIndex}
                    discountValue={discount}
                    formValues={currentFormValues}
                    hasDiscount={hasDiscount}
                    nextStep={nextStep}
                    sendForm={sendForm}
                    totalBusVacancies={totalBusVacancies}
                    totalRegistrationsGlobal={totalRegistrations}
                    totalSeats={totalSeats}
                    totalValidWithBus={totalRegistrations.totalValidWithBus}
                    updateForm={updateFormValues('package')}
                  />
                )}

                {steps === enumSteps.extraMeals && isNotSuccessPathname && (
                  <ExtraMeals
                    backStep={backStep}
                    birthDate={currentFormValues.personalInformation?.birthday}
                    initialValues={formValues[currentFormIndex]?.extraMeals || {}}
                    nextStep={nextStep}
                    updateForm={updateFormValues('extraMeals')}
                  />
                )}

                {steps === enumSteps.finalReview && isNotSuccessPathname && (
                  <FinalReview
                    backStep={backStep}
                    cartKey={cartKey}
                    formValues={currentFormValues}
                    nextStep={nextStep}
                    sendForm={sendForm}
                    status={status}
                  />
                )}

                {steps === enumSteps.beforePayment && isNotSuccessPathname && (
                  <BeforePayment
                    cartKey={cartKey}
                    discountValue={discount}
                    formValues={formValues}
                    goToEditStep={goToEditStep}
                    goToPersonalData={handleAddNewUser}
                    goToStep={goToStep}
                    nextStep={nextStep}
                    setBackStepFlag={setBackStepFlag}
                    setFormValues={setFormValues}
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
                    skipTwoSteps={skipTwoSteps}
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
                availablePackages={availablePackages}
                spinnerLoading={loading}
                totalBusVacancies={totalBusVacancies}
                totalRegistrationsGlobal={totalRegistrations}
                totalSeats={totalSeats}
                totalValidWithBus={totalRegistrations.totalValidWithBus}
                userRole={loggedUserRole}
              />
            }
          />
          <Route
            path="/admin/acampantes"
            element={
              <ProtectedRoute
                allowedRoles={['admin', 'collaborator', 'collaborator-viewer', 'ride-manager']}
                userRole={loggedUserRole}
              >
                <AdminCampers loggedUsername={splitedLoggedUsername} userRole={loggedUserRole} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/carona"
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={loggedUserRole}>
                <AdminRide loggedUsername={splitedLoggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/descontos"
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator', 'collaborator-viewer']} userRole={loggedUserRole}>
                <AdminDiscount loggedUsername={splitedLoggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quartos"
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={loggedUserRole}>
                <AdminRooms loggedUsername={splitedLoggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/alimentacao"
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={loggedUserRole}>
                <AdminExtraMeals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/checkin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'checker']} userRole={loggedUserRole}>
                <AdminCheckin loggedUsername={splitedLoggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/painel"
            element={
              <ProtectedRoute
                allowedRoles={['admin', 'collaborator', 'collaborator-viewer', 'checker']}
                userRole={loggedUserRole}
              >
                <AdminDataPanel
                  totalPackages={totalPackages}
                  usedPackages={usedPackages}
                  usedValidPackages={usedValidPackages}
                  userRole={loggedUserRole}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={loggedUserRole}>
                <AdminUserLogs loggedUsername={splitedLoggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vagas"
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={loggedUserRole}>
                <AdminSeatManagement
                  loading={loading}
                  loggedUsername={splitedLoggedUsername}
                  onUpdateTotalBusVacancies={handleUpdateTotalBusVacancies}
                  onUpdateTotalPackages={handleUpdateTotalPackages}
                  onUpdateTotalSeats={handleUpdateTotalSeats}
                  totalBusVacancies={totalBusVacancies}
                  totalPackages={totalPackages}
                  totalSeats={totalSeats}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contexto"
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={loggedUserRole}>
                <AdminFormContext loggedUsername={splitedLoggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={loggedUserRole}>
                <AdminUsersManagement loggedUsername={splitedLoggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/opiniao"
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={loggedUserRole}>
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

FormRoutes.propTypes = {
  adminPathname: PropTypes.bool,
  age: PropTypes.number,
  availablePackages: PropTypes.array,
  backStep: PropTypes.func,
  cartKey: PropTypes.string,
  currentFormIndex: PropTypes.number,
  discount: PropTypes.number,
  formContext: PropTypes.string,
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
      formPayment: PropTypes.object,
    }),
  ),
  goToEditStep: PropTypes.func,
  goToStep: PropTypes.func,
  handleAddNewUser: PropTypes.func,
  handleAdminClick: PropTypes.func,
  handleDiscountChange: PropTypes.func,
  handlePersonData: PropTypes.func,
  handleUpdateTotalBusVacancies: PropTypes.func,
  handleUpdateTotalPackages: PropTypes.func,
  handleUpdateTotalSeats: PropTypes.func,
  hasDiscount: PropTypes.bool,
  initialStep: PropTypes.func,
  isNotSuccessPathname: PropTypes.bool,
  loading: PropTypes.bool,
  loggedUserRole: PropTypes.string,
  nextStep: PropTypes.func,
  personData: PropTypes.object,
  resetFormSubmitted: PropTypes.func,
  resetFormValues: PropTypes.func,
  sendForm: PropTypes.func,
  setFormValues: PropTypes.func,
  skipTwoSteps: PropTypes.func,
  splitedLoggedUsername: PropTypes.string,
  status: PropTypes.string,
  steps: PropTypes.number,
  totalBusVacancies: PropTypes.number,
  totalPackages: PropTypes.number,
  totalRegistrations: PropTypes.shape({
    totalValidWithBus: PropTypes.number,
  }),
  totalSeats: PropTypes.number,
  updateFormValues: PropTypes.func,
  usedPackages: PropTypes.array,
  usedValidPackages: PropTypes.array,
};

export default FormRoutes;
