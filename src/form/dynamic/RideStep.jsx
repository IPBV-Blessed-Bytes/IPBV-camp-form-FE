import { Card, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

import Icons from '@/components/Global/Icons';
import './RideStep.scss';

const OPTIONS = [
  { value: 'none', label: 'Não preciso de carona', hint: 'Vou por conta própria.' },
  { value: 'offer', label: 'Vou de carro e posso oferecer carona', hint: 'Informe as vagas disponíveis.' },
  { value: 'need', label: 'Preciso de carona', hint: 'Vamos tentar te encaixar em um carro.' },
];

const RideStep = ({ value, onChange }) => {
  const ride = value || { mode: 'none', seats: '', observation: '', phone: '' };
  const set = (patch) => onChange({ ...ride, ...patch });
  const mode = ride.mode || 'none';

  return (
    <Card className="ride-step">
      <Card.Body>
        <Card.Title className="d-flex align-items-center gap-2">
          <Icons typeIcon="ride" iconSize={24} fill="#007185" />
          Carona
        </Card.Title>
        <Card.Text className="text-secondary">
          Ajude a organizar o transporte do grupo. Escolha uma opção abaixo.
        </Card.Text>

        <div className="ride-step__options">
          {OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`ride-step__option ${mode === option.value ? 'is-active' : ''}`}
            >
              <Form.Check
                type="radio"
                name="ride-mode"
                checked={mode === option.value}
                onChange={() => set({ mode: option.value })}
              />
              <span className="ride-step__option-body">
                <b>{option.label}</b>
                <small className="text-secondary">{option.hint}</small>
              </span>
            </label>
          ))}
        </div>

        {mode === 'offer' && (
          <Form.Group className="mt-3">
            <Form.Label>Vagas disponíveis no carro</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={ride.seats || ''}
              onChange={(e) => set({ seats: e.target.value })}
              placeholder="Ex.: 3"
            />
          </Form.Group>
        )}

        {mode !== 'none' && (
          <>
            <Form.Group className="mt-3">
              <Form.Label>WhatsApp para combinar</Form.Label>
              <Form.Control
                type="tel"
                value={ride.phone || ''}
                onChange={(e) => set({ phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Observação</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={ride.observation || ''}
                onChange={(e) => set({ observation: e.target.value })}
                placeholder={
                  mode === 'offer' ? 'Ponto de partida, horário, bagagem...' : 'De onde você sai, horário...'
                }
              />
            </Form.Group>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

RideStep.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default RideStep;
