import { useState } from 'react';
import { Link } from 'react-router-dom';
import InputMask from 'react-input-mask';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ptBR from 'date-fns/locale/pt';
import Icons from '../../components/Icons.jsx';

function FormPersonalData() {
  const [selectedDate, setSelectedDate] = useState(null);

  const rgShipper = [
    { value: 1, label: 'SDS - Secretaria de Defesa Social' },
    { value: 2, label: 'SSP - Secretaria de Segurança Pública' },
    { value: 3, label: 'SSPDS - Secretaria de Segurança Pública e Defesa Social' },
    { value: 4, label: 'SEDS - Secretaria de Estado de Defesa Social' },
    { value: 5, label: 'DPF - Departamento de Polícia Federal' },
    { value: 6, label: 'SSPC - Secretaria de Segurança Pública e Cidadania' },
    { value: 7, label: 'SSPT - Secretaria de Segurança Pública e Trânsito' },
    { value: 8, label: 'DETRAN - Departamento Estadual de Trânsito' },
    { value: 9, label: 'SSJ - Secretaria de Segurança e Justiça' },
    { value: 10, label: 'SSPPS - Secretaria de Segurança Pública e Polícia Social' },
    { value: 11, label: 'SESP - Secretaria de Estado de Segurança Pública' },
  ];

  const issuingState = [
    { value: 1, label: 'AC' },
    { value: 2, label: 'AL' },
    { value: 3, label: 'AP' },
    { value: 4, label: 'AM' },
    { value: 5, label: 'BA' },
    { value: 6, label: 'CE' },
    { value: 7, label: 'DF' },
    { value: 8, label: 'ES' },
    { value: 9, label: 'GO' },
    { value: 10, label: 'MA' },
    { value: 11, label: 'MT' },
    { value: 12, label: 'MS' },
    { value: 13, label: 'MG' },
    { value: 14, label: 'PA' },
    { value: 15, label: 'PB' },
    { value: 16, label: 'PR' },
    { value: 17, label: 'PE' },
    { value: 18, label: 'PI' },
    { value: 19, label: 'RJ' },
    { value: 20, label: 'RN' },
    { value: 21, label: 'RS' },
    { value: 22, label: 'RO' },
    { value: 23, label: 'RR' },
    { value: 24, label: 'SC' },
    { value: 25, label: 'SP' },
    { value: 26, label: 'SE' },
    { value: 27, label: 'TO' },
  ];

  return (
    <form className="bbp-forms" id="form-personal-data">
      <h1>Informações Pessoais</h1>
      <div className="row mb-5">
        <div className="col">
          <label htmlFor="name">Nome Completo:</label>
          <input type="text" />
        </div>
      </div>
      <div className="row justify-content-between mb-5">
        <div className="col-3">
          <label htmlFor="birthday">Data de Nascimento:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            locale={ptBR}
            autoComplete="off"
            dateFormat="dd/MM/yyyy"
            dropdownMode="select"
            id="birthday"
            maxDate={new Date()}
            name="birthday"
            placeholderText="dd/mm/aaaa"
            showMonthDropdown
            showYearDropdown
          />
        </div>
        <div className="col-3">
          <label htmlFor="cpf">CPF:</label>
          <InputMask mask="999.999.999-99" name="cpf" placeholder="000.000000-00" />
        </div>
        <div className="col-3">
          <label htmlFor="rg">RG:</label>
          <InputMask mask="9.999-999" name="rg" placeholder="0.000-000" />
        </div>
      </div>
      <div className="row mb-5">
        <div className="col-6">
          <label htmlFor="rg-shipper">Órgão Expedidor RG:</label>
          <select>
            <option>Selecione uma opção</option>
            {rgShipper.map((org) => (
              <option key={org.value} value={org.value}>
                {org.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6">
          <label htmlFor="rg-shipper-state">Estado de emissão órgão Expedidor:</label>
          <select>
            <option>Selecione uma opção</option>
            {issuingState.map((orgState) => (
              <option key={orgState.value} value={orgState.value}>
                {orgState.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row">
        <div className="col bbp-button">
          <Link to="/">
            <span className="bbp-btn-return">
              <Icons typeIcon="arrow-left" className="bbp-icon-arrow-left" iconSize={20} fill="#000" />
              VOLTAR
            </span>
          </Link>
        </div>
        <div className="col bbp-button">
          <Link to="/contato/">
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

export default FormPersonalData;
