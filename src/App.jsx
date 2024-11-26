import CloseForm from './Pages/CloseForm';
import Offline from './Pages/Offline';
import FormRoutes from './Pages/Routes';

function App() {
  const toggleSite = 'form-on';

  console.error = (message) => {
    if (message.startsWith('Uncaught ReferenceError: originalError is not defined at App.console.error')) {
      return;
    }
  };

  return (
    <>
      {toggleSite === 'form-on' && <FormRoutes />}
      {toggleSite === 'form-off' && <Offline />}
      {toggleSite === 'form-closed' && <CloseForm />}
      {toggleSite === 'blank-page' && (
        <>
          <b className="display-6 d-flex flex-column align-items-center px-4 mt-5">
            TEMPORARIAMENTE INDISPONÍVEL. RETORNE EM BREVE!
          </b>
        </>
      )}
      {toggleSite === 'google-forms' && (
        <div
          style={{
            width: '100vw',
            height: '100vh',
            overflowX: 'hidden',
          }}
        >
          <iframe></iframe>
        </div>
      )}
    </>
  );
}

export default App;
