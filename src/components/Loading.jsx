const Loading = ({ loading }) => {
  return (
    <>
      {loading && (
        <div className="overlay">
          <div className="spinner-container">
            <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
            <span>
              <b>
                <em>Carregando dados</em>
              </b>
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default Loading;
