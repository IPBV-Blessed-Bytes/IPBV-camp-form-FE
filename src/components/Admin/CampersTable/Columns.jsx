import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ColumnsFields from './ColumnsFields';
import { issuingState, rgShipper, food } from '@/utils/constants';

const Columns = ({ addFormData, editFormData, handleFormChange, addForm, editForm, formSubmitted, currentDate }) => {
  const [missingFields, setMissingFields] = useState([]);

  const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const normalizedFoodOptions = food.map((item) => ({
    value: removeAccents(item.value),
    label: item.label,
  }));

  const fields = [
    {
      label: 'Nome',
      name: 'personalInformation.name',
      type: 'text',
      placeholder: 'Nome do Acampante',
      oddOrEven: 'even',
    },
    {
      label: 'Forma de Pagamento',
      name: 'formPayment.formPayment',
      type: 'select',
      placeholder: 'Selecione pagamento',
      oddOrEven: 'odd',
      required: true,
      errorMessage: 'Selecione a forma de pagamento',
      options: [
        { label: 'Cartão de Crédito', value: 'creditCard' },
        { label: 'PIX', value: 'pix' },
        { label: 'Boleto Bancário', value: 'boleto' },
        { label: 'Não Pagante', value: 'nonPaid' },
      ],
    },
    {
      label: 'Igreja',
      name: 'contact.church',
      type: 'select',
      placeholder: 'Selecione sua igreja',
      oddOrEven: 'even',
      options: [
        { label: 'IPBV', value: 'IPBV' },
        { label: 'Outra', value: 'Outra' },
      ],
    },
    {
      label: 'Data de Nascimento',
      name: 'personalInformation.birthday',
      type: 'date',
      placeholder: 'dd/mm/aaaa',
      oddOrEven: 'odd',
      required: true,
      errorMessage: 'Insira uma data de nascimento válida no formato (00/00/0000)',
    },
    {
      label: 'CPF',
      name: 'personalInformation.cpf',
      type: 'number',
      placeholder: '1234567890',
      oddOrEven: 'even',
      required: true,
      errorMessage: 'Insira um CPF válido',
    },
    { label: 'RG', name: 'personalInformation.rg', type: 'number', placeholder: '0123456', oddOrEven: 'odd' },
    {
      label: 'Órgão Emissor',
      name: 'personalInformation.rgShipper',
      type: 'select',
      placeholder: 'Selecione uma secretaria',
      oddOrEven: 'even',
      options: rgShipper,
    },
    {
      label: 'Estado Emissor',
      name: 'personalInformation.rgShipperState',
      type: 'select',
      placeholder: 'Selecione um estado',
      oddOrEven: 'odd',
      options: issuingState,
    },
    {
      label: 'Tem Carona a oferecer',
      name: 'contact.car',
      type: 'select',
      placeholder: 'Selecione se vai de carro',
      oddOrEven: 'even',
      options: [
        { label: 'Sim', value: true },
        { label: 'Não', value: false },
      ],
    },
    { label: 'Vagas de Carona', name: 'contact.numberVacancies', type: 'number', placeholder: '0', oddOrEven: 'odd' },
    {
      label: 'Precisa de Carona',
      name: 'contact.needRide',
      type: 'select',
      placeholder: 'Selecione se precisa de carona',
      oddOrEven: 'even',
      options: [
        { label: 'Sim', value: true },
        { label: 'Não', value: false },
      ],
    },
    {
      label: 'Observação da Carona',
      name: 'contact.rideObservation',
      type: 'text',
      placeholder: 'Observação de carona',
      oddOrEven: 'odd',
    },
    {
      label: 'Data de Inscrição',
      name: 'registrationDate',
      type: 'text',
      value: editForm ? editFormData.registrationDate : currentDate,
      disabled: true,
      oddOrEven: 'even',
    },
    {
      label: 'Categoria',
      name: 'personalInformation.gender',
      type: 'select',
      placeholder: 'Selecione sua categoria/gênero',
      oddOrEven: 'odd',
      options: [
        { label: 'Criança', value: 'Crianca' },
        { label: 'Homem', value: 'Homem' },
        { label: 'Mulher', value: 'Mulher' },
      ],
    },
    { label: 'Celular', name: 'contact.cellPhone', type: 'number', placeholder: '81993727854', oddOrEven: 'even' },
    {
      label: 'Whatsapp',
      name: 'contact.isWhatsApp',
      type: 'select',
      placeholder: 'Selecione se número é whatsapp',
      oddOrEven: 'odd',
      options: [
        { label: 'Sim', value: true },
        { label: 'Não', value: false },
      ],
    },
    { label: 'Email', name: 'contact.email', type: 'text', placeholder: 'teste@teste.com', oddOrEven: 'even' },
    { label: 'Preço', name: 'totalPrice', type: 'number', placeholder: '500', oddOrEven: 'odd' },
    { label: 'Alergia', name: 'contact.allergy', type: 'text', placeholder: 'Quais alergias', oddOrEven: 'even' },
    { label: 'Agregados', name: 'contact.aggregate', type: 'text', placeholder: 'Quais agregados', oddOrEven: 'odd' },
    {
      label: 'Hospedagem',
      name: 'package.accomodation.name',
      type: 'select',
      placeholder: 'Selecione a hospedagem',
      oddOrEven: 'even',
      options: [
        { label: 'Colégio Quarto Coletivo', value: 'Colégio Quarto Coletivo' },
        { label: 'Colégio Quarto Família', value: 'Colégio Quarto Família' },
        { label: 'Colégio Camping', value: 'Colégio Camping' },
        { label: 'Seminário Sao Jose', value: 'Seminário' },
        { label: 'Outra Hospedagem Externa', value: 'Externo' },
      ],
    },
    {
      label: 'Transporte',
      name: 'package.transportation.name',
      type: 'select',
      placeholder: 'Selecione tipo de transporte',
      oddOrEven: 'odd',
      options: [
        { label: 'Com Ônibus', value: 'Com Onibus' },
        { label: 'Sem Ônibus', value: 'Sem Onibus' },
      ],
    },
    {
      label: 'Alimentação',
      name: 'package.food.name',
      type: 'select',
      placeholder: 'Selecione a alimentação',
      oddOrEven: 'even',
      options: normalizedFoodOptions,
    },
    {
      label: 'Refeição Extra',
      name: 'extraMeals.someFood',
      type: 'select',
      placeholder: 'Selecione se terá refeição extra',
      oddOrEven: 'odd',
      options: [
        { label: 'Sim', value: true },
        { label: 'Não', value: false },
      ],
    },
    {
      label: 'Refeição Extra (dias)',
      name: 'extraMeals.extraMeals',
      type: 'text',
      placeholder: 'Domingo, Segunda, Terça, etc.',
      oddOrEven: 'even',
    },
    {
      label: 'Nome do Resp. Legal',
      name: 'personalInformation.legalGuardianName',
      type: 'text',
      placeholder: 'Nome do Responsável Legal',
      oddOrEven: 'odd',
    },
    {
      label: 'CPF do Resp. Legal',
      name: 'personalInformation.legalGuardianCpf',
      type: 'number',
      placeholder: '1234567890',
      oddOrEven: 'even',
      errorMessage: 'Insira um CPF válido',
    },
    {
      label: 'Celular do Resp. Legal',
      name: 'personalInformation.legalGuardianCellPhone',
      type: 'number',
      placeholder: '81993727854',
      oddOrEven: 'odd',
    },
    {
      label: 'Observação',
      name: 'observation',
      type: 'text',
      placeholder: 'Observação sobre essa inscrição',
      oddOrEven: 'even',
    },
    {
      label: 'Equipe',
      name: 'crew',
      type: 'select',
      placeholder: 'Selecione se é equipante',
      oddOrEven: 'odd',
      options: [
        { label: 'Sim', value: true },
        { label: 'Não', value: false },
      ],
    },
    {
      label: 'Família Pastoral',
      name: 'pastoralFamily',
      type: 'select',
      placeholder: 'Selecione se é família pastoral',
      oddOrEven: 'even',
      options: [
        { label: 'Sim', value: true },
        { label: 'Não', value: false },
      ],
    },
  ];

  const validateFields = useCallback(() => {
    const missing = [];

    fields.forEach((field) => {
      if (field.required) {
        const fieldValue = editForm
          ? editFormData[field.name.split('.')[0]]?.[field.name.split('.')[1]]
          : addFormData[field.name.split('.')[0]]?.[field.name.split('.')[1]];

        if (!fieldValue) {
          missing.push(field.name);
        }
      }
    });

    return missing;
  }, [addFormData, editFormData, fields]);

  useEffect(() => {
    const missing = validateFields();

    if (JSON.stringify(missing) !== JSON.stringify(missingFields)) {
      setMissingFields(missing);
    }
  }, [validateFields]);

  return (
    <Row>
      {fields.map((field, index) => {
        const isRegistrationDate = field.name === 'registrationDate';
        const isEditForm = editForm;
        const isNestedField = field.name.includes('.');

        const getNestedValue = (data) => data[field.name.split('.')[0]]?.[field.name.split('.')[1]];

        const value = isRegistrationDate
          ? isEditForm
            ? editFormData.registrationDate
            : currentDate
          : isEditForm
          ? isNestedField
            ? getNestedValue(editFormData)
            : editFormData[field.name]
          : isNestedField
          ? getNestedValue(addFormData)
          : addFormData[field.name];

        return (
          <ColumnsFields
            key={index}
            label={field.label}
            type={field.type || 'text'}
            name={field.name}
            value={value}
            onChange={handleFormChange}
            placeholder={addForm ? field.placeholder : ''}
            addForm={addForm}
            disabled={field.disabled || false}
            options={field.options || []}
            required={field.required}
            errorMessage={field.errorMessage}
            oddOrEven={field.oddOrEven}
            formSubmitted={formSubmitted}
            missingFields={missingFields}
          />
        );
      })}
    </Row>
  );
};

Columns.propTypes = {
  addFormData: PropTypes.string,
  handleFormChange: PropTypes.func,
  addForm: PropTypes.bool,
  editForm: PropTypes.bool,
  formSubmitted: PropTypes.bool,
  currentDate: PropTypes.string,
  editFormData: PropTypes.shape({
    registrationDate: PropTypes.string,
  }),
};

export default Columns;
