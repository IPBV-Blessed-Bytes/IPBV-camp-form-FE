import React from 'react';
import { Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminTableField from './adminTableField';
import { packages } from '../../../Pages/Routes/constants';

const AdminTableColumns = ({ addFormData, editFormData, handleFormChange, addForm, editForm }) => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  const packageOptions = packages.map((pkg) => ({
    label: pkg,
    value: pkg,
  }));

  const fields = [
    {
      label: 'Pacote',
      name: 'package.title',
      type: 'select',
      placeholder: 'Selecione um pacote',
      options: packageOptions,
    },
    { label: 'Nome', name: 'personalInformation.name', type: 'text', placeholder: 'Nome do Acampante' },
    { label: 'Observação', name: 'observation', type: 'text', placeholder: 'Observação sobre inscrição' },
    {
      label: 'Pagamento',
      name: 'formPayment.formPayment',
      type: 'select',
      placeholder: 'Selecione status de pagamento',
      options: [
        { label: 'Pago', value: 'Pago' },
        { label: 'Não Pago', value: 'Não Pago' },
      ],
    },
    {
      label: 'Igreja',
      name: 'contact.church',
      type: 'select',
      placeholder: 'Selecione sua igreja',
      options: [
        { label: 'IPBV', value: 'IPBV' },
        { label: 'Outra', value: 'Outra' },
      ],
    },
    {
      label: 'Vai de Carro',
      name: 'contact.car',
      type: 'select',
      placeholder: 'Selecione se vai de carro',
      options: [
        { label: 'Sim', value: 'Sim' },
        { label: 'Não', value: 'Não' },
      ],
    },
    {
      label: 'Precisa de Carona',
      name: 'contact.needRide',
      type: 'select',
      placeholder: 'Selecione se precisa de carona',
      options: [
        { label: 'Sim', value: 'Sim' },
        { label: 'Não', value: 'Não' },
      ],
    },
    { label: 'Vagas de Carona', name: 'contact.numberVacancies', type: 'number', placeholder: '0' },
    {
      label: 'Data de Inscrição',
      name: 'registrationDate',
      type: 'text',
      value: editForm ? editFormData.registrationDate : formattedDate,
      disabled: true,
    },
    { label: 'Nascimento', name: 'personalInformation.birthday', type: 'text', placeholder: '01/01/1990' },
    { label: 'CPF', name: 'personalInformation.cpf', type: 'number', placeholder: '1234567890' },
    { label: 'RG', name: 'personalInformation.rg', type: 'number', placeholder: '0123456' },
    { label: 'Órgão Expedidor', name: 'personalInformation.rgShipper', type: 'text', placeholder: 'SDS' },
    { label: 'Estado Expedidor', name: 'personalInformation.rgShipperState', type: 'text', placeholder: 'PE' },
    {
      label: 'Categoria',
      name: 'personalInformation.gender',
      type: 'select',
      placeholder: 'Selecione sua categoria/gênero',
      options: [
        { label: 'Criança', value: 'Criança' },
        { label: 'Homem', value: 'Homem' },
        { label: 'Mulher', value: 'Mulher' },
      ],
    },
    { label: 'Celular', name: 'contact.cellPhone', type: 'number', placeholder: '81993727854' },
    {
      label: 'Whatsapp',
      name: 'contact.isWhatsApp',
      type: 'select',
      placeholder: 'Selecione se número é whatsapp',
      options: [
        { label: 'Sim', value: 'Sim' },
        { label: 'Não', value: 'Não' },
      ],
    },
    { label: 'Email', name: 'contact.email', type: 'text', placeholder: 'teste@teste.com' },
    { label: 'Preço Total', name: 'totalPrice', type: 'number', placeholder: '500' },
    { label: 'Alergia', name: 'contact.allergy', type: 'text', placeholder: 'Quais alergias' },
    { label: 'Agregados', name: 'contact.aggregate', type: 'text', placeholder: 'Quais agregados' },
    {
      label: 'Acomodação',
      name: 'package.accomodation.name',
      type: 'select',
      placeholder: 'Selecione a acomodação',
      options: [
        { label: 'Colégio', value: 'Colégio' },
        { label: 'Seminário', value: 'Seminário' },
        { label: 'Outro', value: 'Outro' },
      ],
    },
    {
      label: 'Sub Acomodação',
      name: 'package.accomodation.subAccomodation',
      type: 'select',
      placeholder: 'Selecione a sub acomodação',
      options: [
        { label: 'Colégio Individual', value: 'Colégio Individual' },
        { label: 'Colégio Família', value: 'Colégio Família' },
        { label: 'Colégio Camping', value: 'Colégio Camping' },
        { label: 'Seminário Individual', value: 'Seminário Individual' },
        { label: 'Outra', value: 'Outra' },
      ],
    },
    {
      label: 'Alimentação Extra',
      name: 'extraMeals.someFood',
      type: 'select',
      placeholder: 'Selecione se terá alimentação extra',
      options: [
        { label: 'Sim', value: 'Sim' },
        { label: 'Não', value: 'Não' },
      ],
    },
    {
      label: 'Dias de Alimentação Extra',
      name: 'extraMeals.extraMeals',
      type: 'text',
      placeholder: 'Domingo, Segunda, Terça, etc.',
    },
    {
      label: 'Alimentação',
      name: 'package.food',
      type: 'text',
      placeholder: 'Café da manhã, almoço e jantar; Almoço e jantar ou Sem Alimentação',
    },
    {
      label: 'Transporte',
      name: 'package.transportation',
      type: 'select',
      placeholder: 'Selecione tipo de transporte',
      options: [
        { label: 'Com Ônibus', value: 'Com Ônibus' },
        { label: 'Sem Ônibus', value: 'Sem Ônibus' },
      ],
    },
  ];

  return (
    <Row>
      {fields.map((field, index) => (
        <AdminTableField
          key={index}
          label={field.label}
          type={field.type || 'text'}
          name={field.name}
          value={
            field.name === 'registrationDate'
              ? editForm
                ? editFormData.registrationDate
                : formattedDate
              : editForm
              ? editFormData[field.name.split('.')[0]][field.name.split('.')[1]]
              : addFormData[field.name.split('.')[0]]?.[field.name.split('.')[1]]
          }
          onChange={handleFormChange}
          placeholder={addForm ? field.placeholder : ''}
          addForm={addForm}
          disabled={field.disabled || false}
          options={field.options || []}
        />
      ))}
    </Row>
  );
};

export default AdminTableColumns;
