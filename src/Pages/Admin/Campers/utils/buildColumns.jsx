/* eslint-disable react/prop-types */
import { Form, Button } from 'react-bootstrap';

import { CREW_OPTIONS } from '@/utils/constants';
import calculateAge from '@/Pages/Packages/utils/calculateAge';
import Icons from '@/components/Global/Icons';
import ColumnFilter from '@/components/Admin/CampersTable/ColumnFilter';
import ColumnFilterWithSelect from '@/components/Admin/CampersTable/ColumnFilterWithSelect';
import ColumnFilterWithTwoValues from '@/components/Admin/CampersTable/ColumnFilterWithTwoValues';

import { alphabeticalSort, ageFilterFn } from './tableFilters';

const ORDER_URL_PREFIX = 'https://dash.pagar.me/merch_Al154387U9uZDPV2/acc_5d3nayjiPBsdGnA0/orders/';

const filterWith = (setFilteredRows, FilterComponent, extraProps = {}) =>
  function ColumnFilterWrapper({ column }) {
    return (
      <FilterComponent
        column={column}
        {...extraProps}
        onFilterChange={() => setFilteredRows(column.filteredRows)}
      />
    );
  };

export const makeDefaultFilter = (setFilteredRows) => filterWith(setFilteredRows, ColumnFilter);

const renderOrDash = ({ value }) => value || '-';
const renderPipedList = ({ value }) => value.replace(/\|/g, ', ') || '-';
const renderYesNo = ({ value }) => (value ? 'Sim' : !value ? 'Não' : '-');

