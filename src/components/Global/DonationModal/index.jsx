import { Form, InputGroup, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import CustomModal from '@/components/Global/CustomModal';
import Icons from '@/components/Global/Icons';
import './style.scss';

const DonationModal = ({ show, onHide, donation, onChange }) => (
  <CustomModal
    show={show}
    onHide={onHide}
    variant="info"
    title="Ajuda Social"
    icon="couple"
    iconFill="#2E5AAC"
    footer={
      <Button variant="teal-blue" onClick={onHide}>
        Confirmar
      </Button>
    }
  >
    <div className="donation-modal">
      <p className="donation-modal__desc">
        Contribua com um valor para ajudar quem realmente <b>não tem condições</b> de arcar com o valor acampamento. O
        valor é somado ao seu total, <b>sem desconto</b>, e destinado integralmente ao fundo de ajuda. Uma comissão irá
        decidir os que serão auxiliados por esse fundo de ajuda.
      </p>

      <Form.Label className="donation-modal__label">
        <b>Valor da doação</b> (opcional)
      </Form.Label>
      <InputGroup size="lg">
        <InputGroup.Text>R$</InputGroup.Text>
        <Form.Control
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          placeholder="0"
          value={donation}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
        />
      </InputGroup>

      <div className="donation-modal__hint">
        <Icons typeIcon="info" iconSize={16} fill="#007185" />
        <span>Deixe em branco ou 0 se não quiser doar.</span>
      </div>
    </div>
  </CustomModal>
);

DonationModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  donation: PropTypes.string,
  onChange: PropTypes.func,
};

export default DonationModal;
