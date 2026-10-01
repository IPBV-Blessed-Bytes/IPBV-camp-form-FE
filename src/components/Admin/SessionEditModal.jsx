import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import CustomModal from '@/components/Global/CustomModal';
import Icons from '@/components/Global/Icons';
import { updateAdminSession } from '@/services/adminSessions';
import { iconsOptions } from '@/utils/constants';
import { defaultIconFor } from '@/config/adminSessions';
import SpinnerButton from '@/components/Global/SpinnerButton';

const DEFAULT_COLOR = '#007185';

const SessionEditModal = ({ show, onHide, sessionKey, sessionTitle, defaultIcon, config, onSaved }) => {
  const { t } = useTranslation();
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
      toast.success(t('admin.ui.sessionEdit.cardUpdated'));
      onSaved?.();
      onHide();
    } catch (error) {
      toast.error(t('admin.ui.sessionEdit.cardUpdateError'));
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
      title={sessionTitle ? t('admin.ui.sessionEdit.customizeTitle', { title: sessionTitle }) : t('admin.ui.sessionEdit.customizeTitleDefault')}
      footer={
        <>
          <Button variant="secondary" onClick={onHide}>
            {t('admin.ui.sessionEdit.cancel')}
          </Button>
          <SpinnerButton variant="teal-blue" onClick={handleSave} loading={saving}>{t('admin.ui.sessionEdit.save')}</SpinnerButton>
        </>
      }
    >
      <Form>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-bold">{t('admin.ui.sessionEdit.iconLabel')}</Form.Label>
          <div className="d-flex align-items-center gap-2">
            <Icons typeIcon={icon || defaultIcon || defaultIconFor(sessionKey)} iconSize={28} fill="#007185" />
            <Form.Select value={icon} onChange={(e) => setIcon(e.target.value)}>
              <option value="">{t('admin.ui.sessionEdit.defaultIcon')}</option>
              {iconsOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </div>
          <Form.Text className="text-muted">{t('admin.ui.sessionEdit.iconHint')}</Form.Text>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label className="small fw-bold">{t('admin.ui.sessionEdit.cardColorLabel')}</Form.Label>
          <Form.Check
            type="checkbox"
            id="session-custom-color"
            label={t('admin.ui.sessionEdit.useCustomColor')}
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
          <Form.Text className="text-muted">{t('admin.ui.sessionEdit.colorHint')}</Form.Text>
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
