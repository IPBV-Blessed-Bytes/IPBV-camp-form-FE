import { useState, useEffect } from 'react';
import { isAdminPath } from './utils/pathname';
import CloseForm from './Pages/CloseForm';
import RoutesValidations from './Routes/RoutesValidations';
import fetcher from '@/fetchers/fetcherWithCredentials';
import Skelleton from './components/Global/Skelleton';

function App() {
  const [formContext, setFormContext] = useState('');
  const [loading, setLoading] = useState(true);
  const windowPathname = window.location.pathname;
  const adminPathname = isAdminPath(windowPathname);

  console.error = (message) => {
    if (message.startsWith('Uncaught ReferenceError: originalError is not defined at App.console.error')) {
      return;
    }
  };

  useEffect(() => {
    const fetchFormContext = async () => {
      try {
        const response = await fetcher.get('form-context');
        setFormContext(response.data.formContext);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormContext();
  }, []);

  if (loading && !adminPathname) {
    return <Skelleton />;
  }

  return (
    <>
      {(formContext === 'form-on' || formContext === 'form-off' || formContext === 'form-waiting') && (
        <RoutesValidations formContext={formContext} />
      )}

      {formContext === 'form-closed' && <CloseForm />}

      {formContext === 'maintenance' && (
        <b className="display-6 d-flex flex-column align-items-center px-4 mt-5">
          SITE EM MANUTENÇÃO. RETORNE EM OUTRO MOMENTO!
        </b>
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