export const buildCampersColumns = ({
  selectedRows,
  filteredRows,
  rowsRef,
  handleSelectAll,
  handleCheckboxChange,
  handleEditClick,
  handleDeleteClick,
  setFilteredRows,
  adminTableEditDeletePermissions,
}) => {
  const textFilter = filterWith(setFilteredRows, ColumnFilter);
  const selectFilter = (options) => filterWith(setFilteredRows, ColumnFilterWithSelect, { options });
  const twoValuesFilter = filterWith(setFilteredRows, ColumnFilterWithTwoValues, {
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'não', label: 'Não' },
    ],
  });

  const editDeleteCell = ({ row }) => (
    <div>
      <Button
        disabled={!adminTableEditDeletePermissions}
        variant="outline-success"
        onClick={() => handleEditClick(row.index)}
      >
        <Icons typeIcon="edit" iconSize={24} />
      </Button>{' '}
      <Button
        disabled={!adminTableEditDeletePermissions}
        variant="outline-danger"
        onClick={() => handleDeleteClick(row.index, row)}
      >
        <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
      </Button>
    </div>
  );

  return [
    {
      Header: () => (
        <div className="d-flex justify-content-between w-100">
          <span className="d-flex">
            <Form.Check
              className="table-checkbox"
              type="checkbox"
              onChange={handleSelectAll}
              checked={
                filteredRows.length > 0
                  ? selectedRows.length === filteredRows.length
                  : selectedRows.length === (rowsRef?.current?.length || 0)
              }
            />
            &nbsp;
            {selectedRows.length === 1
              ? `${selectedRows.length} selecionado`
              : selectedRows.length > 1
              ? `${selectedRows.length} selecionados`
              : 'Selecionar Todos'}
          </span>
        </div>
      ),
      accessor: 'selection',
      Filter: '',
      filter: '',
      sortType: 'alphanumeric',
      Cell: ({ row }) => (
        <div className="d-flex gap-5">
          <Form.Check
            className="table-checkbox"
            type="checkbox"
            onChange={() => handleCheckboxChange(row.index, row.original.personalInformation.name)}
            checked={selectedRows.some((selected) => selected.index === row.index)}
          />
          {editDeleteCell({ row })}
        </div>
      ),
    },
    {
      Header: 'Ordem:',
      accessor: (_, i) => i + 1,
      disableFilters: true,
      sortType: 'alphanumeric',
    },
    {
      Header: 'Pacote:',
      accessor: (row) =>
        `${
          row.package.accomodationName === 'Colégio Quarto Coletivo' ||
          row.package.accomodationName === 'Colegio Quarto Coletivo' ||
          row.package.accomodationName === 'Colégio Quarto Família' ||
          row.package.accomodationName === 'Colegio Quarto Familia' ||
          row.package.accomodationName === 'Colégio Camping' ||
          row.package.accomodationName === 'Colegio Camping'
            ? '[COLÉGIO]'
            : row.package.accomodationName === 'Seminário' || row.package.accomodationName === 'Seminario'
            ? '[SEMINÁRIO]'
            : row.package.accomodationName === 'Externo'
            ? '[EXTERNO]'
            : ''
        } ${
          row.package.transportationName === 'Com Ônibus' ||
          row.package.transportationName === 'Com Onibus' ||
          row.package.transportationName === 'Ônibus Equipe' ||
          row.package.transportationName === 'Onibus Equipe'
            ? 'COM ÔNIBUS'
            : row.package.transportationName === 'Sem Ônibus' || row.package.transportationName === 'Sem Onibus'
            ? 'SEM ÔNIBUS'
            : ''
        } ${
          row.package.foodName === 'Alimentação Completa (Café da manhã, Almoço e Jantar)' ||
          row.package.foodName === 'Alimentacao Completa (Cafe da manha, Almoco e Jantar)' ||
          row.package.foodName === 'Alimentação Completa (Café da manhã| Almoço e Jantar)' ||
          row.package.foodName === 'Alimentacao Completa (Cafe da manha| Almoco e Jantar)' ||
          row.package.foodName === 'Alimentacao Completa (Cafe da manha  Almoco e Jantar)' ||
          row.package.foodName === 'Alimentação Completa' ||
          row.package.foodName === 'Alimentacao Completa'
            ? 'COM ALIMENTAÇÃO COMPLETA'
            : row.package.foodName === 'Alimentação Parcial (Almoço e Jantar)' ||
              row.package.foodName === 'Alimentacao Parcial (Almoco e Jantar)'
            ? 'COM ALIMENTAÇÃO PARCIAL'
            : row.package.foodName === '' ||
              row.package.foodName === 'Sem Alimentação' ||
              row.package.foodName === 'Sem Alimentacao'
            ? 'SEM ALIMENTAÇÃO'
            : ''
        }`,
      Filter: textFilter,
      sortType: 'alphanumeric',
    },
    {
      Header: 'Nome:',
      accessor: 'personalInformation.name',
      Filter: textFilter,
      sortType: alphabeticalSort,
      Cell: renderOrDash,
    },
    {
      Header: 'Forma de Pagamento:',
      accessor: (row) => (row.totalPrice === '0' ? 'nonPaid' : row.formPayment?.formPayment || 'nonPaid'),
      Filter: selectFilter([
        { value: 'creditCard', label: 'Cartão de Crédito' },
        { value: 'pix', label: 'PIX' },
        { value: 'ticket', label: 'Boleto Bancário' },
        { value: 'nonPaid', label: 'Não Pagante' },
      ]),
      sortType: 'alphanumeric',
      Cell: ({ value }) => {
        switch (value) {
          case 'creditCard':
            return 'Cartão de Crédito';
          case 'pix':
            return 'PIX';
          case 'ticket':
            return 'Boleto Bancário';
          case 'boleto':
            return 'Boleto Bancário';
          default:
            return 'Não Pagante';
        }
      },
    },
    {
      Header: 'Hospedagem:',
      accessor: (row) =>
        row.package.accomodationName === 'Colégio Quarto Coletivo' ||
        row.package.accomodationName === 'Colegio Quarto Coletivo'
          ? 'Colégio Quarto Coletivo'
          : row.package.accomodationName === 'Colégio Quarto Família' ||
            row.package.accomodationName === 'Colegio Quarto Familia'
          ? 'Colégio Quarto Família'
          : row.package.accomodationName === 'Colégio Camping' || row.package.accomodationName === 'Colegio Camping'
          ? 'Colégio Camping'
          : row.package.accomodationName === 'Seminário' || row.package.accomodationName === 'Seminario'
          ? 'Seminário'
          : row.package.accomodationName === 'Externo'
          ? 'Externo'
          : '',
      Filter: selectFilter([
        { value: 'Colégio Quarto Coletivo', label: 'Colégio Quarto Coletivo' },
        { value: 'Colégio Quarto Família', label: 'Colégio Quarto Família' },
        { value: 'Colégio Camping', label: 'Colégio Camping' },
        { value: 'Seminário', label: 'Seminário São José' },
        { value: 'Externo', label: 'Outra Hospedagem Externa' },
      ]),
      sortType: 'alphanumeric',
    },
    {
      Header: 'Transporte:',
      accessor: (row) =>
        row.package.transportationName === 'Com Ônibus' || row.package.transportationName === 'Com Onibus'
          ? 'Com Ônibus'
          : row.package.transportationName === 'Sem Ônibus' || row.package.transportationName === 'Sem Onibus'
          ? 'Sem Ônibus'
          : row.package.transportationName === 'Ônibus Equipe' || row.package.transportationName === 'Onibus Equipe'
          ? 'Ônibus Equipe'
          : '',
      Filter: selectFilter([
        { value: 'Com Ônibus', label: 'Com Ônibus' },
        { value: 'Sem Ônibus', label: 'Sem Ônibus' },
        { value: 'Ônibus Equipe', label: 'Ônibus Equipe' },
      ]),
      sortType: 'alphanumeric',
      Cell: renderOrDash,
      filter: (tableRows, id, filterValue) =>
        tableRows.filter((row) => {
          const normalizedValue = row.values[id]?.toLowerCase().replace('onibus', 'ônibus');
          return normalizedValue === filterValue.toLowerCase();
        }),
    },
    {
      Header: 'Alimentação:',
      accessor: 'package.foodName',
      Filter: selectFilter([
        { value: 'Alimentacao Completa', label: 'Alimentação Completa' },
        { value: 'Sem Alimentacao', label: 'Sem Alimentação' },
      ]),
      sortType: 'alphanumeric',
      Cell: renderPipedList,
    },
    {
      Header: 'CPF:',
      accessor: 'personalInformation.cpf',
      Filter: textFilter,
      sortType: 'alphanumeric',
    },
    {
      Header: 'RG:',
      accessor: 'personalInformation.rg',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: 'Órgão Emissor:',
      accessor: (row) =>
        `${row.personalInformation.rgShipper} -
          ${row.personalInformation.rgShipperState}`,
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: 'Preço:',
      accessor: 'totalPrice',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: 'Desconto:',
      accessor: (row) => ({
        appliedDiscount: row.appliedDiscount,
        discountCoupon: row.package.discountCoupon,
      }),
      Filter: twoValuesFilter,
      filter: 'selectWithDiscount',
      sortType: 'alphanumeric',
      Cell: ({ value }) => {
        const hasDiscount = value.discountCoupon ? 'Sim' : !value.discountCoupon ? 'Não' : '-';
        const discountValueText =
          value.appliedDiscount !== '0' && value.appliedDiscount !== null ? value.appliedDiscount : '-';
        return `${hasDiscount} ${
          discountValueText !== '-' && discountValueText !== '' ? `| Valor: ${discountValueText}` : ''
        }`;
      },
    },
    {
      Header: 'Motivo do Desconto:',
      accessor: 'discountReason',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: 'Data de Nascimento:',
      accessor: 'personalInformation.birthday',
      id: 'birthday',
      Filter: textFilter,
      sortType: 'alphanumeric',
    },
    {
      Header: 'Idade:',
      accessor: 'personalInformation.birthday',
      id: 'age',
      Cell: ({ value }) => calculateAge(value),
      filter: ageFilterFn,
      Filter: textFilter,
      sortType: (rowA, rowB, columnId) => calculateAge(rowA.values[columnId]) - calculateAge(rowB.values[columnId]),
    },
    {
      Header: 'Categoria:',
      accessor: (row) =>
        row.personalInformation.gender
          ?.replace(/ç/g, 'c')
          .replace(/^Homem$/i, 'Homem')
          .replace(/^Mulher$/i, 'Mulher')
          .replace(/^Crianca$/i, 'Crianca') || '-',
      Filter: selectFilter([
        { value: 'Homem', label: 'Adulto Masculino' },
        { value: 'Mulher', label: 'Adulto Feminino' },
        { value: 'Crianca', label: 'Criança (até 10 anos)' },
      ]),
      sortType: 'alphanumeric',
      Cell: ({ value }) => value.replace(/c/g, 'ç') || '-',
    },
    {
      Header: 'Igreja:',
      accessor: 'contact.church',
      Filter: textFilter,
      sortType: alphabeticalSort,
      Cell: renderOrDash,
    },
    {
      Header: 'Celular:',
      accessor: (row) => ({
        cellPhone: row.contact.cellPhone,
        isWhatsApp: row.contact.isWhatsApp,
      }),
      Filter: twoValuesFilter,
      filter: 'selectWithCellphone',
      sortType: 'alphanumeric',
      Cell: ({ value }) => {
        const cellPhoneText = value.cellPhone ? value.cellPhone : '-';
        const isWhatsAppText = value.isWhatsApp ? 'Sim' : !value.isWhatsApp ? 'Não' : '-';
        return `${cellPhoneText} ${cellPhoneText !== '-' ? `| Wpp: ${isWhatsAppText}` : ''}`;
      },
    },
    {
      Header: 'Email:',
      accessor: 'contact.email',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: 'Tem Vaga de Carona:',
      accessor: (row) => ({
        car: row.contact.car,
        numberVacancies: row.contact.numberVacancies,
      }),
      Filter: twoValuesFilter,
      filter: 'selectWithRide',
      sortType: 'alphanumeric',
      Cell: ({ value }) => {
        const carText = value.car ? 'Sim' : !value.car ? 'Não' : '-';
        const numberVacanciesText = value.numberVacancies ? value.numberVacancies : '-';
        return `${carText} ${
          numberVacanciesText !== '-' && numberVacanciesText !== '' && numberVacanciesText !== '0'
            ? `| Vagas: ${numberVacanciesText}`
            : ''
        }`;
      },
    },
    {
      Header: 'Precisa de Carona:',
      accessor: 'contact.needRide',
      Filter: selectFilter([
        { value: true, label: 'Sim' },
        { value: false, label: 'Não' },
      ]),
      sortType: 'alphanumeric',
      Cell: renderYesNo,
    },
    {
      Header: 'Observação da Carona:',
      accessor: 'contact.rideObservation',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderPipedList,
    },
    {
      Header: 'Data de Inscrição:',
      accessor: 'registrationDate',
      Filter: textFilter,
      sortType: 'alphanumeric',
    },
    {
      Header: 'Lote:',
      accessor: 'package.lot',
      Filter: textFilter,
      sortType: alphabeticalSort,
      Cell: renderOrDash,
    },
    {
      Header: 'Alergia:',
      accessor: 'contact.allergy',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderPipedList,
    },
    {
      Header: 'Agregados:',
      accessor: 'contact.aggregate',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderPipedList,
    },
    {
      Header: 'Nome do Resp. Legal:',
      accessor: 'personalInformation.legalGuardianName',
      Filter: textFilter,
      sortType: alphabeticalSort,
      Cell: renderOrDash,
    },
    {
      Header: 'CPF do Resp. Legal:',
      accessor: 'personalInformation.legalGuardianCpf',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: 'Celular do Resp. Legal:',
      accessor: 'personalInformation.legalGuardianCellPhone',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: 'Observação Acampante:',
      accessor: 'finalObservation',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderPipedList,
    },
    {
      Header: 'Nome do Time:',
      accessor: 'teamName',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: 'Check-in:',
      accessor: (row) => ({
        checkin: row.checkin,
        checkinTime: row.checkinTime,
      }),
      Filter: twoValuesFilter,
      filter: 'selectWithCheckin',
      sortType: 'alphanumeric',
      Cell: ({ value }) => {
        const checkinText = value.checkin ? 'Sim' : 'Não';
        const checkinTimeText = value.checkinTime ? value.checkinTime : '-';

        const parts = checkinTimeText !== '-' ? checkinTimeText.split(' ') : null;
        const date = parts ? parts[0] : '-';
        const time = parts ? parts[1] : '-';

        return `${checkinText} ${checkinText !== 'Não' && checkinTimeText !== '-' ? `| Em ${date} às ${time}` : ''}`;
      },
    },
    {
      Header: 'Equipe:',
      accessor: 'crew',
      Filter: selectFilter(CREW_OPTIONS),
      sortType: 'alphanumeric',
      Cell: renderPipedList,
    },
    {
      Header: 'Família Pastoral:',
      accessor: 'pastoralFamily',
      Filter: twoValuesFilter,
      filter: 'selectWithPastoralFamily',
      sortType: 'alphanumeric',
      Cell: renderYesNo,
    },
    {
      Header: 'Inscrição Manual:',
      accessor: 'manualRegistration',
      Filter: twoValuesFilter,
      filter: 'selectWithManualRegistration',
      sortType: 'alphanumeric',
      Cell: renderYesNo,
    },
    {
      Header: 'Permissão Uso Dados:',
      accessor: 'authorization',
      Filter: twoValuesFilter,
      filter: 'selectWithConfirmationUserData',
      sortType: 'alphanumeric',
      Cell: renderYesNo,
    },
    {
      Header: 'Observação Adm:',
      accessor: 'observation',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderPipedList,
    },
    {
      Header: 'Chave do Pedido:',
      accessor: 'orderId',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: ({ value }) =>
        value ? (
          <a href={`${ORDER_URL_PREFIX}${value}`} className="order-url" target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        ) : (
          '-'
        ),
    },
    {
      Header: 'Editar / Deletar',
      Cell: editDeleteCell,
      disableFilters: true,
    },
  ];
};
