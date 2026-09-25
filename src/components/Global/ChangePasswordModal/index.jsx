import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { changePassword } from '@/services/auth';
import { getApiErrorMessage } from '@/fetchers/helpers';
import Icons from '@/components/Global/Icons';
import './style.scss';

const EMPTY = { current: '', next: '', confirm: '' };

const ChangePasswordModal = ({ show, onHide }) => {
  const [form, setForm] = useState(EMPTY);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const close = () => {
    setForm(EMPTY);
    onHide();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.current) {
      toast.error('Informe sua senha atual.');
      return;
    }
    if (form.next.length < 6) {
      toast.error('A nova senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (form.next !== form.confirm) {
      toast.error('A confirmação não confere com a nova senha.');
      return;
    }
    setSaving(true);
    try {
      await changePassword({ currentPassword: form.current, newPassword: form.next });
      toast.success('Senha alterada com sucesso.');
      close();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Não foi possível alterar a senha.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={close} centered>
      <Modal.Header closeButton>
        <Modal.Title>Alterar senha</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="change-password">
          <Form.Group>
            <Form.Label className="fw-bold">Senha atual</Form.Label>
            <div className="change-password__field">
              <Form.Control
                type={show1 ? 'text' : 'password'}
                value={form.current}
                onChange={set('current')}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShow1((v) => !v)} aria-label="Mostrar senha">
                <Icons typeIcon={show1 ? 'visible-password' : 'hidden-password'} iconSize={20} />
              </button>
            </div>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label className="fw-bold">Nova senha</Form.Label>
            <div className="change-password__field">
              <Form.Control
                type={show2 ? 'text' : 'password'}
                value={form.next}
                onChange={set('next')}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShow2((v) => !v)} aria-label="Mostrar senha">
                <Icons typeIcon={show2 ? 'visible-password' : 'hidden-password'} iconSize={20} />
              </button>
            </div>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label className="fw-bold">Confirmar nova senha</Form.Label>
            <Form.Control
              type={show2 ? 'text' : 'password'}
              value={form.confirm}
              onChange={set('confirm')}
              autoComplete="new-password"
            />
          </Form.Group>

          <div className="change-password__actions">
            <Button variant="outline-secondary" onClick={close} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="teal-blue" className="fw-bold" disabled={saving}>
              {saving ? 'Salvando...' : 'Alterar senha'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

ChangePasswordModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
};

export default ChangePasswordModal;
