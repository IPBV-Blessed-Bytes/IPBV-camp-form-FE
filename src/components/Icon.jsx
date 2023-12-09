import PropTypes from "prop-types";

const Icon = ({ className, size, onClick, typeIcon, fill }) => {
  return (
    <>
      {typeIcon === "visible-password" && (
        <svg
          className={className}
          height={size ? size + "px" : "30px"}
          onClick={onClick}
          viewBox="0 0 24 24"
          fill={fill ? fill : "none"}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {typeIcon === "hidden-password" && (
        <svg
          className={className}
          onClick={onClick}
          height={size ? size + "px" : "30px"}
          viewBox="0 0 28 28"
          fill={fill ? fill : "none"}
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

      {typeIcon === "list-dashes" && (
        <svg
          className={className}
          onClick={onClick}
          height={size ? size + "px" : "30px"}
          viewBox="0 0 256 256"
          fill={fill ? fill : "none"}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M90,64a6.00029,6.00029,0,0,1,6-6H216a6,6,0,0,1,0,12H96A6.00029,6.00029,0,0,1,90,64Zm126,58H96.00586a6,6,0,1,0,0,12H216a6,6,0,0,0,0-12Zm0,64H96.00586a6,6,0,1,0,0,12H216a6,6,0,0,0,0-12ZM56,58H40a6,6,0,0,0,0,12H56a6,6,0,0,0,0-12Zm0,64H40.00586a6,6,0,1,0,0,12H56a6,6,0,0,0,0-12Zm0,64H40.00586a6,6,0,1,0,0,12H56a6,6,0,0,0,0-12Z" />
        </svg>
      )}

      {typeIcon === "dropdown" && (
        <svg
          className={className}
          onClick={onClick}
          height={size ? size + "px" : "30px"}
          viewBox="0 0 48 48"
          fill={fill ? fill : "none"}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="48" height="48" fill="white" />
          <path d="M40 28L24 40L8 28" stroke="#000000" />
          <path d="M8 10H40" stroke="#000000" />
          <path d="M8 18H40" stroke="#000000" />
        </svg>
      )}

      {typeIcon === "close" && (
        <svg
          className={className}
          onClick={onClick}
          height={size ? size + "px" : "30px"}
          viewBox="0 0 32 32"
          fill={fill ? fill : ""}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="Reject">
            <path
              className="cls-1"
              d="M16,4A12,12,0,1,0,28,16,12.0134,12.0134,0,0,0,16,4Zm4.707,15.293a1,1,0,1,1-1.414,1.414L16,17.4141,12.707,20.707a1,1,0,0,1-1.414-1.414L14.5859,16,11.293,12.707a1,1,0,0,1,1.414-1.414L16,14.5859l3.293-3.2929a1,1,0,0,1,1.414,1.414L17.4141,16Z"
            />
          </g>
        </svg>
      )}
    </>
  );
};

Icon.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
  onClick: PropTypes.func,
  typeIcon: PropTypes.string,
  fill: PropTypes.string,
};

export default Icon;
