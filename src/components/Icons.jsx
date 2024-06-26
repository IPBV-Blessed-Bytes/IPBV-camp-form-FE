import PropTypes from 'prop-types';

const Icons = ({ className, iconSize, onClick, typeIcon, fill, stroke }) => {
  return (
    <>
      {typeIcon === 'visible-password' && (
        <svg
          className={'form-icons ' + className}
          height={iconSize ? iconSize + 'px' : '30px'}
          onClick={onClick}
          viewBox="0 0 24 24"
          fill={fill ? fill : 'none'}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12"
            stroke={stroke ? stroke : '#000000'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12"
            stroke={stroke ? stroke : '#000000'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke={stroke ? stroke : '#000000'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {typeIcon === 'hidden-password' && (
        <svg
          className={'form-icons ' + className}
          onClick={onClick}
          height={iconSize ? iconSize + 'px' : '30px'}
          viewBox="0 0 28 28"
          fill={fill ? fill : 'none'}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            d="M22.6928 1.55018C22.3102 1.32626 21.8209 1.45915 21.6 1.84698L19.1533 6.14375C17.4864 5.36351 15.7609 4.96457 14.0142 4.96457C9.32104 4.96457 4.781 7.84644 1.11993 13.2641L1.10541 13.2854L1.09271 13.3038C0.970762 13.4784 0.967649 13.6837 1.0921 13.8563C3.79364 17.8691 6.97705 20.4972 10.3484 21.6018L8.39935 25.0222C8.1784 25.4101 8.30951 25.906 8.69214 26.1299L9.03857 26.3326C9.4212 26.5565 9.91046 26.4237 10.1314 26.0358L23.332 2.86058C23.553 2.47275 23.4219 1.97684 23.0392 1.75291L22.6928 1.55018ZM18.092 8.00705C16.7353 7.40974 15.3654 7.1186 14.0142 7.1186C10.6042 7.1186 7.07416 8.97311 3.93908 12.9239C3.63812 13.3032 3.63812 13.8561 3.93908 14.2354C6.28912 17.197 8.86102 18.9811 11.438 19.689L12.7855 17.3232C11.2462 16.8322 9.97333 15.4627 9.97333 13.5818C9.97333 11.2026 11.7969 9.27368 14.046 9.27368C15.0842 9.27368 16.0317 9.68468 16.7511 10.3612L18.092 8.00705ZM15.639 12.3137C15.2926 11.7767 14.7231 11.4277 14.046 11.4277C12.9205 11.4277 12 12.3906 12 13.5802C12 14.3664 12.8432 15.2851 13.9024 15.3624L15.639 12.3137Z"
            fill="#000000"
            fillRule="evenodd"
          />
          <path
            d="M14.6873 22.1761C19.1311 21.9148 23.4056 19.0687 26.8864 13.931C26.9593 13.8234 27 13.7121 27 13.5797C27 13.4535 26.965 13.3481 26.8956 13.2455C25.5579 11.2677 24.1025 9.62885 22.5652 8.34557L21.506 10.2052C22.3887 10.9653 23.2531 11.87 24.0894 12.9239C24.3904 13.3032 24.3904 13.8561 24.0894 14.2354C21.5676 17.4135 18.7903 19.2357 16.0254 19.827L14.6873 22.1761Z"
            fill="#000000"
          />
        </svg>
      )}

      {typeIcon === 'close' && (
        <svg
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          onClick={onClick}
          height={iconSize ? iconSize + 'px' : '30px'}
          fill={fill ? fill : ''}
        >
          <g id="Reject">
            <path
              className="cls-1"
              d="M16,4A12,12,0,1,0,28,16,12.0134,12.0134,0,0,0,16,4Zm4.707,15.293a1,1,0,1,1-1.414,1.414L16,17.4141,12.707,20.707a1,1,0,0,1-1.414-1.414L14.5859,16,11.293,12.707a1,1,0,0,1,1.414-1.414L16,14.5859l3.293-3.2929a1,1,0,0,1,1.414,1.414L17.4141,16Z"
            />
          </g>
        </svg>
      )}

      {typeIcon === 'calendar' && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          className={className}
          onClick={onClick}
          height={iconSize ? iconSize + 'px' : '30px'}
          fill={fill ? fill : ''}
        >
          <path
            fillRule="evenodd"
            d="M0.58598495,16.6562557 L3.51566529,16.6562557 L3.51566529,18.4140639 C3.51566529,18.7376569 3.7780084,19 4.10160136,19 L19.4140639,19 C19.7376569,19 20,18.7376569 20,18.4140639 L20,3.17972617 C20,2.85613321 19.7376569,2.5937901 19.4140639,2.5937901 L16.4843836,2.5937901 L16.4843836,2.00785403 C16.4843836,1.68426107 16.2220405,1.42191796 15.8984475,1.42191796 C15.5748546,1.42191796 15.3125115,1.68426107 15.3125115,2.00785403 L15.3125115,2.5937901 L12.3437687,2.5937901 L12.3437687,2.00785403 C12.3437687,1.68426107 12.0814256,1.42191796 11.7578326,1.42191796 C11.4342397,1.42191796 11.1718966,1.68426107 11.1718966,2.00785403 L11.1718966,2.5937901 L8.24221624,2.5937901 L8.24221624,2.00785403 C8.24221624,1.68426107 7.97987313,1.42191796 7.65628017,1.42191796 C7.33268721,1.42191796 7.0703441,1.68426107 7.0703441,2.00785403 L7.0703441,2.5937901 L4.10160136,2.5937901 C3.7780084,2.5937901 3.51566529,2.85613321 3.51566529,3.17972617 L3.51566529,6.69534257 C3.51566529,11.0136914 1.72094311,14.3357926 0.210868679,15.6202036 C0.0213378922,15.7781329 -0.0489353736,16.0378197 0.0350097338,16.2698114 C0.119032966,16.5017639 0.339266803,16.6562557 0.58598495,16.6562557 Z M18.8281279,17.8281279 L4.68753743,17.8281279 L4.68753743,16.6562557 L15.8984475,16.6562557 C16.0355175,16.6562557 16.1682516,16.608209 16.2735638,16.5204357 C16.9779371,15.9337575 18.0689891,14.536964 18.8281279,12.747984 L18.8281279,17.8281279 Z M4.68753743,3.76566223 L7.0703441,3.76566223 L7.0703441,4.3515983 C7.0703441,4.67519126 7.33268721,4.93753437 7.65628017,4.93753437 C7.97987313,4.93753437 8.24221624,4.67519126 8.24221624,4.3515983 L8.24221624,3.76566223 L11.1718966,3.76566223 L11.1718966,4.3515983 C11.1718966,4.67519126 11.4342397,4.93753437 11.7578326,4.93753437 C12.0814256,4.93753437 12.3437687,4.67519126 12.3437687,4.3515983 L12.3437687,3.76566223 L15.3125115,3.76566223 L15.3125115,4.3515983 C15.3125115,4.67519126 15.5748546,4.93753437 15.8984475,4.93753437 C16.2220405,4.93753437 16.4843836,4.67519126 16.4843836,4.3515983 L16.4843836,3.76566223 L18.8281279,3.76566223 L18.8281279,6.10940651 L4.68753743,6.10940651 L4.68753743,3.76566223 Z M4.67749839,7.28088802 L18.8177373,7.28088802 C18.6857063,10.9978711 17.2591083,13.9223952 15.6686825,15.4843836 L1.91875513,15.4843836 C3.72082104,13.1882564 4.58081894,10.1985371 4.67749839,7.28088802 Z"
          />
        </svg>
      )}
      {typeIcon === 'arrow-down-double' && (
        <svg
          viewBox="0 0 330 330"
          className={className}
          onClick={onClick}
          height={iconSize ? iconSize + 'px' : '30px'}
          fill={fill ? fill : ''}
        >
          <path
            id="XMLID_197_"
            d="M304.394,139.394l-139.39,139.393L25.607,139.393c-5.857-5.857-15.355-5.858-21.213,0.001
		c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393s7.794-1.581,10.606-4.394l149.996-150
		c5.858-5.858,5.858-15.355,0-21.213C319.749,133.536,310.251,133.535,304.394,139.394z"
          />
          <path
            id="XMLID_221_"
            d="M154.398,190.607c2.813,2.813,6.628,4.393,10.606,4.393s7.794-1.581,10.606-4.394l149.996-150
		c5.858-5.858,5.858-15.355,0-21.213c-5.857-5.858-15.355-5.858-21.213,0l-139.39,139.393L25.607,19.393
		c-5.857-5.858-15.355-5.858-21.213,0c-5.858,5.858-5.858,15.355,0,21.213L154.398,190.607z"
          />
        </svg>
      )}
      {typeIcon === 'arrow-right' && (
        <svg
          viewBox="0 0 24 24"
          className={className}
          onClick={onClick}
          height={iconSize ? iconSize + 'px' : '30px'}
          fill={fill ? fill : ''}
        >
          <path d="m14.523 18.787s4.501-4.505 6.255-6.26c.146-.146.219-.338.219-.53s-.073-.383-.219-.53c-1.753-1.754-6.255-6.258-6.255-6.258-.144-.145-.334-.217-.524-.217-.193 0-.385.074-.532.221-.293.292-.295.766-.004 1.056l4.978 4.978h-14.692c-.414 0-.75.336-.75.75s.336.75.75.75h14.692l-4.979 4.979c-.289.289-.286.762.006 1.054.148.148.341.222.533.222.19 0 .378-.072.522-.215z" />
        </svg>
      )}
      {typeIcon === 'arrow-left' && (
        <svg
          viewBox="0 0 24 24"
          className={className}
          onClick={onClick}
          height={iconSize ? iconSize + 'px' : '30px'}
          fill={fill ? fill : ''}
        >
          <path d="m9.474 5.209s-4.501 4.505-6.254 6.259c-.147.146-.22.338-.22.53s.073.384.22.53c1.752 1.754 6.252 6.257 6.252 6.257.145.145.336.217.527.217.191-.001.383-.074.53-.221.293-.293.294-.766.004-1.057l-4.976-4.976h14.692c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-14.692l4.978-4.979c.289-.289.287-.761-.006-1.054-.147-.147-.339-.221-.53-.221-.191-.001-.38.071-.525.215z" />
        </svg>
      )}
      {typeIcon === 'selected' && (
        <svg
          viewBox="0 0 24 24"
          className={className}
          onClick={onClick}
          height={iconSize ? iconSize + 'px' : '30px'}
          fill={fill ? fill : ''}
        >
          <path d="M23.334 11.96c-.713-.726-.872-1.829-.393-2.727.342-.64.366-1.401.064-2.062-.301-.66-.893-1.142-1.601-1.302-.991-.225-1.722-1.067-1.803-2.081-.059-.723-.451-1.378-1.062-1.77-.609-.393-1.367-.478-2.05-.229-.956.347-2.026.032-2.642-.776-.44-.576-1.124-.915-1.85-.915-.725 0-1.409.339-1.849.915-.613.809-1.683 1.124-2.639.777-.682-.248-1.44-.163-2.05.229-.61.392-1.003 1.047-1.061 1.77-.082 1.014-.812 1.857-1.803 2.081-.708.16-1.3.642-1.601 1.302s-.277 1.422.065 2.061c.479.897.32 2.001-.392 2.727-.509.517-.747 1.242-.644 1.96s.536 1.347 1.17 1.7c.888.495 1.352 1.51 1.144 2.505-.147.71.044 1.448.519 1.996.476.549 1.18.844 1.902.798 1.016-.063 1.953.54 2.317 1.489.259.678.82 1.195 1.517 1.399.695.204 1.447.072 2.031-.357.819-.603 1.936-.603 2.754 0 .584.43 1.336.562 2.031.357.697-.204 1.258-.722 1.518-1.399.363-.949 1.301-1.553 2.316-1.489.724.046 1.427-.249 1.902-.798.475-.548.667-1.286.519-1.996-.207-.995.256-2.01 1.145-2.505.633-.354 1.065-.982 1.169-1.7s-.135-1.443-.643-1.96zm-12.584 5.43l-4.5-4.364 1.857-1.857 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.642z" />
        </svg>
      )}

      {typeIcon === 'error' && (
        <svg
          viewBox="0 0 493.636 493.636"
          className={className}
          onClick={onClick}
          height={iconSize ? iconSize + 'px' : '30px'}
          fill={fill ? fill : ''}
        >
          <g>
            <g>
              <path
                d="M421.428,72.476C374.868,25.84,312.86,0.104,246.724,0.044C110.792,0.044,0.112,110.624,0,246.548
            c-0.068,65.912,25.544,127.944,72.1,174.584c46.564,46.644,108.492,72.46,174.4,72.46h0.58v-0.048
            c134.956,0,246.428-110.608,246.556-246.532C493.7,181.12,468,119.124,421.428,72.476z M257.516,377.292
            c-2.852,2.856-6.844,4.5-10.904,4.5c-4.052,0-8.044-1.66-10.932-4.516c-2.856-2.864-4.496-6.852-4.492-10.916
            c0.004-4.072,1.876-8.044,4.732-10.884c2.884-2.86,7.218-4.511,11.047-4.542c3.992,0.038,7.811,1.689,10.677,4.562
            c2.872,2.848,4.46,6.816,4.456,10.884C262.096,370.46,260.404,374.432,257.516,377.292z M262.112,304.692
            c-0.008,8.508-6.928,15.404-15.448,15.404c-8.5-0.008-15.42-6.916-15.416-15.432L231.528,135
            c0.004-8.484,3.975-15.387,15.488-15.414c4.093,0.021,7.895,1.613,10.78,4.522c2.912,2.916,4.476,6.788,4.472,10.912
            L262.112,304.692z"
              />
            </g>
          </g>
        </svg>
      )}

      {typeIcon === 'filter' && (
        <svg
          className={className}
          onClick={onClick}
          height={iconSize ? iconSize + 'px' : '30px'}
          fill={fill ? fill : ''}
          viewBox="0 0 1792 1792"
        >
          <path d="M1595 295q17 41-14 70l-493 493v742q0 42-39 59-13 5-25 5-27 0-45-19l-256-256q-19-19-19-45v-486l-493-493q-31-29-14-70 17-39 59-39h1280q42 0 59 39z" />
        </svg>
      )}

      {typeIcon === 'edit' && (
        <svg
          className={className}
          onClick={onClick}
          height={iconSize ? iconSize + 'px' : '30px'}
          fill={fill ? fill : 'none'}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      )}

      {typeIcon === 'delete' && (
        <svg
          className={className}
          onClick={onClick}
          height={iconSize ? iconSize + 'px' : '30px'}
          fill={fill ? fill : ''}
          id="delete"
          x="0"
          y="0"
          viewBox="0 0 29 29"
          xmlSpace="preserve"
        >
          <path d="M19.795 27H9.205a2.99 2.99 0 0 1-2.985-2.702L4.505 7.099A.998.998 0 0 1 5.5 6h18a1 1 0 0 1 .995 1.099L22.78 24.297A2.991 2.991 0 0 1 19.795 27zM6.604 8 8.21 24.099a.998.998 0 0 0 .995.901h10.59a.998.998 0 0 0 .995-.901L22.396 8H6.604z"></path>
          <path d="M26 8H3a1 1 0 1 1 0-2h23a1 1 0 1 1 0 2zM14.5 23a1 1 0 0 1-1-1V11a1 1 0 1 1 2 0v11a1 1 0 0 1-1 1zM10.999 23a1 1 0 0 1-.995-.91l-1-11a1 1 0 0 1 .905-1.086 1.003 1.003 0 0 1 1.087.906l1 11a1 1 0 0 1-.997 1.09zM18.001 23a1 1 0 0 1-.997-1.09l1-11c.051-.55.531-.946 1.087-.906a1 1 0 0 1 .905 1.086l-1 11a1 1 0 0 1-.995.91z"></path>
          <path d="M19 8h-9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1zm-8-2h7V4h-7v2z"></path>
        </svg>
      )}

      {typeIcon === 'sort' && (
        <svg
          className={className}
          onClick={onClick}
          height={iconSize ? iconSize + 'px' : '30px'}
          fill={fill ? fill : ''}
          version="1.1"
          id="Capa_1"
          viewBox="0 0 490 490"
          xmlSpace="preserve"
        >
          <g>
            <polygon
              points="85.877,154.014 85.877,428.309 131.706,428.309 131.706,154.014 180.497,221.213 217.584,194.27 108.792,44.46 
           0,194.27 37.087,221.213 	"
            />
            <polygon
              points="404.13,335.988 404.13,61.691 358.301,61.691 358.301,335.99 309.503,268.787 272.416,295.73 381.216,445.54 
           490,295.715 452.913,268.802 	"
            />
          </g>
        </svg>
      )}

      {typeIcon === 'arrow-top' && (
        <svg
          className={className}
          onClick={onClick}
          height={iconSize ? iconSize + 'px' : '30px'}
          fill={fill ? fill : ''}
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            d="M12,23 C5.92486775,23 1,18.0751322 1,12 C1,5.92486775 5.92486775,1 12,1 C18.0751322,1 23,5.92486775 23,12 C23,18.0751322 18.0751322,23 12,23 Z M12,21 C16.9705627,21 21,16.9705627 21,12 C21,7.02943725 16.9705627,3 12,3 C7.02943725,3 3,7.02943725 3,12 C3,16.9705627 7.02943725,21 12,21 Z M13,10.4142136 L13,17 L11,17 L11,10.4142136 L8.70710678,12.7071068 L7.29289322,11.2928932 L12,6.58578644 L16.7071068,11.2928932 L15.2928932,12.7071068 L13,10.4142136 Z"
          />
        </svg>
      )}

      {typeIcon === 'add-person' && (
        <svg
          className={className}
          onClick={onClick}
          height={iconSize ? iconSize + 'px' : '30px'}
          fill={fill ? fill : ''}
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 328.5 328.5"
          xmlSpace="preserve"
        >
          <g>
            <g>
              <polygon
                points="96.333,150.918 96.333,135.918 55.667,135.918 55.667,95.251 40.667,95.251 40.667,135.918 0,135.918 0,150.918 
			40.667,150.918 40.667,191.583 55.667,191.583 55.667,150.918 		"
              />
              <path
                d="M259.383,185.941H145.858c-38.111,0-69.117,31.006-69.117,69.117v39.928H328.5v-39.928
			C328.5,216.948,297.494,185.941,259.383,185.941z M313.5,279.987H91.741v-24.928c0-29.84,24.276-54.117,54.117-54.117h113.524
			c29.84,0,54.117,24.277,54.117,54.117L313.5,279.987L313.5,279.987z"
              />
              <path
                d="M202.621,178.84c40.066,0,72.662-32.597,72.662-72.663s-32.596-72.663-72.662-72.663s-72.663,32.596-72.663,72.663
			S162.555,178.84,202.621,178.84z M202.621,48.515c31.795,0,57.662,25.867,57.662,57.663s-25.867,57.663-57.662,57.663
			c-31.796,0-57.663-25.868-57.663-57.663S170.825,48.515,202.621,48.515z"
              />
            </g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
          </g>
        </svg>
      )}

      {typeIcon === 'excel' && (
        <svg
          className={className}
          onClick={onClick}
          height={iconSize ? iconSize + 'px' : '30px'}
          fill={fill ? fill : ''}
          viewBox="0 0 50 50"
        >
          <path d="M 28.875 0 C 28.855469 0.0078125 28.832031 0.0195313 28.8125 0.03125 L 0.8125 5.34375 C 0.335938 5.433594 -0.0078125 5.855469 0 6.34375 L 0 43.65625 C -0.0078125 44.144531 0.335938 44.566406 0.8125 44.65625 L 28.8125 49.96875 C 29.101563 50.023438 29.402344 49.949219 29.632813 49.761719 C 29.859375 49.574219 29.996094 49.296875 30 49 L 30 44 L 47 44 C 48.09375 44 49 43.09375 49 42 L 49 8 C 49 6.90625 48.09375 6 47 6 L 30 6 L 30 1 C 30.003906 0.710938 29.878906 0.4375 29.664063 0.246094 C 29.449219 0.0546875 29.160156 -0.0351563 28.875 0 Z M 28 2.1875 L 28 6.53125 C 27.867188 6.808594 27.867188 7.128906 28 7.40625 L 28 42.8125 C 27.972656 42.945313 27.972656 43.085938 28 43.21875 L 28 47.8125 L 2 42.84375 L 2 7.15625 Z M 30 8 L 47 8 L 47 42 L 30 42 L 30 37 L 34 37 L 34 35 L 30 35 L 30 29 L 34 29 L 34 27 L 30 27 L 30 22 L 34 22 L 34 20 L 30 20 L 30 15 L 34 15 L 34 13 L 30 13 Z M 36 13 L 36 15 L 44 15 L 44 13 Z M 6.6875 15.6875 L 12.15625 25.03125 L 6.1875 34.375 L 11.1875 34.375 L 14.4375 28.34375 C 14.664063 27.761719 14.8125 27.316406 14.875 27.03125 L 14.90625 27.03125 C 15.035156 27.640625 15.160156 28.054688 15.28125 28.28125 L 18.53125 34.375 L 23.5 34.375 L 17.75 24.9375 L 23.34375 15.6875 L 18.65625 15.6875 L 15.6875 21.21875 C 15.402344 21.941406 15.199219 22.511719 15.09375 22.875 L 15.0625 22.875 C 14.898438 22.265625 14.710938 21.722656 14.5 21.28125 L 11.8125 15.6875 Z M 36 20 L 36 22 L 44 22 L 44 20 Z M 36 27 L 36 29 L 44 29 L 44 27 Z M 36 35 L 36 37 L 44 37 L 44 35 Z" />
        </svg>
      )}
    </>
  );
};

Icons.propTypes = {
  className: PropTypes.string,
  iconSize: PropTypes.number,
  onClick: PropTypes.func,
  typeIcon: PropTypes.string,
  fill: PropTypes.string,
  stroke: PropTypes.string,
};

export default Icons;
