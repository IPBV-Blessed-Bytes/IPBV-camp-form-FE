/* eslint-disable react/prop-types */
import { Form } from 'react-bootstrap';

import { CREW_OPTIONS } from '@/utils/constants';
import calculateAge from '@/Pages/Packages/utils/calculateAge';
import ActionButton from '@/components/Global/ActionButton';
import ColumnFilter from '@/components/Admin/ParticipantsTable/ColumnFilter';
import ColumnFilterWithSelect from '@/components/Admin/ParticipantsTable/ColumnFilterWithSelect';
import ColumnFilterWithTwoValues from '@/components/Admin/ParticipantsTable/ColumnFilterWithTwoValues';

import { alphabeticalSort, ageFilterFn } from './tableFilters';

const ORDER_URL_PREFIX = 'https://dash.pagar.me/merch_Al154387U9uZDPV2/acc_5d3nayjiPBsdGnA0/orders/';

const filterWith = (FilterComponent, extraProps = {}) =>
  function ColumnFilterWrapper({ column }) {
    return <FilterComponent column={column} {...extraProps} />;
  };

export const makeDefaultFilter = () => filterWith(ColumnFilter);

const renderOrDash = ({ value }) => value || '-';
const renderPipedList = ({ value }) => (value ? value.replace(/\|/g, ', ') : '-');

