import { useContext } from 'react';
import { isAdminPath } from './utils/pathname';
import CloseForm from './Pages/CloseForm';
import RoutesValidations from './Routes/RoutesValidations';
import Skelleton from './components/Global/Skelleton';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';

function App() {
  const { formContext, loading } = useContext(AuthContext);
  const windowPathname = window.location.pathname;
  const adminPathname = isAdminPath(windowPathname);

  console.error = (message) => {
    if (message.startsWith('Uncaught ReferenceError: originalError is not defined at App.console.error')) {
      return;
    }
  };

  if (loading && !adminPathname) {
    return <Skelleton />;
  }

  return (
    <>
      {(formContext === 'form-on' ||
        formContext === 'form-off' ||
        formContext === 'form-waiting' ||
        formContext === 'maintenance') && <RoutesValidations formContext={formContext} />}

      {formContext === 'form-closed' && <CloseForm />}

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
