import PropTypes from 'prop-types';
import { getEventSlugFromPath, stripEventPrefix } from '@/config/eventScope';
import Icons from './Icons';
import '../Style/Loading.scss';

const Loading = ({ loading, messageText }) => {
  const isInstitutional = !!getEventSlugFromPath() && stripEventPrefix(window.location.pathname) === '/';

  if (loading && isInstitutional) {
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