export const buildCampersColumns = ({
  selectedRows,
  rowsRef,
  handleSelectAll,
  handleCheckboxChange,
  handleEditClick,
  handleDeleteClick,
  adminTableEditDeletePermissions,
  catalog,
  t,
}) => {
  const yes = t('admin.participantsTable.yes');
  const no = t('admin.participantsTable.no');
  const renderYesNo = ({ value }) => (value ? yes : !value ? no : '-');
  const textFilter = filterWith(ColumnFilter);
  const selectFilter = (options) => filterWith(ColumnFilterWithSelect, { options });
  const catalogOptions = (category, fallback) =>
    catalog?.options?.[category]?.length ? catalog.options[category] : fallback;
  const twoValuesFilter = filterWith(ColumnFilterWithTwoValues, {
    options: [
      { value: 'sim', label: yes },
      { value: 'não', label: no },
    ],
  });

  const editDeleteCell = ({ row }) => (
    <div className="table-action-cell">
      <ActionButton
        action="edit"
        label={t('admin.participantsTable.editRegistration')}
        disabled={!adminTableEditDeletePermissions}
        onClick={() => handleEditClick(row.index)}
      />
      <ActionButton
        action="delete"
        label={t('admin.participantsTable.deleteRegistration')}
        disabled={!adminTableEditDeletePermissions}
        onClick={() => handleDeleteClick(row.index, row)}
      />
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
                selectedRows.length > 0 && selectedRows.length === (rowsRef?.current?.length || 0)
              }
            />
            &nbsp;
            {selectedRows.length === 1
              ? t('admin.participantsTable.selectedSingular', { count: selectedRows.length })
              : selectedRows.length > 1
              ? t('admin.participantsTable.selectedPlural', { count: selectedRows.length })
              : t('admin.participantsTable.selectAll')}
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
      Header: t('admin.participantsTable.colOrder'),
      accessor: (_, i) => i + 1,
      disableFilters: true,
      sortType: 'alphanumeric',
    },
    {
      Header: t('admin.participantsTable.colPackage'),
      accessor: (row) =>
        `${
          row.package.accomodationName === 'Colégio Quarto Coletivo' ||
          row.package.accomodationName === 'Colegio Quarto Coletivo' ||
          row.package.accomodationName === 'Colégio Quarto Família' ||
          row.package.accomodationName === 'Colegio Quarto Familia' ||
          row.package.accomodationName === 'Colégio Camping' ||
          row.package.accomodationName === 'Colegio Camping'
            ? t('admin.participantsTable.pkgTagSchool')
            : row.package.accomodationName === 'Seminário' || row.package.accomodationName === 'Seminario'
            ? t('admin.participantsTable.pkgTagSeminary')
            : row.package.accomodationName === 'Externo'
            ? t('admin.participantsTable.pkgTagExternal')
            : ''
        } ${
          row.package.transportationName === 'Com Ônibus' ||
          row.package.transportationName === 'Com Onibus' ||
          row.package.transportationName === 'Ônibus Equipe' ||
          row.package.transportationName === 'Onibus Equipe'
            ? t('admin.participantsTable.pkgWithBus')
            : row.package.transportationName === 'Sem Ônibus' || row.package.transportationName === 'Sem Onibus'
            ? t('admin.participantsTable.pkgWithoutBus')
            : ''
        } ${
          row.package.foodName === 'Alimentação Completa (Café da manhã, Almoço e Jantar)' ||
          row.package.foodName === 'Alimentacao Completa (Cafe da manha, Almoco e Jantar)' ||
          row.package.foodName === 'Alimentação Completa (Café da manhã| Almoço e Jantar)' ||
          row.package.foodName === 'Alimentacao Completa (Cafe da manha| Almoco e Jantar)' ||
          row.package.foodName === 'Alimentacao Completa (Cafe da manha  Almoco e Jantar)' ||
          row.package.foodName === 'Alimentação Completa' ||
          row.package.foodName === 'Alimentacao Completa'
            ? t('admin.participantsTable.pkgFullMeals')
            : row.package.foodName === 'Alimentação Parcial (Almoço e Jantar)' ||
              row.package.foodName === 'Alimentacao Parcial (Almoco e Jantar)'
            ? t('admin.participantsTable.pkgPartialMeals')
            : row.package.foodName === '' ||
              row.package.foodName === 'Sem Alimentação' ||
              row.package.foodName === 'Sem Alimentacao'
            ? t('admin.participantsTable.pkgNoMeals')
            : ''
        }`,
      Filter: textFilter,
      sortType: 'alphanumeric',
    },
    {
      Header: t('admin.participantsTable.colName'),
      accessor: 'personalInformation.name',
      Filter: textFilter,
      sortType: alphabeticalSort,
      Cell: renderOrDash,
    },
    {
      Header: t('admin.participantsTable.colPaymentMethod'),
      accessor: (row) => (row.totalPrice === '0' ? 'nonPaid' : row.formPayment?.formPayment || 'nonPaid'),
      Filter: selectFilter([
        { value: 'creditCard', label: t('admin.participantsTable.payCreditCard') },
        { value: 'pix', label: t('admin.participantsTable.payPix') },
        { value: 'ticket', label: t('admin.participantsTable.payBoleto') },
        { value: 'nonPaid', label: t('admin.participantsTable.payNonPaying') },
      ]),
      sortType: 'alphanumeric',
      Cell: ({ value }) => {
        switch (value) {
          case 'creditCard':
            return t('admin.participantsTable.payCreditCard');
          case 'pix':
            return t('admin.participantsTable.payPix');
          case 'ticket':
            return t('admin.participantsTable.payBoleto');
          case 'boleto':
            return t('admin.participantsTable.payBoleto');
          default:
            return t('admin.participantsTable.payNonPaying');
        }
      },
    },
    {
      Header: t('admin.participantsTable.colAccommodation'),
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
          : row.package.accomodationName || '',
      Filter: selectFilter(
        catalogOptions('HOSPEDAGEM', [
          { value: 'Colégio Quarto Coletivo', label: 'Colégio Quarto Coletivo' },
          { value: 'Colégio Quarto Família', label: 'Colégio Quarto Família' },
          { value: 'Colégio Camping', label: 'Colégio Camping' },
          { value: 'Seminário', label: 'Seminário São José' },
          { value: 'Externo', label: 'Outra Hospedagem Externa' },
        ]),
      ),
      sortType: 'alphanumeric',
    },
    {
      Header: t('admin.participantsTable.colTransport'),
      accessor: (row) =>
        row.package.transportationName === 'Com Ônibus' || row.package.transportationName === 'Com Onibus'
          ? 'Com Ônibus'
          : row.package.transportationName === 'Sem Ônibus' || row.package.transportationName === 'Sem Onibus'
          ? 'Sem Ônibus'
          : row.package.transportationName === 'Ônibus Equipe' || row.package.transportationName === 'Onibus Equipe'
          ? 'Ônibus Equipe'
          : row.package.transportationName || '',
      Filter: selectFilter(
        catalogOptions('TRANSPORTE', [
          { value: 'Com Ônibus', label: 'Com Ônibus' },
          { value: 'Sem Ônibus', label: 'Sem Ônibus' },
          { value: 'Ônibus Equipe', label: 'Ônibus Equipe' },
        ]),
      ),
      sortType: 'alphanumeric',
      Cell: renderOrDash,
      filter: (tableRows, id, filterValue) =>
        tableRows.filter((row) => {
          const normalizedValue = row.values[id]?.toLowerCase().replace('onibus', 'ônibus');
          return normalizedValue === filterValue.toLowerCase();
        }),
    },
    {
      Header: t('admin.participantsTable.colFood'),
      accessor: 'package.foodName',
      Filter: selectFilter([
        { value: 'Alimentacao Completa', label: 'Alimentação Completa' },
        { value: 'Sem Alimentacao', label: 'Sem Alimentação' },
      ]),
      filter: 'food',
      sortType: 'alphanumeric',
      Cell: renderPipedList,
    },
    {
      Header: t('admin.participantsTable.colCpf'),
      accessor: 'personalInformation.cpf',
      Filter: textFilter,
      sortType: 'alphanumeric',
    },
    {
      Header: t('admin.participantsTable.colRg'),
      accessor: 'personalInformation.rg',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: t('admin.participantsTable.colRgShipper'),
      accessor: (row) =>
        `${row.personalInformation.rgShipper} -
          ${row.personalInformation.rgShipperState}`,
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: t('admin.participantsTable.colPrice'),
      accessor: 'totalPrice',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: t('admin.participantsTable.colDiscount'),
      accessor: (row) => ({
        appliedDiscount: row.appliedDiscount,
        discountCoupon: row.package.discountCoupon,
      }),
      Filter: twoValuesFilter,
      filter: 'selectWithDiscount',
      sortType: 'alphanumeric',
      Cell: ({ value }) => {
        const hasDiscount = value.discountCoupon ? yes : !value.discountCoupon ? no : '-';
        const discountValueText =
          value.appliedDiscount !== '0' && value.appliedDiscount !== null ? value.appliedDiscount : '-';
        return `${hasDiscount} ${
          discountValueText !== '-' && discountValueText !== ''
            ? `| ${t('admin.participantsTable.discountValueLabel')}: ${discountValueText}`
            : ''
        }`;
      },
    },
    {
      Header: t('admin.participantsTable.colDiscountReason'),
      accessor: 'discountReason',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: t('admin.participantsTable.colBirthday'),
      accessor: 'personalInformation.birthday',
      id: 'birthday',
      Filter: textFilter,
      sortType: 'alphanumeric',
    },
    {
      Header: t('admin.participantsTable.colAge'),
      accessor: 'personalInformation.birthday',
      id: 'age',
      Cell: ({ value }) => calculateAge(value),
      filter: ageFilterFn,
      Filter: textFilter,
      sortType: (rowA, rowB, columnId) => calculateAge(rowA.values[columnId]) - calculateAge(rowB.values[columnId]),
    },
    {
      Header: t('admin.participantsTable.colCategory'),
      accessor: (row) =>
        row.personalInformation.gender
          ?.replace(/ç/g, 'c')
          .replace(/^Homem$/i, 'Homem')
          .replace(/^Mulher$/i, 'Mulher')
          .replace(/^Crianca$/i, 'Crianca') || '-',
      Filter: selectFilter([
        { value: 'Homem', label: t('admin.participantsTable.categoryMale') },
        { value: 'Mulher', label: t('admin.participantsTable.categoryFemale') },
        { value: 'Crianca', label: t('admin.participantsTable.categoryChild') },
      ]),
      sortType: 'alphanumeric',
      Cell: ({ value }) => value.replace(/c/g, 'ç') || '-',
    },
    {
      Header: t('admin.participantsTable.colChurch'),
      accessor: 'contact.church',
      Filter: textFilter,
      sortType: alphabeticalSort,
      Cell: renderOrDash,
    },
    {
      Header: t('admin.participantsTable.colCellPhone'),
      accessor: (row) => ({
        cellPhone: row.contact.cellPhone,
        isWhatsApp: row.contact.isWhatsApp,
      }),
      Filter: twoValuesFilter,
      filter: 'selectWithCellphone',
      sortType: 'alphanumeric',
      Cell: ({ value }) => {
        const cellPhoneText = value.cellPhone ? value.cellPhone : '-';
        const isWhatsAppText = value.isWhatsApp ? yes : !value.isWhatsApp ? no : '-';
        return `${cellPhoneText} ${
          cellPhoneText !== '-' ? `| ${t('admin.participantsTable.whatsappShort')}: ${isWhatsAppText}` : ''
        }`;
      },
    },
    {
      Header: t('admin.participantsTable.colEmail'),
      accessor: 'contact.email',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: t('admin.participantsTable.colHasRide'),
      accessor: (row) => ({
        car: row.contact.car,
        numberVacancies: row.contact.numberVacancies,
      }),
      Filter: twoValuesFilter,
      filter: 'selectWithRide',
      sortType: 'alphanumeric',
      Cell: ({ value }) => {
        const carText = value.car ? yes : !value.car ? no : '-';
        const numberVacanciesText = value.numberVacancies ? value.numberVacancies : '-';
        return `${carText} ${
          numberVacanciesText !== '-' && numberVacanciesText !== '' && numberVacanciesText !== '0'
            ? `| ${t('admin.participantsTable.vacanciesLabel')}: ${numberVacanciesText}`
            : ''
        }`;
      },
    },
    {
      Header: t('admin.participantsTable.colNeedRide'),
      accessor: 'contact.needRide',
      Filter: selectFilter([
        { value: true, label: yes },
        { value: false, label: no },
      ]),
      sortType: 'alphanumeric',
      Cell: renderYesNo,
    },
    {
      Header: t('admin.participantsTable.colRideObservation'),
      accessor: 'contact.rideObservation',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderPipedList,
    },
    {
      Header: t('admin.participantsTable.colRegistrationDate'),
      accessor: 'registrationDate',
      Filter: textFilter,
      sortType: 'alphanumeric',
    },
    {
      Header: t('admin.participantsTable.colLot'),
      accessor: 'package.lot',
      Filter: textFilter,
      sortType: alphabeticalSort,
      Cell: renderOrDash,
    },
    {
      Header: t('admin.participantsTable.colAllergy'),
      accessor: 'contact.allergy',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderPipedList,
    },
    {
      Header: t('admin.participantsTable.colAggregate'),
      accessor: 'contact.aggregate',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderPipedList,
    },
    {
      Header: t('admin.participantsTable.colGuardianName'),
      accessor: 'personalInformation.legalGuardianName',
      Filter: textFilter,
      sortType: alphabeticalSort,
      Cell: renderOrDash,
    },
    {
      Header: t('admin.participantsTable.colGuardianCpf'),
      accessor: 'personalInformation.legalGuardianCpf',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: t('admin.participantsTable.colGuardianCellPhone'),
      accessor: 'personalInformation.legalGuardianCellPhone',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: t('admin.participantsTable.colFinalObservation'),
      accessor: 'finalObservation',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderPipedList,
    },
    {
      Header: t('admin.participantsTable.colTeamName'),
      accessor: 'teamName',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: t('admin.participantsTable.colCheckin'),
      accessor: (row) => ({
        checkin: row.checkin,
        checkinTime: row.checkinTime,
      }),
      Filter: twoValuesFilter,
      filter: 'selectWithCheckin',
      sortType: 'alphanumeric',
      Cell: ({ value }) => {
        const checkinText = value.checkin ? yes : no;
        const checkinTimeText = value.checkinTime ? value.checkinTime : '-';

        const parts = checkinTimeText !== '-' ? checkinTimeText.split(' ') : null;
        const date = parts ? parts[0] : '-';
        const time = parts ? parts[1] : '-';

        return `${checkinText} ${
          checkinText !== no && checkinTimeText !== '-'
            ? `| ${t('admin.participantsTable.checkinAt', { date, time })}`
            : ''
        }`;
      },
    },
    {
      Header: t('admin.participantsTable.colCrew'),
      accessor: 'crew',
      Filter: selectFilter(CREW_OPTIONS),
      sortType: 'alphanumeric',
      Cell: renderPipedList,
    },
    {
      Header: t('admin.participantsTable.colPastoralFamily'),
      accessor: 'pastoralFamily',
      Filter: twoValuesFilter,
      filter: 'selectWithPastoralFamily',
      sortType: 'alphanumeric',
      Cell: renderYesNo,
    },
    {
      Header: t('admin.participantsTable.colManualRegistration'),
      accessor: 'manualRegistration',
      Filter: twoValuesFilter,
      filter: 'selectWithManualRegistration',
      sortType: 'alphanumeric',
      Cell: renderYesNo,
    },
    {
      Header: t('admin.participantsTable.colDataConsent'),
      accessor: 'authorization',
      Filter: twoValuesFilter,
      filter: 'selectWithConfirmationUserData',
      sortType: 'alphanumeric',
      Cell: renderYesNo,
    },
    {
      Header: t('admin.participantsTable.colAdminObservation'),
      accessor: 'observation',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderPipedList,
    },
    {
      Header: t('admin.participantsTable.colOrderNumber'),
      accessor: 'orderNumber',
      Filter: textFilter,
      sortType: 'alphanumeric',
      Cell: renderOrDash,
    },
    {
      Header: t('admin.participantsTable.colOrderKey'),
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
      Header: t('admin.participantsTable.colEditDelete'),
      Cell: editDeleteCell,
      disableFilters: true,
    },
  ];
};
