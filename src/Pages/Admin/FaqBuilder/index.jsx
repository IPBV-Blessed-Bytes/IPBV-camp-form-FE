import { useEffect, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';

import { listFaqs, createFaq, updateFaq, deleteFaq } from '@/services/faqs';
import { registerLog } from '@/services/logs';
import { getApiErrorMessage } from '@/fetchers/helpers';
import useEventName from '@/hooks/useEventName';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import CustomModal from '@/components/Global/CustomModal';
import CustomEditor from '@/components/Global/CustomEditor';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';
import SpinnerButton from '@/components/Global/SpinnerButton';

const EMPTY_FAQ = { id: null, question: '', answer: '' };

const hasAnswer = (answer) =>
  Boolean(
    (answer || '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim(),
  );

const AdminFaqBuilder = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const eventName = useEventName();
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
      toast.error(t('admin.faq.loadError'));
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
      toast.error(t('admin.faq.questionRequired'));
      return;
    }
    setSaving(true);
    const payload = { question: draft.question.trim(), answer: draft.answer || '' };
    try {
      if (draft.id) {
        await updateFaq(draft.id, { ...payload, order: faqs.findIndex((f) => f.id === draft.id) });
        toast.success(t('admin.faq.updated'));
      } else {
        await createFaq({ ...payload, order: faqs.length });
        toast.success(t('admin.faq.created'));
      }
      registerLog(draft.id ? 'Editou uma pergunta do FAQ' : 'Criou uma pergunta no FAQ', loggedUsername);
      setShowModal(false);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.faq.saveError'));
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
      registerLog('Reordenou as perguntas do FAQ', loggedUsername);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.faq.reorderError'));
    } finally {
      setSaving(false);
    }
  };

  const answered = useMemo(() => faqs.filter((faq) => hasAnswer(faq.answer)).length, [faqs]);
  const statItems = [
    { label: t('admin.faq.statQuestions'), value: faqs.length },
    { label: t('admin.faq.statAnswered'), value: answered, tone: 'free' },
    { label: t('admin.faq.statUnanswered'), value: faqs.length - answered, tone: faqs.length - answered > 0 ? 'danger' : 'default' },
  ];

  const confirmDelete = async () => {
    if (!toDelete) return;
    setSaving(true);
    try {
      await deleteFaq(toDelete.id);
      registerLog('Excluiu uma pergunta do FAQ', loggedUsername);
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.faq.deleteError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-subpage faq-builder">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.faq.title')}
        subtitle={t('admin.faq.subtitle', { eventName })}
        typeIcon="question"
      />

      <div className="faq-builder__content">
        <StatCards items={statItems} />

        <div className="faq-builder__toolbar">
          <Button className="d-flex align-items-center" variant="teal-blue" onClick={openCreate}>
            {t('admin.faq.newQuestion')}&nbsp;&nbsp;
            <Icons typeIcon="plus" iconSize={16} fill="#fff" />
          </Button>
        </div>

        {loading ? (
          <Loading loading />
        ) : faqs.length === 0 ? (
          <p className="faq-builder__empty">{t('admin.faq.empty')}</p>
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
                    title={t('admin.faq.moveUp')}
                  >
                    <Icons typeIcon="arrow-left" iconSize={16} fill="#555050" />
                  </button>
                  <button
                    type="button"
                    className="faq-builder__icon-btn faq-builder__icon-btn--down"
                    disabled={saving || index === faqs.length - 1}
                    onClick={() => move(index, 1)}
                    title={t('admin.faq.moveDown')}
                  >
                    <Icons typeIcon="arrow-left" iconSize={16} fill="#555050" />
                  </button>
                  <Button size="sm" variant="outline-teal-blue" onClick={() => openEdit(faq)}>
                    {t('admin.faq.edit')}
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
        title={draft.id ? t('admin.faq.editTitle') : t('admin.faq.newTitle')}
        icon={draft.id ? 'edit-modal' : 'plus'}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>
              {t('admin.faq.cancel')}
            </Button>
            <SpinnerButton variant="teal-blue" onClick={handleSave} loading={saving}>{t('admin.faq.save')}</SpinnerButton>
          </>
        }
      >
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              <b>{t('admin.faq.questionLabel')}</b>
            </Form.Label>
            <Form.Control
              value={draft.question}
              onChange={(e) => setDraft((prev) => ({ ...prev, question: e.target.value }))}
              placeholder={t('admin.faq.questionPlaceholder')}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>
              <b>{t('admin.faq.answerLabel')}</b>
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
        title={t('admin.faq.deleteTitle')}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setToDelete(null)} disabled={saving}>
              {t('admin.faq.cancel')}
            </Button>
            <SpinnerButton variant="danger" onClick={confirmDelete} loading={saving}>{t('admin.faq.delete')}</SpinnerButton>
          </>
        }
      >
        <p>
          <Trans
            i18nKey="admin.faq.deleteConfirm"
            components={{ b: <b /> }}
            values={{ question: toDelete?.question }}
          />
        </p>
      </CustomModal>
    </div>
  );
};

AdminFaqBuilder.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminFaqBuilder;
