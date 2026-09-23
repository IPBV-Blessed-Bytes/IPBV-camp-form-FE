export const formatValue = (field, value) => {
  if (value == null || value === '') return '—';
  if (field.type === 'consent') return value ? 'Sim' : 'Não';
  if (field.type === 'checkbox') {
    const labels = (field.options || []).filter((o) => (value || []).includes(o.value)).map((o) => o.label);
    return labels.length ? labels.join(', ') : '—';
  }
  if (field.type === 'select' || field.type === 'radio') {
    return (field.options || []).find((o) => o.value === value)?.label || value;
  }
  return String(value);
};
