import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import CustomModal from '@/components/Global/CustomModal';
import Icons from '@/components/Global/Icons';
import { updateAdminSession } from '@/services/adminSessions';
import { iconsOptions } from '@/utils/constants';
import { defaultIconFor } from '@/config/adminSessions';
import SpinnerButton from '@/components/Global/SpinnerButton';

const DEFAULT_COLOR = '#007185';

const SessionEditModal = ({ show, onHide, sessionKey, sessionTitle, defaultIcon, config, onSaved }) => {
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [icon, setIcon] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!show) return;
    setUseCustomColor(Boolean(config?.color));
    setColor(config?.color || DEFAULT_COLOR);
    setIcon(config?.iconKey || '');
  }, [show, config]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAdminSession(sessionKey, {
        title: null,
        description: null,
        color: useCustomColor ? color : null,
        iconKey: icon || null,
      });
      toast.success('Card atualizado com sucesso.');
      onSaved?.();
      onHide();
    } catch (error) {
      toast.error('Não foi possível atualizar o card.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CustomModal
      show={show}
      onHide={onHide}
      variant="info"
      icon="edit"
      iconFill="none"
      title={sessionTitle ? `Personalizar: ${sessionTitle}` : 'Personalizar card'}
      footer={
        <>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <SpinnerButton variant="teal-blue" onClick={handleSave} loading={saving}>Salvar</SpinnerButton>
        </>
      }
    >
      <Form>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-bold">Ícone</Form.Label>
          <div className="d-flex align-items-center gap-2">
            <Icons typeIcon={icon || defaultIcon || defaultIconFor(sessionKey)} iconSize={28} fill="#007185" />
            <Form.Select value={icon} onChange={(e) => setIcon(e.target.value)}>
              <option value="">Ícone padrão</option>
              {iconsOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </div>
          <Form.Text className="text-muted">Aparece no card da home e no topo da sessão.</Form.Text>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label className="small fw-bold">Cor do card</Form.Label>
          <Form.Check
            type="checkbox"
            id="session-custom-color"
            label="Usar cor personalizada"
            checked={useCustomColor}
            onChange={(e) => setUseCustomColor(e.target.checked)}
            className="mb-2"
          />
          {useCustomColor && (
            <div className="d-flex align-items-center gap-2">
              <Form.Control
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: 56, padding: 4 }}
              />
              <Form.Control
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ maxWidth: 140 }}
              />
            </div>
          )}
          <Form.Text className="text-muted">Aparece apenas no card da home.</Form.Text>
        </Form.Group>
      </Form>
    </CustomModal>
  );
};

SessionEditModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  sessionKey: PropTypes.string.isRequired,
  sessionTitle: PropTypes.string,
  defaultIcon: PropTypes.string,
  config: PropTypes.object,
  onSaved: PropTypes.func,
};

export default SessionEditModal;
