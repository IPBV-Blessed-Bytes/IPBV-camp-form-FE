import { Link } from 'react-router-dom';

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
              VOLTAR
            </span>
          </Link>
        </div>
        <div className="col bbp-button">
          <Link to="/enviado">
            <span className="bbp-btn-submit">
              ENVIAR
            </span>
          </Link>
        </div>
      </div>
    </form>
  );
}

export default FormPayment;
