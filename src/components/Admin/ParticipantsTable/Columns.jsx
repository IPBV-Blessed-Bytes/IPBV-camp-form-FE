import PropTypes from 'prop-types';
import { Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import 'bootstrap/dist/css/bootstrap.min.css';
import ColumnsFields from './ColumnsFields';
import { issuingState, rgShipper, food, CREW_OPTIONS } from '@/utils/constants';

const removeAccents = (str) => str.normalize('NFD').replace(/[̀-ͯ]/g, '');

const normalizedFoodOptions = food.map((item) => ({
  value: removeAccents(item.value),
  label: item.label,
}));

const getNestedValue = (data, path) => path.split('.').reduce((obj, key) => obj?.[key], data);

const CATEGORY_BY_FIELD = {
  'package.accomodationName': 'HOSPEDAGEM',
  'package.transportationName': 'TRANSPORTE',
  'package.foodName': 'ALIMENTACAO',
};

const TEAM_BUS_OPTION = { label: 'Ônibus Equipe', value: 'Onibus Equipe' };

const getFields = (t) => [
  {
    label: t('admin.participantsTable.fieldName'),
    name: 'personalInformation.name',
    type: 'text',
    placeholder: t('admin.participantsTable.phName'),
    oddOrEven: 'even',
  },
  {
    label: t('admin.participantsTable.fieldPaymentMethod'),
    name: 'formPayment.formPayment',
    type: 'select',
    placeholder: t('admin.participantsTable.phSelectPayment'),
    oddOrEven: 'odd',
    required: true,
    errorMessage: t('admin.participantsTable.errPayment'),
    options: [
      { label: t('admin.participantsTable.payCreditCard'), value: 'creditCard' },
      { label: t('admin.participantsTable.payPix'), value: 'pix' },
      { label: t('admin.participantsTable.payBoleto'), value: 'ticket' },
      { label: t('admin.participantsTable.payNonPaying'), value: 'nonPaid' },
    ],
  },
  {
    label: t('admin.participantsTable.fieldAccommodation'),
    name: 'package.accomodationName',
    type: 'select',
    placeholder: t('admin.participantsTable.phSelectAccommodation'),
    oddOrEven: 'even',
    options: [
      { label: 'Colégio Quarto Coletivo', value: 'Colegio Quarto Coletivo' },
      { label: 'Colégio Quarto Família', value: 'Colegio Quarto Familia' },
      { label: 'Colégio Camping', value: 'Colegio Camping' },
      { label: 'Seminário São José', value: 'Seminario' },
      { label: 'Outra Hospedagem Externa', value: 'Externo' },
    ],
  },
  {
    label: t('admin.participantsTable.fieldTransport'),
    name: 'package.transportationName',
    type: 'select',
    placeholder: t('admin.participantsTable.phSelectTransport'),
    oddOrEven: 'odd',
    options: [
      { label: 'Com Ônibus', value: 'Com Onibus' },
      { label: 'Sem Ônibus', value: 'Sem Onibus' },
      { label: 'Ônibus Equipe', value: 'Onibus Equipe' },
    ],
  },
  {
    label: t('admin.participantsTable.fieldFood'),
    name: 'package.foodName',
    type: 'select',
    placeholder: t('admin.participantsTable.phSelectFood'),
    oddOrEven: 'even',
    options: normalizedFoodOptions,
  },
  {
    label: t('admin.participantsTable.fieldCpf'),
    name: 'personalInformation.cpf',
    type: 'text',
    mask: 'cpf',
    placeholder: '000.000.000-00',
    oddOrEven: 'even',
    required: true,
    errorMessage: t('admin.participantsTable.errCpf'),
  },
  { label: t('admin.participantsTable.fieldRg'), name: 'personalInformation.rg', type: 'number', placeholder: '0123456', oddOrEven: 'odd' },
  {
    label: t('admin.participantsTable.fieldRgShipper'),
    name: 'personalInformation.rgShipper',
    type: 'select',
    placeholder: t('admin.participantsTable.phSelectRgShipper'),
    oddOrEven: 'even',
    options: rgShipper,
  },
  {
    label: t('admin.participantsTable.fieldRgShipperState'),
    name: 'personalInformation.rgShipperState',
    type: 'select',
    placeholder: t('admin.participantsTable.phSelectState'),
    oddOrEven: 'odd',
    options: issuingState,
  },
  { label: t('admin.participantsTable.fieldPrice'), name: 'totalPrice', type: 'number', placeholder: '500', oddOrEven: 'odd' },
  {
    label: t('admin.participantsTable.fieldBirthday'),
    name: 'personalInformation.birthday',
    type: 'date',
    placeholder: t('admin.participantsTable.phDate'),
    oddOrEven: 'odd',
    required: true,
    errorMessage: t('admin.participantsTable.errBirthday'),
  },
  {
    label: t('admin.participantsTable.fieldCategory'),
    name: 'personalInformation.gender',
    type: 'select',
    placeholder: t('admin.participantsTable.phSelectCategory'),
    oddOrEven: 'odd',
    options: [
      { label: t('admin.participantsTable.genderChild'), value: 'Crianca' },
      { label: t('admin.participantsTable.genderMale'), value: 'Homem' },
      { label: t('admin.participantsTable.genderFemale'), value: 'Mulher' },
    ],
  },
  {
    label: t('admin.participantsTable.fieldChurch'),
    name: 'contact.church',
    type: 'text',
    placeholder: t('admin.participantsTable.phChurchName'),
    oddOrEven: 'even',
  },
  {
    label: t('admin.participantsTable.fieldCellPhone'),
    name: 'contact.cellPhone',
    type: 'text',
    mask: 'phone',
    placeholder: '(00) 00000-0000',
    oddOrEven: 'even',
  },
  {
    label: t('admin.participantsTable.fieldWhatsapp'),
    name: 'contact.isWhatsApp',
    type: 'select',
    placeholder: t('admin.participantsTable.phSelectWhatsapp'),
    oddOrEven: 'odd',
    options: [
      { label: t('admin.participantsTable.yes'), value: true },
      { label: t('admin.participantsTable.no'), value: false },
    ],
  },
  { label: t('admin.participantsTable.fieldEmail'), name: 'contact.email', type: 'text', placeholder: t('admin.participantsTable.phEmail'), oddOrEven: 'even' },
  {
    label: t('admin.participantsTable.fieldHasRide'),
    name: 'contact.car',
    type: 'select',
    placeholder: t('admin.participantsTable.phSelectCar'),
    oddOrEven: 'even',
    options: [
      { label: t('admin.participantsTable.yes'), value: true },
      { label: t('admin.participantsTable.no'), value: false },
    ],
  },
  { label: t('admin.participantsTable.fieldVacancies'), name: 'contact.numberVacancies', type: 'number', placeholder: '0', oddOrEven: 'odd' },
  {
    label: t('admin.participantsTable.fieldNeedRide'),
    name: 'contact.needRide',
    type: 'select',
    placeholder: t('admin.participantsTable.phSelectNeedRide'),
    oddOrEven: 'even',
    options: [
      { label: t('admin.participantsTable.yes'), value: true },
      { label: t('admin.participantsTable.no'), value: false },
    ],
  },
  {
    label: t('admin.participantsTable.fieldRideObservation'),
    name: 'contact.rideObservation',
    type: 'text',
    placeholder: t('admin.participantsTable.phRideObservation'),
    oddOrEven: 'odd',
  },
  {
    label: t('admin.participantsTable.fieldRegistrationDate'),
    name: 'registrationDate',
    type: 'text',
    disabled: true,
    oddOrEven: 'even',
  },
  { label: t('admin.participantsTable.fieldAllergy'), name: 'contact.allergy', type: 'text', placeholder: t('admin.participantsTable.phAllergy'), oddOrEven: 'even' },
  { label: t('admin.participantsTable.fieldAggregate'), name: 'contact.aggregate', type: 'text', placeholder: t('admin.participantsTable.phAggregate'), oddOrEven: 'odd' },
  {
    label: t('admin.participantsTable.fieldGuardianName'),
    name: 'personalInformation.legalGuardianName',
    type: 'text',
    placeholder: t('admin.participantsTable.phGuardianName'),
    oddOrEven: 'odd',
  },
  {
    label: t('admin.participantsTable.fieldGuardianCpf'),
    name: 'personalInformation.legalGuardianCpf',
    type: 'text',
    mask: 'cpf',
    placeholder: '000.000.000-00',
    oddOrEven: 'even',
    errorMessage: t('admin.participantsTable.errCpf'),
  },
  {
    label: t('admin.participantsTable.fieldGuardianCellPhone'),
    name: 'personalInformation.legalGuardianCellPhone',
    type: 'text',
    mask: 'phone',
    placeholder: '(00) 00000-0000',
    oddOrEven: 'odd',
  },
  {
    label: t('admin.participantsTable.fieldCrew'),
    name: 'crew',
    type: 'select',
    placeholder: t('admin.participantsTable.phSelectCrew'),
    oddOrEven: 'odd',
    options: CREW_OPTIONS,
  },
  {
    label: t('admin.participantsTable.fieldPastoralFamily'),
    name: 'pastoralFamily',
    type: 'select',
    placeholder: t('admin.participantsTable.phSelectPastoralFamily'),
    oddOrEven: 'even',
    options: [
      { label: t('admin.participantsTable.yes'), value: true },
      { label: t('admin.participantsTable.no'), value: false },
    ],
  },
  {
    label: t('admin.participantsTable.fieldAdminObservation'),
    name: 'observation',
    type: 'text',
    placeholder: t('admin.participantsTable.phAdminObservation'),
    oddOrEven: 'even',
  },
];

const Columns = ({ addFormData, editFormData, handleFormChange, addForm, editForm, formSubmitted, currentDate, catalog }) => {
  const { t } = useTranslation();
  const FIELDS = getFields(t);
  const source = editForm ? editFormData : addFormData;

  return (
    <Row>
      {FIELDS.map((field, index) => {
        const isRegistrationDate = field.name === 'registrationDate';
        const isNestedField = field.name.includes('.');

        const value = isRegistrationDate
          ? editForm
            ? editFormData?.registrationDate
            : currentDate
          : isNestedField
          ? getNestedValue(source, field.name)
          : source?.[field.name];

        const category = CATEGORY_BY_FIELD[field.name];
        const catalogOptions = category ? catalog?.options?.[category] : null;
        let options = catalogOptions && catalogOptions.length > 0 ? catalogOptions : field.options || [];

        if (
          field.name === 'package.transportationName' &&
          !options.some((option) => option.value === TEAM_BUS_OPTION.value)
        ) {
          options = [...options, TEAM_BUS_OPTION];
        }

        return (
          <ColumnsFields
            key={index}
            label={field.label}
            type={field.type || 'text'}
            mask={field.mask}
            name={field.name}
            value={value}
            onChange={handleFormChange}
            placeholder={addForm ? field.placeholder : ''}
            addForm={addForm}
            disabled={field.disabled || false}
            options={options}
            required={field.required}
            errorMessage={field.errorMessage}
            oddOrEven={field.oddOrEven}
            formSubmitted={formSubmitted}
          />
        );
      })}
    </Row>
  );
};

Columns.propTypes = {
  addFormData: PropTypes.object,
  editFormData: PropTypes.object,
  handleFormChange: PropTypes.func,
  formSubmitted: PropTypes.bool,
  currentDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  addForm: PropTypes.bool,
  editForm: PropTypes.bool,
  catalog: PropTypes.object,
};

export default Columns;
