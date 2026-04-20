import { downloadSingleSheet, flattenForExcel } from '@/utils/excelExport';

const FIELD_MAPPING = {
  'personalInformation.name': 'Nome',
  'formPayment.formPayment': 'Forma de Pagamento',
  'package.accomodationName': 'Hospedagem',
  'package.transportationName': 'Transporte',
  'package.foodName': 'Alimentação',
  'personalInformation.cpf': 'CPF',
  'personalInformation.rg': 'RG',
  'personalInformation.rgShipper': 'Orgão Emissor',
  'personalInformation.rgShipperState': 'Estado Emissor',
  'package.price': 'Valor do pacote',
  appliedDiscount: 'Valor do Desconto',
  discountReason: 'Motivo do Desconto',
  totalPrice: 'Valor final',
  'personalInformation.birthday': 'Data de Nascimento',
  'personalInformation.gender': 'Categoria',
  'contact.church': 'Igreja',
  'contact.cellPhone': 'Celular',
  'contact.isWhatsApp': 'WhatsApp',
  'contact.email': 'Email',
  'contact.car': 'Tem Vaga de Carona',
  'contact.needRide': 'Precisa de Carona',
  'contact.numberVacancies': 'Vagas de Carona',
  'contact.rideObservation': 'Observação da Carona',
  registrationDate: 'Data de Inscrição',
  'package.lot': 'Lote',
  'contact.hasAllergy': 'Tem Alergia',
  'contact.allergy': 'Alergia',
  'contact.hasAggregate': 'Tem Agregados',
  'contact.aggregate': 'Agregados',
  'personalInformation.legalGuardianName': 'Nome do Responsável Legal',
  'personalInformation.legalGuardianCpf': 'CPF do Responsável Legal',
  'personalInformation.legalGuardianCellPhone': 'Celular do Responsável Legal',
  finalObservation: 'Observação Acampante',
  teamName: 'Nome do Time',
  checkin: 'Checkin',
  checkinTime: 'Hora do Checkin',
  crew: 'Equipe',
  pastoralFamily: 'Família Pastoral',
  manualRegistration: 'Inscrição Manual',
  observation: 'Observação Adm',
  orderId: 'Chave do Pedido',
};

const ORDERED_FIELDS = [
  'Nome',
  'Forma de Pagamento',
  'Hospedagem',
  'Transporte',
  'Alimentação',
  'CPF',
  'RG',
  'Orgão Emissor',
  'Estado Emissor',
  'Valor do pacote',
  'Valor do Desconto',
  'Motivo do Desconto',
  'Valor final',
  'Data de Nascimento',
  'Categoria',
  'Igreja',
  'Celular',
  'WhatsApp',
  'Email',
  'Tem Vaga de Carona',
  'Precisa de Carona',
  'Vagas de Carona',
  'Observação da Carona',
  'Data de Inscrição',
  'Lote',
  'Tem Alergia',
  'Alergia',
  'Tem Agregados',
  'Agregados',
  'Nome do Responsável Legal',
  'CPF do Responsável Legal',
  'Celular do Responsável Legal',
  'Observação Acampante',
  'Nome do Time',
  'Checkin',
  'Hora do Checkin',
  'Equipe',
  'Família Pastoral',
  'Inscrição Manual',
  'Observação Adm',
  'Chave do Pedido',
];

const NUMERIC_FIELDS = ['Valor do pacote', 'Valor do Desconto', 'Valor final'];

const parseNumeric = (value) => {
  const num = Number(String(value).replace('R$', '').replace('.', '').replace(',', '.').trim());
  return isNaN(num) ? '' : num;
};

export const exportCampersToExcel = ({ data, filteredRows }) => {
  const isFilterApplied = filteredRows.length > 0;

  const dataToExport = (isFilterApplied ? filteredRows.map((row) => row.original) : data).map((row) => {
    const rest = { ...row };
    delete rest.id;
    return flattenForExcel(rest, FIELD_MAPPING);
  });

  const rows = dataToExport.map((row) => {
    const orderedRow = {};
    ORDERED_FIELDS.forEach((field) => {
      const raw = row[field] || '';
      orderedRow[field] = NUMERIC_FIELDS.includes(field) ? parseNumeric(raw) : raw;
    });
    return orderedRow;
  });

  downloadSingleSheet({ filename: 'inscricoes.xlsx', sheetName: 'Inscrições', rows });
};
