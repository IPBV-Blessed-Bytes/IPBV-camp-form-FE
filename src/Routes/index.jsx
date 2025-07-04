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
                currentStep={steps}
                goToStep={goToStep}
                formSubmitted={formSubmitted}
                showNavMenu={true}
                handlePreFill={handlePreFill}
                highestStepReached={highestStepReached}
                backStepFlag={backStepFlag}
              />

              <div className="form__container">
                {steps === enumSteps.home && isNotSuccessPathname && <FormHome nextStep={nextStep} />}
                {steps === enumSteps.personalData && isNotSuccessPathname && (
                  <FormPersonalData
                    initialValues={formValues[currentFormIndex]?.personalInformation || {}}
                    nextStep={nextStep}
                    backStep={backStep}
                    updateForm={updateFormValues('personalInformation')}
                    onDiscountChange={handleDiscountChange}
                    formUsername={currentFormValues.personalInformation?.name}
                    formValues={formValues}
                    currentFormIndex={currentFormIndex}
                    preFill={preFill}
                    setPreFill={setPreFill}
                    setBackStepFlag={setBackStepFlag}
                  />
                )}

                {steps === enumSteps.contact && isNotSuccessPathname && (
                  <FormContact
                    initialValues={formValues[currentFormIndex]?.contact || {}}
                    nextStep={nextStep}
                    backStep={backStep}
                    updateForm={updateFormValues('contact')}
                    handlePreFill={handlePreFill}
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
                    formValues={currentFormValues}
                    currentFormIndex={currentFormIndex}
                    cartKey={cartKey}
                  />
                )}

                {steps === enumSteps.extraMeals && isNotSuccessPathname && (
                  <ExtraMeals
                    birthDate={currentFormValues.personalInformation?.birthday}
                    backStep={backStep}
                    nextStep={nextStep}
                    initialValues={formValues[currentFormIndex]?.extraMeals || {}}
                    updateForm={updateFormValues('extraMeals')}
                  />
                )}

                {steps === enumSteps.finalReview && isNotSuccessPathname && (
                  <FinalReview
                    nextStep={nextStep}
                    backStep={backStep}
                    formValues={currentFormValues}
                    sendForm={sendForm}
                    status={status}
                    cartKey={cartKey}
                  />
                )}

                {steps === enumSteps.beforePayment && isNotSuccessPathname && (
                  <BeforePayment
                    goToPersonalData={handleAddNewUser}
                    goToStep={goToStep}
                    setFormValues={setFormValues}
                    formValues={formValues}
                    goToEditStep={goToEditStep}
                    cartKey={cartKey}
                    discountValue={discount}
                    nextStep={nextStep}
                    setBackStepFlag={setBackStepFlag}
                  />
                )}

                {steps === enumSteps.formPayment && isNotSuccessPathname && (
                  <ChooseFormPayment
                    initialValues={currentFormValues}
                    skipTwoSteps={skipTwoSteps}
                    backStep={backStep}
                    updateForm={updateFormValues('formPayment')}
                    sendForm={sendForm}
                    loading={loading}
                    status={status}
                    formValues={formValues}
                    setBackStepFlag={setBackStepFlag}
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
            path="/admin/contexto"
            element={
              <ProtectedRoute userRole={loggedUserRole} allowedRoles={['admin']}>
                <AdminFormContext loggedUsername={splitedLoggedUsername} />
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
