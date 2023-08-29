import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icons from '../../components/Icons.jsx';

function FormPackages() {
  const [accommodationValue, setAccommodationValue] = useState('');
  const [transportationValue, setTransportationValue] = useState('');
  const [foodValue, setFoodValue] = useState('');

  const calculateTotal = () => {
    let totalValue = 0;

    if (accommodationValue === 'school') {
      if (transportationValue === 'bus') totalValue += 160;
      if (foodValue === 'food') totalValue += 280;
      if (foodValue === 'other') totalValue += 0;
    } else if (accommodationValue === 'seminary') {
      totalValue += 600;
      if (transportationValue === 'bus') totalValue += 160;
      if (foodValue === 'food') totalValue += 200;
      if (foodValue === 'other') totalValue += 0;
    } else if (accommodationValue === 'hotel') {
      totalValue += 550;
      if (transportationValue === 'bus') totalValue += 160;
      if (foodValue === 'food') totalValue += 200;
      if (foodValue === 'other') totalValue += 0;
    } else if (accommodationValue === 'other') {
      totalValue += 0;
      if (transportationValue === 'bus') totalValue += 160;
      if (foodValue === 'food') totalValue += 280;
      if (foodValue === 'other') totalValue += 0;
    }

    return totalValue;
  };

  return (
    <form className="bbp-forms" id="form-packages">
      <h1>Pacotes</h1>
      <div className="row mb-5">
        <div className="col">
          <label htmlFor="accommodation">Escolha a hospedagem:</label>
          <select value={accommodationValue} onChange={(e) => setAccommodationValue(e.target.value)}>
            <option value="">Selecione uma opção</option>
            <option value="school">Colégio XV de Novembro</option>
            <option value="seminary">Seminário São José</option>
            <option value="hotel">Hotel Ibis</option>
            <option value="other">Outro</option>
          </select>
        </div>
      </div>
      <div className="row mb-5">
        <div className="col">
          <label htmlFor="transportation">Escolha o transporte:</label>
          <select value={transportationValue} onChange={(e) => setTransportationValue(e.target.value)}>
            <option value="">Selecione uma opção</option>
            <option value="bus">Ônibus</option>
            <option value="other">Outro</option>
          </select>
        </div>
      </div>
      <div className="row mb-5">
        <div className="col">
          <label htmlFor="food">Escolha a alimentação:</label>
          <select value={foodValue} onChange={(e) => setFoodValue(e.target.value)}>
            <option value="">Selecione uma opção</option>
            <option value="food">Com Alimentação</option>
            <option value="other">Sem Alimentação</option>
          </select>
        </div>
      </div>
      <div className="bbp-counter">
        <p>
          Valor total: R$
          <u>
            <em>{calculateTotal()} </em>
          </u>
        </p>
      </div>
      <div className="row">
        <div className="col bbp-button">
          <Link to="/contato">
            <span className="bbp-btn-return">
              <Icons typeIcon="arrow-left" className="bbp-icon-arrow-left" iconSize={20} fill="#000" />
              VOLTAR
            </span>
          </Link>
        </div>
        <div className="col bbp-button">
          <Link to="/pagamento/">
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

export default FormPackages;
