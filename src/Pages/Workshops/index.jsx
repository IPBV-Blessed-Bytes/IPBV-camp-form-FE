import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { InputMask, format } from '@react-input/mask';
import { toast } from 'react-toastify';

import useAuth from '@/hooks/useAuth';
import { getActiveWorkshops, getMyWorkshops, registerWorkshops, workshopImageUrl } from '@/services/workshops';
import { CPF_MASK, PHONE_MASK } from '@/utils/masks';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

const Workshops = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, displayName } = useAuth();

  const [workshops, setWorkshops] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', cpf: '', contact: '' });

  useEffect(() => {
    if (!isLoggedIn) navigate('/entrar');
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    setForm((prev) => ({
      name: prev.name || displayName || user?.name || '',
      cpf: prev.cpf || '',
      contact: prev.contact || '',
    }));
  }, [displayName, user]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [active, mine] = await Promise.all([getActiveWorkshops(), getMyWorkshops().catch(() => [])]);
      setWorkshops(Array.isArray(active) ? active : []);
      setRegisteredIds(new Set((Array.isArray(mine) ? mine : []).map((r) => r.workshopId)));
    } catch {
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) load();
  }, [isLoggedIn, load]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size === 0) {
      toast.error('Selecione ao menos um workshop.');
      return;
    }
    if (!form.name.trim() || !form.cpf.trim() || !form.contact.trim()) {
      toast.error('Preencha nome, CPF e telefone.');
      return;
    }
    if (form.cpf.length !== 11) {
      toast.error('Informe um CPF válido (11 dígitos).');
      return;
    }
    if (form.contact.length < 10) {
      toast.error('Informe um telefone válido com DDD.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await registerWorkshops({
        workshopIds: [...selected],
        name: form.name.trim(),
        cpf: form.cpf,
        contact: format(form.contact, PHONE_MASK),
      });
      const registered = result?.registered || [];
      const full = result?.full || [];
      const already = result?.alreadyRegistered || [];
      if (registered.length) toast.success(`Inscrito em: ${registered.join(', ')}.`);
      if (full.length) toast.warn(`Esgotado(s): ${full.join(', ')}.`);
      if (already.length) toast.info(`Você já estava inscrito em: ${already.join(', ')}.`);
      if (!registered.length && !full.length && !already.length) toast.info('Nenhuma inscrição registrada.');
      setSelected(new Set());
      await load();
    } catch {
      toast.error('Não foi possível registrar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading loading />;

  const selectedCount = selected.size;

  return (
    <div className="workshops-page">
      <div className="workshops-page__inner">
        <button type="button" className="workshops-page__back" onClick={() => navigate('/')}>
          <Icons typeIcon="arrow-left" iconSize={18} fill="currentColor" />
          <span>Voltar</span>
        </button>

        <header className="workshops-page__header">
          <span className="workshops-page__badge">Inscrição</span>
          <h1>Workshops</h1>
          <p>Escolha os workshops que você quer participar e confirme seus dados.</p>
        </header>

        {workshops.length === 0 ? (
          <div className="workshops-page__empty">
            <Icons typeIcon="form" iconSize={40} fill="#c3ccd1" />
            <p>Nenhum workshop disponível no momento.</p>
          </div>
        ) : (
          <>
            <div className="workshops-page__list">
              {workshops.map((workshop) => {
                const already = registeredIds.has(workshop.id);
                const soldOut = workshop.vacancies > 0 && workshop.remaining <= 0;
                const disabled = already || soldOut;
                const checked = selected.has(workshop.id) || already;
                return (
                  <label className={`ws-opt${checked ? ' is-selected' : ''}${disabled ? ' is-disabled' : ''}`} key={workshop.id}>
                    <input
                      type="checkbox"
                      className="ws-opt__input"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(workshop.id)}
                    />
                    <span className="ws-opt__media">
                      {workshop.hasImage ? (
                        <img src={workshopImageUrl(workshop.id)} alt={workshop.name} loading="lazy" />
                      ) : (
                        <span className="ws-opt__media--empty">{workshop.name?.charAt(0)?.toUpperCase() || '?'}</span>
                      )}
                    </span>
                    <span className="ws-opt__body">
                      <span className="ws-opt__name">{workshop.name}</span>
                      {workshop.description && <span className="ws-opt__desc">{workshop.description}</span>}
                      <span className={`ws-opt__tag${already ? ' is-in' : ''}${soldOut ? ' is-out' : ''}`}>
                        {already
                          ? 'Você já está inscrito'
                          : soldOut
                          ? 'Esgotado'
                          : workshop.vacancies > 0
                          ? `${workshop.remaining} vaga(s) restante(s)`
                          : 'Vagas livres'}
                      </span>
                    </span>
                    <span className="ws-opt__check" aria-hidden="true">
                      <Icons typeIcon="checked" iconSize={16} fill="#fff" />
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="workshops-page__form">
              <div className="workshops-page__form-head">
                <span className="workshops-page__form-icon">
                  <Icons typeIcon="person" iconSize={20} fill="#fff" />
                </span>
                <h2>Seus dados</h2>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome completo" />
              </Form.Group>
              <div className="workshops-page__form-row">
                <Form.Group>
                  <Form.Label>CPF</Form.Label>
                  <InputMask
                    component={Form.Control}
                    {...CPF_MASK}
                    value={format(form.cpf, CPF_MASK)}
                    onChange={(e) => setForm({ ...form, cpf: onlyDigits(e.target.value) })}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Telefone</Form.Label>
                  <InputMask
                    component={Form.Control}
                    {...PHONE_MASK}
                    value={format(form.contact, PHONE_MASK)}
                    onChange={(e) => setForm({ ...form, contact: onlyDigits(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    inputMode="tel"
                  />
                </Form.Group>
              </div>

              <Button className="workshops-page__submit" onClick={handleSubmit} disabled={submitting || selectedCount === 0}>
                {submitting
                  ? 'Enviando...'
                  : selectedCount > 0
                  ? `Confirmar inscrição (${selectedCount})`
                  : 'Selecione um workshop'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Workshops;
