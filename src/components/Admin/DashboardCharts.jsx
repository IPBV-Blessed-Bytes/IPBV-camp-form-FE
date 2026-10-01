import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import './DashboardCharts.scss';

const STATUS_STYLES = [
  { key: 'paid', color: '#16a34a' },
  { key: 'free', color: '#0ea5a4' },
  { key: 'pending', color: '#f59e0b' },
  { key: 'refunded', color: '#dc2626' },
  { key: 'canceled', color: '#9ca3af' },
];

const formatMonth = (period, months) => {
  const [year, month] = String(period).split('-');
  const index = Number(month) - 1;
  if (index < 0 || index > 11) return period;
  return `${months[index]}/${String(year).slice(2)}`;
};

const DashboardCharts = ({ metrics }) => {
  const { t } = useTranslation();
  const months = t('admin.ui.charts.months', { returnObjects: true });
  const registrationsLabel = t('admin.ui.charts.registrations');

  const seriesData = useMemo(
    () => (metrics?.series || []).map((point) => ({ month: formatMonth(point.period, months), count: Number(point.count) || 0 })),
    [metrics, months],
  );

  const statusData = useMemo(
    () =>
      STATUS_STYLES.map((status) => ({
        name: t(`admin.ui.charts.status.${status.key}`),
        value: Number(metrics?.[status.key]) || 0,
        color: status.color,
      })).filter((slice) => slice.value > 0),
    [metrics, t],
  );

  const total = Number(metrics?.total) || 0;

  if (total === 0) {
    return (
      <div className="dashboard-charts dashboard-charts--empty">
        <p>{t('admin.ui.charts.empty')}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-charts">
      <div className="dashboard-charts__card">
        <h3 className="dashboard-charts__title">{t('admin.ui.charts.byMonthTitle')}</h3>
        <div className="dashboard-charts__plot">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seriesData} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} width={36} />
              <Tooltip
                cursor={{ fill: 'rgba(0, 113, 133, 0.06)' }}
                contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13 }}
                labelStyle={{ color: '#374151' }}
                formatter={(value) => [value, registrationsLabel]}
              />
              <Bar dataKey="count" name={registrationsLabel} fill="#007185" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-charts__card">
        <h3 className="dashboard-charts__title">{t('admin.ui.charts.byStatusTitle')}</h3>
        <div className="dashboard-charts__plot">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
                {statusData.map((slice) => (
                  <Cell key={slice.name} fill={slice.color} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13 }}
                formatter={(value, name) => [value, name]}
              />
              <Legend verticalAlign="bottom" height={28} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

DashboardCharts.propTypes = {
  metrics: PropTypes.shape({
    total: PropTypes.number,
    paid: PropTypes.number,
    free: PropTypes.number,
    pending: PropTypes.number,
    refunded: PropTypes.number,
    canceled: PropTypes.number,
    series: PropTypes.arrayOf(
      PropTypes.shape({
        period: PropTypes.string,
        count: PropTypes.number,
      }),
    ),
  }),
};

export default DashboardCharts;
