import Offline from './Pages/Offline';
import FormRoutes from './Pages/Routes';

function App() {
  const toggleSite = 'form-on';
  return (
    <>
      {toggleSite === 'form-on' && <FormRoutes />}
      {toggleSite === 'form-off' && <Offline />}
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
