import { Link } from 'react-router-dom';
import Icons from '../../components/Icons.jsx';

function FormPayment() {

  return (
    <form className="bbp-forms" id="form-payment">
      <h1>Pagamento</h1>
      <div className="row">
        <div className="col"></div>
      </div>
      <div className="row">
        <div className="col bbp-button">
          <Link to="/pacotes">
            <span className="bbp-btn-return">
              <Icons typeIcon="arrow-left" className="bbp-icon-arrow-left" iconSize={20} fill="#000" />
              VOLTAR
            </span>
          </Link>
        </div>
        <div className="col bbp-button">
          <Link to="/enviado">
            <span className="bbp-btn-submit">
              ENVIAR
              <Icons typeIcon="arrow-right" className="bbp-icon-arrow-right" iconSize={20} fill="#000" />
            </span>
          </Link>
        </div>
      </div>
    </form>
  );
}

export default FormPayment;
