const pad = (value) => String(value).padStart(2, '0');

const parseDateTime = (dateStr, timeStr) => {
  if (!dateStr) return null;
  const [day, month, year] = String(dateStr).split('/').map(Number);
  if (!day || !month || !year) return null;
  const [hours, minutes] = String(timeStr || '').split(':').map(Number);
  const date = new Date(year, month - 1, day, hours || 0, minutes || 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
};

const fmtDate = (date) => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;

const fmtDateTime = (date) => `${fmtDate(date)}T${pad(date.getHours())}${pad(date.getMinutes())}00`;

export const buildEventCalendarUrl = ({
  title,
  baseDate,
  startTime,
  endDate,
  endTime,
  location,
  details,
  timezone = 'America/Sao_Paulo',
}) => {
  const start = parseDateTime(baseDate, startTime);
  if (!start) return null;

  const params = new URLSearchParams({ action: 'TEMPLATE', text: title || 'Evento' });

  if (startTime) {
    let end = parseDateTime(endDate || baseDate, endTime || startTime);
    if (!end || end <= start) {
      end = new Date(start);
      end.setHours(end.getHours() + 2);
    }
    params.set('dates', `${fmtDateTime(start)}/${fmtDateTime(end)}`);
    params.set('ctz', timezone);
  } else {
    const lastDay = parseDateTime(endDate, null) || start;
    const allDayEnd = new Date(lastDay);
    allDayEnd.setDate(allDayEnd.getDate() + 1);
    params.set('dates', `${fmtDate(start)}/${fmtDate(allDayEnd)}`);
  }

  if (details) params.set('details', details);
  if (location) params.set('location', location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
