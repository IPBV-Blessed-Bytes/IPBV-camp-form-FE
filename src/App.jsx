import { useState, useEffect } from 'react';
import CloseForm from './Pages/CloseForm';
import RoutesValidations from './Routes/RoutesValidations';
import fetcher from '@/fetchers/fetcherWithCredentials';

function App() {
  const [formContext, setFormContext] = useState('');

  console.error = (message) => {
    if (message.startsWith('Uncaught ReferenceError: originalError is not defined at App.console.error')) {
      return;
    }
  };

  const fetchFormContext = async () => {
    try {
      const response = await fetcher.get('form-context');
      setFormContext(response);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchFormContext();
  }, []);

  return (
    <>
      {(formContext === 'form-on' || formContext === 'form-off' || formContext === 'form-waiting') && (
        <RoutesValidations formContext={formContext} />
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
