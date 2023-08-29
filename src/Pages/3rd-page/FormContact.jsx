import { useState } from 'react';
import { Link } from 'react-router-dom';
import InputMask from 'react-input-mask';
import Icons from '../../components/Icons.jsx';

function FormContact() {
  const [hasAllergy, setHasAllergy] = useState(false);

  return (
    <form className="bbp-forms" id="form-contact">
      <h1>Contato</h1>
      <div className="row mb-5">
        <div className="col-3">
          <label htmlFor="cellphone">Telefone:</label>
          <InputMask mask="(99) 99999-9999" name="cellphoneNumber" placeholder="(00) 00000-0000" />
        </div>
        <div className="col-2 bbp-radio-group">
          <label htmlFor="cellphone-confirmation">É whatsapp?</label>
          <div className="bbp-radio-options">
            <label>
              <input type="radio" name="wpp" id="wpp-one" />
              &nbsp;Sim
            </label>
            <label>
              <input type="radio" name="wpp" id="wpp-two" />
              &nbsp;Não
            </label>
          </div>
        </div>
        <div className="col-7">
          <label htmlFor="email">Email:</label>
          <input type="email" />
        </div>
      </div>
      <div className="row mb-5">
        <div className="col-5 bbp-radio-group">
          <label htmlFor="allergy">Possui Alergia?</label>
          <small>(Se tiver alguma alergia, selecione sim.)</small>
          <div className="bbp-radio-options">
            <label>
              <input type="radio" name="allergy" id="allergy-one" onChange={() => setHasAllergy(true)} />
              &nbsp;Sim
            </label>
            <label>
              <input type="radio" name="allergy" id="allergy-two" onChange={() => setHasAllergy(false)} />
              &nbsp;Não
            </label>
          </div>
        </div>
        {hasAllergy && (
          <div className="col-7">
            <label htmlFor="allergy-confirmation">Qual alergia?</label>
            <small> (Se você tiver alergia a algo, por favor nos informe.)</small>
            <textarea name="allergy-confirmation" rows="2" cols="50" />
          </div>
        )}
      </div>
      <div className="row">
        <div className="col bbp-button">
          <Link to="/dados">
            <span className="bbp-btn-return">
              <Icons typeIcon="arrow-left" className="bbp-icon-arrow-left" iconSize={20} fill="#000" />
              VOLTAR
            </span>
          </Link>
        </div>
        <div className="col bbp-button">
          <Link to="/pacotes/">
            <span className="bbp-btn-submit">
              PRÓXIMA
              <Icons typeIcon="arrow-right" className="bbp-icon-arrow-right" iconSize={20} fill="#000" />
            </span>
          </Link>
        </div>
      </div>
    </form>
  );
}

export default FormContact;
