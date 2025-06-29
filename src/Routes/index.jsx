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
  formContext,
  steps,
  formValues,
  formSubmitted,
  availablePackages,
  totalRegistrations,
  totalSeats,
  totalBusVacancies,
  totalPackages,
  usedPackages,
  usedValidPackages,
  loading,
  status,
  hasDiscount,
  discount,
  personData,
  loggedUserRole,
  splitedLoggedUsername,
  adminPathname,
  formPath,
  isNotSuccessPathname,
  age,
  handleAdminClick,
  handlePersonData,
  handleUpdateTotalSeats,
  handleUpdateTotalBusVacancies,
  handleUpdateTotalPackages,
  handleDiscountChange,
  resetFormValues,
  resetFormSubmitted,
  updateFormValues,
  initialStep,
  nextStep,
  skipTwoSteps,
  backStep,
  goBackToStep,
  sendForm,
  handleAddNewUser,
  currentFormIndex,
  setFormValues,
  goToEditStep,
  cartKey,
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
                goBackToStep={goBackToStep}
                formSubmitted={formSubmitted}
                showNavMenu={true}
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
                  />
                )}

                {steps === enumSteps.contact && isNotSuccessPathname && (
                  <FormContact
                    initialValues={formValues[currentFormIndex]?.contact || {}}
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
                    goBackToStep={goBackToStep}
                    cartKey={cartKey}
                  />
                )}

                {steps === enumSteps.beforePayment && isNotSuccessPathname && (
                  <BeforePayment
                    goToPersonalData={handleAddNewUser}
                    goBackToStep={goBackToStep}
                    setFormValues={setFormValues}
                    formValues={formValues}
                    goToEditStep={goToEditStep}
                    cartKey={cartKey}
                    discountValue={discount}
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
  formContext: PropTypes.string,
  steps: PropTypes.number,
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
  formSubmitted: PropTypes.bool,
  availablePackages: PropTypes.array,
  totalRegistrations: PropTypes.shape({
    totalValidWithBus: PropTypes.number,
  }),
  totalSeats: PropTypes.number,
  totalBusVacancies: PropTypes.number,
  totalPackages: PropTypes.number,
  usedPackages: PropTypes.array,
  usedValidPackages: PropTypes.array,
  loading: PropTypes.bool,
  status: PropTypes.string,
  hasDiscount: PropTypes.bool,
  discount: PropTypes.number,
  personData: PropTypes.object,
  loggedUserRole: PropTypes.string,
  splitedLoggedUsername: PropTypes.string,
  adminPathname: PropTypes.bool,
  formPath: PropTypes.bool,
  isNotSuccessPathname: PropTypes.bool,
  age: PropTypes.number,
  handleAdminClick: PropTypes.func,
  handlePersonData: PropTypes.func,
  handleUpdateTotalSeats: PropTypes.func,
  handleUpdateTotalBusVacancies: PropTypes.func,
  handleUpdateTotalPackages: PropTypes.func,
  handleDiscountChange: PropTypes.func,
  resetFormValues: PropTypes.func,
  resetFormSubmitted: PropTypes.func,
  updateFormValues: PropTypes.func,
  initialStep: PropTypes.func,
  nextStep: PropTypes.func,
  skipTwoSteps: PropTypes.func,
  backStep: PropTypes.func,
  goBackToStep: PropTypes.func,
  sendForm: PropTypes.func,
  handleAddNewUser: PropTypes.func,
  currentFormIndex: PropTypes.number,
  setFormValues: PropTypes.func,
  goToEditStep: PropTypes.func,
  cartKey: PropTypes.string,
};

export default FormRoutes;
