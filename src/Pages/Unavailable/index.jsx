import './style.scss';

const Unavailable = () => (
  <div className="unavailable">
    <div className="unavailable__card">
      <h1 className="unavailable__title">Inscrições temporariamente indisponíveis</h1>
      <p className="unavailable__text">
        As inscrições deste evento estão pausadas no momento. Tente novamente mais tarde ou entre em contato com a
        organização do evento.
      </p>
    </div>
  </div>
);

export default Unavailable;
