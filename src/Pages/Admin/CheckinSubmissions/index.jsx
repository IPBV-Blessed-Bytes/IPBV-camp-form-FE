import { useEffect, useMemo, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import {
  listSubmissions,
  getSubmissionsByOrder,
  checkinSubmission,
  checkinOrder,
} from '@/services/submissions';
import { parseCheckoutQr } from '@/utils/checkinQr';
import { registerLog } from '@/services/logs';
import { formatValue } from '@/form/dynamic/formatAnswer';
import useEventSchema from '@/hooks/useEventSchema';
import scrollUp from '@/hooks/useScrollUp';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import QrScannerModal from '@/components/Global/QrScannerModal';
import CheckinReviewModal from '@/components/Global/CheckinReviewModal';
import '@/Pages/Admin/Checkin/style.scss';

const PAYMENT_STATUS_KEY = {
  paid: 'statusPaid',
  pending: 'statusPending',
  refunded: 'statusRefunded',
  cancelled: 'statusCancelled',
};
const PAYMENT_METHOD_KEY = {
  credit_card: 'methodCreditCard',
  creditCard: 'methodCreditCard',
  pix: 'methodPix',
  boleto: 'methodBoleto',
  ticket: 'methodBoleto',
};

const formatBrl = (cents) =>
  cents == null ? '-' : (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

const mapPerson = (submission) => ({
  id: submission.id,
  name: submission.answers?.nome || '',
  cpf: submission.answers?.cpf || '',
  checkin: submission.checkin,
  checkinTime: submission.checkinTime,
  paymentStatus: submission.paymentStatus,
  paymentMethod: submission.paymentMethod,
  totalCents: submission.totalCents,
  orderNumber: submission.orderNumber,
  createdAt: submission.createdAt,
  answers: submission.answers || {},
});

const AdminCheckinSubmissions = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const statusLabel = (value) => (PAYMENT_STATUS_KEY[value] ? t(`admin.checkin.${PAYMENT_STATUS_KEY[value]}`) : null);
  const methodLabel = (value) => (PAYMENT_METHOD_KEY[value] ? t(`admin.checkin.${PAYMENT_METHOD_KEY[value]}`) : null);
  const { fields } = useEventSchema();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewPeople, setReviewPeople] = useState([]);
  const [approving, setApproving] = useState(false);

  scrollUp();

  const load = async () => {
    try {
      setSubmissions(await listSubmissions());
    } catch {
      toast.error(t('admin.checkin.toastLoadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statItems = useMemo(() => {
    const total = submissions.length;
    const done = submissions.filter((s) => s.checkin).length;
    const percent = total ? Math.round((done / total) * 100) : 0;
    return [
      { label: t('admin.checkin.statTotal'), value: total },
      { label: t('admin.checkin.statDone'), value: done, tone: 'free' },
      { label: t('admin.checkin.statPending'), value: total - done, tone: 'used' },
      { label: t('admin.checkin.statPercent'), value: `${percent}%`, tone: 'info' },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions]);

  const matches = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (q.length < 2) return [];
    const qDigits = onlyDigits(q);
    return submissions
      .filter((s) => {
        const name = String(s.answers?.nome || '').toLowerCase();
        const cpf = onlyDigits(s.answers?.cpf);
        return name.includes(q) || (qDigits && cpf.includes(qDigits));
      })
      .slice(0, 12);
  }, [term, submissions]);

  const selectPerson = (submission) => {
    setSelected(mapPerson(submission));
    setTerm(submission.answers?.nome || submission.answers?.cpf || '');
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setTerm('');
    setSelected(null);
    setShowSuggestions(false);
  };

  const toggleSelectedCheckin = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      const next = !selected.checkin;
      await checkinSubmission(selected.id, next);
      registerLog(`${next ? 'Fez' : 'Desfez'} check-in de ${selected.name || selected.cpf}`, loggedUsername);
      const fresh = await listSubmissions();
      setSubmissions(fresh);
      const updated = fresh.find((s) => s.id === selected.id);
      if (updated) setSelected(mapPerson(updated));
    } catch {
      toast.error(t('admin.checkin.toastUpdateError'));
    } finally {
      setUpdating(false);
    }
  };

  const openReview = async (orderNumber) => {
    if (!orderNumber) return;
    try {
      const people = await getSubmissionsByOrder(orderNumber);
      if (!people.length) {
        toast.error(t('admin.checkin.toastOrderNotFound', { order: orderNumber }));
        return;
      }
      setReviewOrder(orderNumber);
      setReviewPeople(people.map(mapPerson));
    } catch {
      toast.error(t('admin.checkin.toastOrderError'));
    }
  };

  const handleScan = (text) => {
    setShowScanner(false);
    const orderNumber = parseCheckoutQr(text);
    if (!orderNumber) {
      toast.error(t('admin.checkin.toastInvalidQr'));
      return;
    }
    openReview(orderNumber);
  };

  const refreshReview = async (orderNumber) => {
    const people = await getSubmissionsByOrder(orderNumber);
    setReviewPeople(people.map(mapPerson));
    await load();
  };

  const approveOne = async (person) => {
    setApproving(true);
    try {
      await checkinSubmission(person.id, true);
      registerLog(`Fez check-in de ${person.name || person.cpf} (pedido ${reviewOrder})`, loggedUsername);
      await refreshReview(reviewOrder);
    } catch {
      toast.error(t('admin.checkin.toastCheckinError'));
    } finally {
      setApproving(false);
    }
  };

  const undoOne = async (person) => {
    setApproving(true);
    try {
      await checkinSubmission(person.id, false);
      registerLog(`Desfez check-in de ${person.name || person.cpf} (pedido ${reviewOrder})`, loggedUsername);
      await refreshReview(reviewOrder);
    } catch {
      toast.error(t('admin.checkin.toastUndoError'));
    } finally {
      setApproving(false);
    }
  };

  const approveAll = async () => {
    setApproving(true);
    try {
      await checkinOrder(reviewOrder);
      registerLog(`Fez check-in de todo o pedido ${reviewOrder}`, loggedUsername);
      await refreshReview(reviewOrder);
    } catch {
      toast.error(t('admin.checkin.toastOrderCheckinError'));
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="admin-subpage admin-subpage--checkin">
      <AdminSubpageHeader
        sessionKey="checkin"
        username={loggedUsername}
        title={t('admin.checkin.title')}
        subtitle={t('admin.checkin.subtitle')}
        typeIcon="checkin"
      />

      <div className="admin-subpage__content">
        {loading ? (
          <Loading loading />
        ) : (
          <>
            <StatCards items={statItems} />

            <div className="admin-panel checkin-search">
              <Form.Group controlId="checkin-search">
                <Form.Label>
                  <b>{t('admin.checkin.searchLabel')}</b>
                </Form.Label>
                <div className="cpf-input-wrapper">
                  <Form.Control
                    autoComplete="off"
                    type="text"
                    placeholder={t('admin.checkin.searchPlaceholder')}
                    value={term}
                    size="lg"
                    onChange={(e) => {
                      setTerm(e.target.value);
                      setSelected(null);
                      setShowSuggestions(true);
                    }}
                  />
                  {term && (
                    <button
                      aria-label={t('admin.checkin.clear')}
                      className="cpf-clear-button"
                      type="button"
                      onClick={clearSearch}
                    >
                      <Icons typeIcon="close" iconSize={30} fill="#6c757d" />
                    </button>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline-teal-blue"
                  className="w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
                  onClick={() => setShowScanner(true)}
                >
                  <Icons typeIcon="camera" iconSize={20} fill="#007185" />
                  {t('admin.checkin.scanQr')}
                </Button>

                {showSuggestions && !selected && term.trim().length >= 2 && (
                  <div className="cpf-suggestions">
                    {matches.length > 0 ? (
                      matches.map((s) => (
                        <div key={s.id} className="cpf-suggestions-item" onClick={() => selectPerson(s)}>
                          <strong>{s.answers?.nome || t('admin.checkin.noName')}</strong>
                          <span>{s.answers?.cpf || '—'}</span>
                        </div>
                      ))
                    ) : (
                      <div className="cpf-suggestions-empty">{t('admin.checkin.noMatches')}</div>
                    )}
                  </div>
                )}
              </Form.Group>
            </div>

            {selected && (
              <div className="admin-panel checkin-user">
                <div className="checkin-user__head">
                  <div className="checkin-user__identity">
                    <span className="checkin-user__eyebrow">{t('admin.checkin.participant')}</span>
                    <h2 className="checkin-user__name">{selected.name || t('admin.checkin.noName')}</h2>
                  </div>
                  <span className={`checkin-status-badge checkin-status-badge--${selected.checkin ? 'in' : 'out'}`}>
                    <Icons
                      typeIcon={selected.checkin ? 'checked' : 'close'}
                      iconSize={16}
                      fill={selected.checkin ? '#0c9183' : '#d32f2f'}
                    />
                    {selected.checkin ? t('admin.checkin.badgeCheckedIn') : t('admin.checkin.badgeNotCheckedIn')}
                  </span>
                </div>

                <div className="checkin-info">
                  {fields.map((field) => (
                    <div className="checkin-info__item" key={field.key}>
                      <span className="checkin-info__label">{field.label}</span>
                      <span className="checkin-info__value">
                        {formatValue(field, selected.answers?.[field.key]) || '-'}
                      </span>
                    </div>
                  ))}
                  <div className="checkin-info__item">
                    <span className="checkin-info__label">{t('admin.checkin.order')}</span>
                    <span className="checkin-info__value">{selected.orderNumber || '-'}</span>
                  </div>
                  <div className="checkin-info__item">
                    <span className="checkin-info__label">{t('admin.checkin.payment')}</span>
                    <span className="checkin-info__value">
                      {statusLabel(selected.paymentStatus) || selected.paymentStatus || '-'}
                    </span>
                  </div>
                  <div className="checkin-info__item">
                    <span className="checkin-info__label">{t('admin.checkin.paymentMethod')}</span>
                    <span className="checkin-info__value">
                      {methodLabel(selected.paymentMethod) || selected.paymentMethod || '-'}
                    </span>
                  </div>
                  <div className="checkin-info__item">
                    <span className="checkin-info__label">{t('admin.checkin.amount')}</span>
                    <span className="checkin-info__value">{formatBrl(selected.totalCents)}</span>
                  </div>
                </div>

                <div className="checkin-user__action">
                  <Button
                    variant={selected.checkin ? 'outline-danger' : 'teal-blue'}
                    onClick={toggleSelectedCheckin}
                    size="lg"
                    disabled={updating}
                    className="checkin-user__submit"
                  >
                    <Icons
                      typeIcon={selected.checkin ? 'close' : 'checked'}
                      iconSize={20}
                      fill={selected.checkin ? '#d32f2f' : '#fff'}
                    />
                    <span>&nbsp;{selected.checkin ? t('admin.checkin.undoCheckin') : t('admin.checkin.confirmCheckin')}</span>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <QrScannerModal show={showScanner} onHide={() => setShowScanner(false)} onScan={handleScan} />
      <CheckinReviewModal
        show={Boolean(reviewOrder)}
        onHide={() => setReviewOrder(null)}
        orderNumber={reviewOrder}
        submissions={reviewPeople}
        fields={fields}
        onApprove={approveOne}
        onApproveAll={approveAll}
        onUndo={undoOne}
        approving={approving}
      />
    </div>
  );
};

AdminCheckinSubmissions.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminCheckinSubmissions;
