import { useContext, useEffect, useState } from 'react';
import { isAdminPath } from './utils/pathname';
import CloseForm from './Pages/CloseForm';
import RoutesValidations from './Routes/RoutesValidations';
import Skelleton from './components/Global/Skelleton';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';
import { initBaseDate } from './Pages/Packages/utils/calculateAge';

function App() {
  const { formContext, loading } = useContext(AuthContext);
  const [baseDateLoading, setBaseDateLoading] = useState(true);

  const windowPathname = window.location.pathname;
  const adminPathname = isAdminPath(windowPathname);

  useEffect(() => {
    const loadBaseDate = async () => {
      await initBaseDate();
      setBaseDateLoading(false);
    };

    loadBaseDate();
  }, []);

  const isAppLoading = loading || baseDateLoading;

  if (isAppLoading && !adminPathname) {
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
