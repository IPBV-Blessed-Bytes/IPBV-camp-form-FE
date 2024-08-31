import PropTypes from 'prop-types';

const Loading = ({ loading, messageText }) => {
  return (
    <>
      {loading && (
        <div className="overlay">
          <div className="spinner-container">
            <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
            <span>
              <b>
                <em>{messageText ? messageText : 'Processando dados'}</em>
              </b>
            </span>
          </div>
        </div>
      )}
    </>
  );
};

Loading.propTypes = {
  loading: PropTypes.bool,
  messageText: PropTypes.string,
};

export default Loading;
