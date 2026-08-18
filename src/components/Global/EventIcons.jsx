import PropTypes from 'prop-types';

export const EVENT_ICONS = [
  { key: 'tent', label: 'Barraca / Acampamento' },
  { key: 'cross', label: 'Cruz' },
  { key: 'calendar', label: 'Calendário' },
];

const EventIcons = ({ className, iconSize, onClick, typeIcon, fill, stroke }) => {
  const size = iconSize ? iconSize + 'px' : '30px';
  const strokeColor = stroke || 'currentColor';
  const fillColor = fill || 'none';

  return (
    <>
      {typeIcon === 'tent' && (
        <svg
          className={'event-icons ' + (className || '')}
          height={size}
          width={size}
          onClick={onClick}
          viewBox="0 0 24 24"
          fill={fillColor}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4L3 20h18L12 4z"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 4v16" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 20l-4-6" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 20l4-6" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {typeIcon === 'cross' && (
        <svg
          className={'event-icons ' + (className || '')}
          height={size}
          width={size}
          onClick={onClick}
          viewBox="0 0 24 24"
          fill={fillColor}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6V2z"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {typeIcon === 'calendar' && (
        <svg
          className={'event-icons ' + (className || '')}
          height={size}
          width={size}
          onClick={onClick}
          viewBox="0 0 24 24"
          fill={fillColor}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="2"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M3 9h18" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 3v4" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 3v4" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </>
  );
};

EventIcons.propTypes = {
  className: PropTypes.string,
  iconSize: PropTypes.number,
  onClick: PropTypes.func,
  typeIcon: PropTypes.string,
  fill: PropTypes.string,
  stroke: PropTypes.string,
};

export default EventIcons;
