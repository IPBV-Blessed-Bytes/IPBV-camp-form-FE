import * as XLSX from 'xlsx';

const MAX_SHEET_NAME_LENGTH = 31;

const sanitizeSheetName = (name, fallback = 'Sheet1') => String(name || fallback).substring(0, MAX_SHEET_NAME_LENGTH);

export const flattenForExcel = (obj, fieldMapping = {}, parent = '', res = {}) => {
  for (const key in obj) {
    const propName = parent ? `${parent}.${key}` : key;
    const value = obj[key];

    if (Array.isArray(value)) {
      res[fieldMapping[propName] || propName] = value.join(' | ');
    } else if (typeof value === 'object' && value !== null) {
      flattenForExcel(value, fieldMapping, propName, res);
    } else {
      res[fieldMapping[propName] || propName] = typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : value;
    }
  }
  return res;
};

export const downloadSingleSheet = ({ filename, sheetName, rows, headers }) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = headers ? XLSX.utils.json_to_sheet(rows, { header: headers }) : XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(sheetName));
  XLSX.writeFile(workbook, filename);
};

export const downloadMultiSheet = ({ filename, sheets }) => {
  const workbook = XLSX.utils.book_new();
  sheets.forEach(({ name, rows, aoa = false }, index) => {
    const worksheet = aoa ? XLSX.utils.aoa_to_sheet(rows) : XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(name, `Sheet${index + 1}`));
  });
  XLSX.writeFile(workbook, filename);
};
