import { useContext, useEffect, useState } from 'react';
import { isAdminPath, shouldRenderForm } from './utils/pathname';
import CloseForm from './Pages/CloseForm';
import RoutesValidations from './Routes/RoutesValidations';
import Skelleton from './components/Global/Skelleton';
import Loading from './components/Global/Loading';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';
import { initBaseDate } from './Pages/Packages/utils/calculateAge';

function App() {
  const { formStage, loading } = useContext(AuthContext);
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
    return shouldRenderForm(windowPathname) ? <Skelleton /> : <Loading loading />;
  }

  return (
    <>
      {(formStage === 'form-on' ||
        formStage === 'form-off' ||
        formStage === 'form-waiting' ||
        formStage === 'maintenance') && <RoutesValidations formStage={formStage} />}

      {formStage === 'form-closed' && <CloseForm />}

      {formStage === 'google-forms' && (
        <div className="google-forms-frame">
          <iframe></iframe>
        </div>
      )}
    </>
  );
}

export default App;
