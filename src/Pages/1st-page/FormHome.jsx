import { Link } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import Icons from '../../components/Icons.jsx';

function FormHome() {
  return (
    <form className="bbp-forms" id="form-home">
      <h1>Bem-Vindo</h1>
      <div className="row mb-5">
        <div className="col">
          <h3 className="mb-2">Acampamento no período de carnaval 2024</h3>
          <h5 className="mb-2">Igreja Presbiteriana de Boa Viagem</h5>
          <p className="mb-2">Siga o passo a passo para completar sua inscrição. </p>
          <p className="mb-2">
            Qualquer dúvida, favor contactar a secretaria da igreja no telefone <em>(81) 9839-0194</em>.
          </p>
        </div>
      </div>
      <div className="row">
        <div className="col bbp-button">
          <Link to="/dados/">
            <span id="bbp-btn-home" className="bbp-btn-submit">
              INICIAR
              <Icons typeIcon="arrow-right" className="bbp-icon-arrow-right" iconSize={20} fill="#000" />
            </span>
          </Link>
        </div>
      </div>
    </form>
  );
}

export default FormHome;
