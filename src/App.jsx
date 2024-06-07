import AdminTable from './Pages/Admin/adminTable';
import ChooseWay from './Pages/ChooseWay';
import CloseForm from './Pages/CloseForm';
import Offline from './Pages/Offline';
import FormRoutes from './Pages/Routes';

function App() {
  const toggleSite = 'table';

  console.error = (message) => {
    if (message.startsWith('Uncaught ReferenceError: originalError is not defined at App.console.error')) {
      return;
    }
  };

  return (
    <>
      {toggleSite === 'choose-way' && <ChooseWay />}
      {toggleSite === 'form-on' && <FormRoutes />}
      {toggleSite === 'form-off' && <Offline />}
      {toggleSite === 'form-closed' && <CloseForm />}
      {toggleSite === 'table' && <AdminTable />}
      {toggleSite === 'blank-page' && (
        <>
          <b className="display-6 d-flex flex-column align-items-center px-4 mt-5">
            TEMPORARIAMENTE INDISPONÍVEL. RETORNE EM BREVE!
          </b>
        </>
      )}
      {toggleSite === 'google' && (
        <div
          style={{
            width: '100vw',
            height: '100vh',
            overflowX: 'hidden',
          }}
        >
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSdfSPsDeRU7P5gP0Rv7IXlFB_C4VoCP7JZEcban-Za8qiKmQw/viewform?embedded=true"
            width="100%"
            height="100%"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
          ></iframe>
        </div>
      )}
    </>
  );
}

export default App;
