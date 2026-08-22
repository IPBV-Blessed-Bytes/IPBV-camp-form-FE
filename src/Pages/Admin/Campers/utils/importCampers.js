import * as XLSX from 'xlsx';

// Friendly spreadsheet header (same as the export) -> flat field expected by POST /camper/bulk-import.
// Headers not listed here are ignored on import (e.g. computed/derived columns).
export const IMPORT_HEADER_TO_FIELD = {
  Nome: 'name',
  CPF: 'cpf',
  'Data de Nascimento': 'birthday',
  Categoria: 'gender',
  RG: 'rg',
  'Orgão Emissor': 'rgShipper',
  'Estado Emissor': 'rgShipperState',
  Celular: 'cellPhone',
  Email: 'email',
  WhatsApp: 'isWhatsApp',
  Igreja: 'church',
  'Tem Vaga de Carona': 'car',
  'Precisa de Carona': 'needRide',
  'Vagas de Carona': 'numberVacancies',
  'Observação da Carona': 'rideObservation',
  'Tem Alergia': 'hasAllergy',
  Alergia: 'allergy',
  'Tem Agregados': 'hasAggregate',
  Agregados: 'aggregate',
  'Nome do Responsável Legal': 'legalGuardianName',
  'CPF do Responsável Legal': 'legalGuardianCpf',
  'Celular do Responsável Legal': 'legalGuardianCellPhone',
  Hospedagem: 'accomodationName',
  Transporte: 'transportationName',
  Alimentação: 'foodName',
  'Valor do pacote': 'price',
  'Valor final': 'totalPrice',
  'Forma de Pagamento': 'formPayment',
  'Nome do Time': 'teamName',
  Equipe: 'crew',
  'Família Pastoral': 'pastoralFamily',
  'Observação Acampante': 'finalObservation',
  'Observação Adm': 'observation',
  Checkin: 'checkin',
};

// Column order for the downloadable template (mirrors the export layout).
export const TEMPLATE_HEADERS = [
  'Nome',
  'CPF',
  'Data de Nascimento',
  'Categoria',
  'Hospedagem',
  'Transporte',
  'Alimentação',
  'Valor do pacote',
  'Valor final',
  'Forma de Pagamento',
  'RG',
  'Orgão Emissor',
  'Estado Emissor',
  'Celular',
  'Email',
  'WhatsApp',
  'Igreja',
  'Tem Vaga de Carona',
  'Precisa de Carona',
  'Vagas de Carona',
  'Observação da Carona',
  'Tem Alergia',
  'Alergia',
  'Tem Agregados',
  'Agregados',
  'Nome do Responsável Legal',
  'CPF do Responsável Legal',
  'Celular do Responsável Legal',
  'Nome do Time',
  'Equipe',
  'Família Pastoral',
  'Observação Acampante',
  'Observação Adm',
  'Checkin',
];

const EXAMPLE_ROW = {
  Nome: 'João da Silva',
  CPF: '123.456.789-00',
  'Data de Nascimento': '15/04/1998',
  Categoria: 'Masculino',
  Hospedagem: 'Colégio Quarto Coletivo',
  Transporte: 'Com Ônibus',
  Alimentação: 'Alimentação Completa',
  'Valor do pacote': '250',
  'Valor final': '250',
  'Forma de Pagamento': 'pix',
  Celular: '(81) 99999-9999',
  Email: 'joao@exemplo.com',
  WhatsApp: 'Sim',
  Igreja: 'IP de Boa Viagem',
  'Precisa de Carona': 'Não',
  'Tem Alergia': 'Não',
  'Tem Agregados': 'Não',
  'Família Pastoral': 'Não',
  Checkin: 'Não',
};

export const REQUIRED_FIELDS = [
  { field: 'name', header: 'Nome' },
  { field: 'cpf', header: 'CPF' },
  { field: 'birthday', header: 'Data de Nascimento' },
];

export const downloadCampersTemplate = () => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet([EXAMPLE_ROW], { header: TEMPLATE_HEADERS });
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo');
  XLSX.writeFile(workbook, 'modelo-inscricoes.xlsx');
};

const isFilledDate = (value) => /^\d{2}\/\d{2}\/\d{4}$/.test(String(value).trim());

// Reads an .xlsx/.csv file and maps each row to the flat payload the BE expects.
// Returns { rows, errors } where errors flag rows missing required fields.
export const parseCampersFile = async (file) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const rows = [];
  const errors = [];

  rawRows.forEach((raw, index) => {
    const isEmpty = Object.values(raw).every((v) => String(v).trim() === '');
    if (isEmpty) return;

    const mapped = {};
    Object.entries(raw).forEach(([header, value]) => {
      const field = IMPORT_HEADER_TO_FIELD[String(header).trim()];
      if (field) mapped[field] = typeof value === 'string' ? value.trim() : String(value);
    });

    const rowNumber = index + 2; // +1 header, +1 to 1-index
    const missing = REQUIRED_FIELDS.filter(({ field }) => !String(mapped[field] || '').trim()).map((r) => r.header);
    if (missing.length) {
      errors.push({ row: rowNumber, name: mapped.name || '(sem nome)', message: `Faltando: ${missing.join(', ')}` });
      return;
    }
    if (!isFilledDate(mapped.birthday)) {
      errors.push({ row: rowNumber, name: mapped.name, message: `Data de nascimento inválida (use dd/mm/aaaa): "${mapped.birthday}"` });
      return;
    }

    rows.push(mapped);
  });

  return { rows, errors };
};
