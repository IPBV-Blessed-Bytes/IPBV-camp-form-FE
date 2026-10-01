import { useState, useEffect } from 'react';
import { Button, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/services/logs';
import { getChangeRequests, approveChangeRequest, rejectChangeRequest } from '@/services/changeRequests';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import FilterChips from '@/components/Admin/FilterChips';
import ReviewModal from './ReviewModal';
import { buildChangeDiff } from './diff';

const STATUS_BG = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

const STATUS_KEY = {
  PENDING: 'statusPending',
  APPROVED: 'statusApproved',
  REJECTED: 'statusRejected',
};

const AdminChangeRequests = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewTarget, setReviewTarget] = useState(null);
  const [processing, setProcessing] = useState(false);

  scrollUp();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      setRequests(await getChangeRequests());
    } catch (error) {
      toast.error(t('admin.changeRequests.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (note) => {
    if (!reviewTarget) return;
    setProcessing(true);
    try {
      await approveChangeRequest(reviewTarget.id, note);
      toast.success(t('admin.changeRequests.approveSuccess'));
      registerLog(`Aprovou alteração da inscrição ${reviewTarget.camperName || reviewTarget.camperId}`, loggedUsername);
      setReviewTarget(null);
      fetchRequests();
    } catch (error) {
      toast.error(t('admin.changeRequests.approveError'));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (note) => {
    if (!reviewTarget) return;
    setProcessing(true);
    try {
      await rejectChangeRequest(reviewTarget.id, note);
      toast.success(t('admin.changeRequests.rejectSuccess'));
      registerLog(`Rejeitou alteração da inscrição ${reviewTarget.camperName || reviewTarget.camperId}`, loggedUsername);
      setReviewTarget(null);
      fetchRequests();
    } catch (error) {
      toast.error(t('admin.changeRequests.rejectError'));
    } finally {
      setProcessing(false);
    }
  };

  const proposed = (request) =>
    buildChangeDiff(request)
      .map((d) => `${d.label}: ${d.after || t('admin.changeRequests.empty')}`)
      .join(' · ');

  const statusOf = (request) => (request.status || 'PENDING').toUpperCase();
  const countBy = (status) => requests.filter((r) => statusOf(r) === status).length;
  const pendingCount = countBy('PENDING');
  const approvedCount = countBy('APPROVED');
  const rejectedCount = countBy('REJECTED');

  const statItems = [
    { label: t('admin.changeRequests.statTotal'), value: requests.length },
    { label: t('admin.changeRequests.statPending'), value: pendingCount, tone: 'used' },
    { label: t('admin.changeRequests.statApproved'), value: approvedCount, tone: 'free' },
    { label: t('admin.changeRequests.statRejected'), value: rejectedCount, tone: 'danger' },
  ];

  const statusChips = [
    { value: 'all', label: t('admin.changeRequests.chipAll'), count: requests.length },
    { value: 'PENDING', label: t('admin.changeRequests.chipPending'), count: pendingCount },
    { value: 'APPROVED', label: t('admin.changeRequests.chipApproved'), count: approvedCount },
    { value: 'REJECTED', label: t('admin.changeRequests.chipRejected'), count: rejectedCount },
  ];

  const term = search.trim().toLowerCase();
  const filtered = requests.filter(
    (r) =>
      (statusFilter === 'all' || statusOf(r) === statusFilter) &&
      (!term || (r.camperName || `#${r.camperId}` || '').toLowerCase().includes(term)),
  );

  return (
    <div className="admin-subpage admin-subpage--change-requests">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.changeRequests.title')}
        subtitle={t('admin.changeRequests.subtitle')}
        typeIcon="refresh"
      />

      <div className="admin-subpage__content">
        <StatCards items={statItems} />

        <div className="change-requests-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder={t('admin.changeRequests.searchPlaceholder')} />
          <FilterChips options={statusChips} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <SectionHeader title={t('admin.changeRequests.sectionTitle')} count={filtered.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">{t('admin.changeRequests.colCamper')}</th>
                <th className="table-cells-header">{t('admin.changeRequests.colChanges')}</th>
                <th className="table-cells-header">{t('admin.changeRequests.colSentAt')}</th>
                <th className="table-cells-header">{t('admin.changeRequests.colStatus')}</th>
                <th className="table-cells-header">{t('admin.changeRequests.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-start text-secondary p-4">
                    {t('admin.changeRequests.noRequests')}
                  </td>
                </tr>
              ) : (
                filtered.map((request) => {
                  const statusValue = statusOf(request);
                  const status = {
                    label: STATUS_KEY[statusValue] ? t(`admin.changeRequests.${STATUS_KEY[statusValue]}`) : statusValue,
                    bg: STATUS_BG[statusValue] || 'secondary',
                  };
                  const isPending = statusValue === 'PENDING';
                  return (
                    <tr key={request.id}>
                      <td>
                        <em>{request.camperName || `#${request.camperId}`}</em>
                      </td>
                      <td className="small">{proposed(request) || <span className="text-secondary">—</span>}</td>
                      <td className="small">
                        {request.createdAt ? new Date(request.createdAt).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td>
                        <Badge bg={status.bg} text={status.bg === 'warning' ? 'dark' : undefined}>
                          {status.label}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant={isPending ? 'outline-teal-blue' : 'outline-secondary'}
                          onClick={() => setReviewTarget(request)}
                        >
                          {isPending ? t('admin.changeRequests.review') : t('admin.changeRequests.viewDetails')}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        <Loading loading={loading || processing} />
      </div>

      <ReviewModal
        show={Boolean(reviewTarget)}
        onHide={() => setReviewTarget(null)}
        request={reviewTarget}
        onApprove={handleApprove}
        onReject={handleReject}
        processing={processing}
      />
    </div>
  );
};

AdminChangeRequests.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminChangeRequests;
