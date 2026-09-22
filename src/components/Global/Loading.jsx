import PropTypes from 'prop-types';
import Icons from './Icons';
import '../Style/Loading.scss';

const Loading = ({ loading, messageText }) => {
  if (loading && window.location.pathname === '/') {
    return <div className="loading-blank" />;
  }

  return (
    <>
      {loading && (
        <div className="overlay">
          <div className="spinner-container">
            <span className="tent-spinner" role="status" aria-hidden="true">
              <Icons typeIcon="tent" iconSize={52} fill="#007185" />
            </span>
            <span>
              <b>
                <em>{messageText || 'Processando dados'}</em>
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
