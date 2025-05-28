import * as XLSX from 'xlsx';

const generateExcel = (data, filteredRowsRef) => {
  const fieldMapping = {
    'package.title': 'Pacote',
    'personalInformation.name': 'Nome',
    'formPayment.formPayment': 'Forma de Pagamento',
    'contact.church': 'Igreja',
    'personalInformation.birthday': 'Data de Nascimento',
    'personalInformation.cpf': 'CPF',
    'personalInformation.rg': 'RG',
    'personalInformation.rgShipper': 'Orgão Emissor',
    'personalInformation.rgShipperState': 'Estado Emissor',
    'contact.car': 'Tem Vaga de Carona',
    'contact.needRide': 'Precisa de Carona',
    'contact.numberVacancies': 'Vagas de Carona',
    'contact.rideObservation': 'Observação da Carona',
    registrationDate: 'Data de Inscrição',
    'personalInformation.gender': 'Categoria',
    'contact.cellPhone': 'Celular',
    'contact.isWhatsApp': 'WhatsApp',
    'contact.email': 'Email',
    totalPrice: 'Valor final',
    'contact.hasAllergy': 'Tem Alergia',
    'contact.allergy': 'Alergia',
    'contact.hasAggregate': 'Tem Agregados',
    'contact.aggregate': 'Agregados',
    'package.accomodationName': 'Acomodação',
    'package.accomodation.id': 'ID da Acomodação',
    'package.subAccomodation': 'Sub Acomodação',
    'package.transportation': 'Transporte',
    'package.food': 'Alimentação',
    'package.price': 'Valor do pacote',
    'extraMeals.someFood': 'Tem Refeição Extra',
    'extraMeals.extraMeals': 'Refeições Extra',
    'extraMeals.totalPrice': 'Valor Refeição Extra',
    observation: 'Observação',
    crew: 'Equipe',
    manualRegistration: 'Inscrição Manual',
    'package.discountCoupon': 'Cupom de Desconto',
    'package.discountValue': 'Valor do Desconto',
    orderId: 'Chave do Pedido',
    checkin: 'Checkin',
    checkinTime: 'Hora do Checkin',
  };

  const orderedFields = [
    'Pacote',
    'Nome',
    'Forma de Pagamento',
    'Igreja',
    'Data de Nascimento',
    'CPF',
    'RG',
    'Orgão Emissor',
    'Estado Emissor',
    'Tem Vaga de Carona',
    'Precisa de Carona',
    'Vagas de Carona',
    'Observação da Carona',
    'Data de Inscrição',
    'Categoria',
    'Celular',
    'WhatsApp',
    'Email',
    'Valor final',
    'Tem Alergia',
    'Alergia',
    'Tem Agregados',
    'Agregados',
    'Acomodação',
    'ID da Acomodação',
    'Sub Acomodação',
    'Transporte',
    'Alimentação',
    'Valor do pacote',
    'Tem Refeição Extra',
    'Refeições Extra',
    'Valor Refeição Extra',
    'Observação',
    'Equipe',
    'Inscrição Manual',
    'Cupom de Desconto',
    'Valor do Desconto',
    'Chave do Pedido',
    'Checkin',
    'Hora do Checkin',
  ];

  const flattenObject = (obj, parent = '', res = {}) => {
     for (let key in obj) {
      let propName = parent ? `${parent}.${key}` : key;

      if (Array.isArray(obj[key])) {
        res[fieldMapping[propName] || propName] = obj[key].join(' | ');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        flattenObject(obj[key], propName, res);
      } else {
        let value = obj[key];
        if (typeof value === 'boolean') {
          value = value ? 'Sim' : 'Não';
        }
        res[fieldMapping[propName] || propName] = value;
      }
    }
    return res;
  };

  const isFilterApplied = filteredRowsRef.current.length > 0;
  
  const dataToExport = (isFilterApplied ? filteredRowsRef.current.map((row) => row.original) : data).map((row) => {
    const newRow = { ...row };
    delete newRow.id;
    return flattenObject(newRow);
  });

  const orderedData = dataToExport.map((row) => {
    const orderedRow = {};
    orderedFields.forEach((field) => {
      orderedRow[field] = row[field] || '';
    });
    return orderedRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(orderedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inscrições');
  XLSX.writeFile(workbook, 'planilha_inscricoes.xlsx');
};

export default generateExcel;
