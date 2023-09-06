import { Link } from 'react-router-dom';
import Icons from '../../components/Icons';

const FormSuccess = () => {
  return (
    <div className="bbp-success-message">
      <div className="bbp-success-card">
        <h3>
          <b>Formulário enviado com sucesso!</b>
        </h3>
        <p>Obrigado por enviar suas informações.</p>
        <br />
        <p>
          <b>Qualquer dúvida, entraremos em contato.</b>
        </p>
        <small>
          <em>Igreja Presbiteriana de Boa Viagem</em>
        </small>
      </div>

      <div className="bbp-success-button">
        <Link to="/">
          <span className="bbp-btn-redo">
            NOVO CADASTRO
            <Icons typeIcon="arrow-right" className="bbp-icon-arrow-right" iconSize={20} fill="#000" />
          </span>
        </Link>
      </div>
    </div>
  );
};

export default FormSuccess;
