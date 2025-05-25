import CloseForm from './Pages/CloseForm';
import FormRoutes from './Routes';

function App() {
  const formContext = 'form-off';

  console.error = (message) => {
    if (message.startsWith('Uncaught ReferenceError: originalError is not defined at App.console.error')) {
      return;
    }
  };

  return (
    <>
      {(formContext === 'form-on' || formContext === 'form-off' || formContext === 'form-waiting') && (
        <FormRoutes formContext={formContext} />
      )}
      {formContext === 'form-closed' && <CloseForm />}
      {formContext === 'maintenance' && (
        <>
          <b className="display-6 d-flex flex-column align-items-center px-4 mt-5">
            SITE EM MANUTENÇÃO. RETORNE EM OUTRO MOMENTO!
          </b>
        </>
      )}
      {formContext === 'google-forms' && (
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
