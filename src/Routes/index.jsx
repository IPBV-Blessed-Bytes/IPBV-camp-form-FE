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
  currentFormValues,
  discount,
  formContext,
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
                formSubmitted={formSubmitted}
                formValues={formValues}
                goToStep={goToStep}
                handlePreFill={handlePreFill}
                hasFood={hasFood}
                highestStepReached={highestStepReached}
                showNavMenu={true}
                steps={steps}
              />

              {steps !== enumSteps.beforePayment && isNotSuccessPathname && (
                <div className="form__container container">
                  {steps === enumSteps.home && isNotSuccessPathname && <FormHome nextStep={nextStep} />}
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

                  {steps === enumSteps.packages && isNotSuccessPathname && (
                    <FormPackages
                      age={age}
                      backStep={backStep}
                      cartKey={cartKey}
                      currentFormIndex={currentFormIndex}
                      currentFormValues={currentFormValues}
                      discount={discount}
                      hasDiscount={hasDiscount}
                      nextStep={nextStep}
                      totalRegistrationsGlobal={totalRegistrations}
                      totalSeats={totalSeats}
                      updateForm={updateFormValues('package')}
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
                    <FinalReview backStep={backStep} nextStep={nextStep} updateForm={updateFormValues('finalReview')} />
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
                </div>
              )}

              <div className="form__container">
                {steps === enumSteps.beforePayment && isNotSuccessPathname && (
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
                )}
              </div>

              <InfoButton timeout />

              <Footer handleAdminClick={handleAdminClick} />
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
                totalRegistrations={totalRegistrations}
                totalSeats={totalSeats}
                totalValidWithBus={totalRegistrations.totalValidWithBus}
                userRole={userRole}
              />
            }
          />
          <Route
            path="/admin/acampantes"
            element={
              <ProtectedRoute
                allowedRoles={['admin', 'collaborator', 'collaborator-viewer', 'ride-manager']}
                userRole={userRole}
              >
                <AdminCampers loggedUsername={loggedUsername} userRole={userRole} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/carona"
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={userRole}>
                <AdminRide loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/descontos"
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator', 'collaborator-viewer']} userRole={userRole}>
                <AdminDiscount loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quartos"
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={userRole}>
                <AdminRooms loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/alimentacao"
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={userRole}>
                <AdminExtraMeals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/checkin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'checker']} userRole={userRole}>
                <AdminCheckin loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/painel"
            element={
              <ProtectedRoute
                allowedRoles={['admin', 'collaborator', 'collaborator-viewer', 'checker']}
                userRole={userRole}
              >
                <AdminDataPanel
                  totalPackages={totalPackages}
                  usedPackages={usedPackages}
                  usedValidPackages={usedValidPackages}
                  userRole={userRole}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                <AdminUserLogs loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vagas"
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                <AdminSeatManagement
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
            path="/admin/contexto"
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                <AdminFormContext loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                <AdminUsersManagement loggedUsername={loggedUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/opiniao"
            element={
              <ProtectedRoute allowedRoles={['admin', 'collaborator']} userRole={userRole}>
                <AdminFeedback loggedUsername={loggedUsername} />
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
  availablePackages: PropTypes.array,
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
    formPayment: PropTypes.object,
  }),
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
