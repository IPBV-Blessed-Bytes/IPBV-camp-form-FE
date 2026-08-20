import { useEffect, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import { listFaqs, createFaq, updateFaq, deleteFaq } from '@/services/faqs';
import { getApiErrorMessage } from '@/fetchers/helpers';
import { getEventSlug } from '@/config/eventScope';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import CustomModal from '@/components/Global/CustomModal';
import CustomEditor from '@/components/Global/CustomEditor';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

const EMPTY_FAQ = { id: null, question: '', answer: '' };

const AdminFaqBuilder = ({ loggedUsername }) => {
  const slug = useMemo(() => getEventSlug(), []);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState(EMPTY_FAQ);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setFaqs(await listFaqs());
    } catch {
      toast.error('Erro ao carregar as perguntas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setDraft(EMPTY_FAQ);
    setShowModal(true);
  };

  const openEdit = (faq) => {
    setDraft({ id: faq.id, question: faq.question || '', answer: faq.answer || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!draft.question.trim()) {
      toast.error('A pergunta é obrigatória.');
      return;
    }
    setSaving(true);
    const payload = { question: draft.question.trim(), answer: draft.answer || '' };
    try {
      if (draft.id) {
        await updateFaq(draft.id, { ...payload, order: faqs.findIndex((f) => f.id === draft.id) });
        toast.success('Pergunta atualizada.');
      } else {
        await createFaq({ ...payload, order: faqs.length });
        toast.success('Pergunta criada.');
      }
      setShowModal(false);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao salvar a pergunta.');
    } finally {
      setSaving(false);
    }
  };

  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= faqs.length) return;
    const reordered = [...faqs];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setSaving(true);
    try {
      await Promise.all(
        reordered.map((faq, i) => updateFaq(faq.id, { question: faq.question, answer: faq.answer, order: i })),
      );
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao reordenar.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setSaving(true);
    try {
      await deleteFaq(toDelete.id);
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Erro ao excluir.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-subpage faq-builder">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Perguntas Frequentes"
        subtitle={`Perguntas do evento: ${slug}`}
        typeIcon="question"
      />

      <div className="faq-builder__content">
        <div className="faq-builder__toolbar">
          <Button className="d-flex align-items-center" variant="teal-blue" onClick={openCreate}>
            Nova Pergunta&nbsp;&nbsp;
            <Icons typeIcon="plus" iconSize={16} fill="#fff" />
          </Button>
        </div>

        {loading ? (
          <Loading loading />
        ) : faqs.length === 0 ? (
          <p className="faq-builder__empty">Nenhuma pergunta cadastrada. Crie a primeira acima.</p>
        ) : (
          <ul className="faq-builder__list">
            {faqs.map((faq, index) => (
              <li key={faq.id} className="faq-builder__item">
                <span className="faq-builder__num">{index + 1}</span>
                <span className="faq-builder__question">{faq.question}</span>
                <div className="faq-builder__actions">
                  <button
                    type="button"
                    className="faq-builder__icon-btn"
                    disabled={saving || index === 0}
                    onClick={() => move(index, -1)}
                    title="Mover para cima"
                  >
                    <Icons typeIcon="arrow-left" iconSize={16} fill="#555050" />
                  </button>
                  <button
                    type="button"
                    className="faq-builder__icon-btn faq-builder__icon-btn--down"
                    disabled={saving || index === faqs.length - 1}
                    onClick={() => move(index, 1)}
                    title="Mover para baixo"
                  >
                    <Icons typeIcon="arrow-left" iconSize={16} fill="#555050" />
                  </button>
                  <Button size="sm" variant="outline-teal-blue" onClick={() => openEdit(faq)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => setToDelete(faq)}>
                    <Icons typeIcon="delete" iconSize={20} fill="#dc3545" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        variant="info"
        size="lg"
        title={draft.id ? 'Editar Pergunta' : 'Nova Pergunta'}
        icon={draft.id ? 'edit-modal' : 'plus'}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="teal-blue" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              <b>Pergunta:</b>
            </Form.Label>
            <Form.Control
              value={draft.question}
              onChange={(e) => setDraft((prev) => ({ ...prev, question: e.target.value }))}
              placeholder="Ex.: Quando e onde será o evento?"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>
              <b>Resposta:</b>
            </Form.Label>
            <CustomEditor
              value={draft.answer}
              onChange={(value) => setDraft((prev) => ({ ...prev, answer: value }))}
            />
          </Form.Group>
        </Form>
      </CustomModal>

      <CustomModal
        show={Boolean(toDelete)}
        onHide={() => setToDelete(null)}
        variant="cancel"
        title="Excluir pergunta"
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setToDelete(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={saving}>
              {saving ? 'Excluindo...' : 'Excluir'}
            </Button>
          </>
        }
      >
        <p>
          Tem certeza que deseja excluir a pergunta <b>{toDelete?.question}</b>?
        </p>
      </CustomModal>
    </div>
  );
};

AdminFaqBuilder.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminFaqBuilder;
