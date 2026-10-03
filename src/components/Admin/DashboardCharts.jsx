import { useMemo } from 'react';
import PropTypes from 'prop-types';
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

const PAYMENT_COLORS = {
  creditCard: '#204691',
  pix: '#16a34a',
  ticket: '#f59e0b',
  outros: '#9ca3af',
};

const DashboardCharts = ({ monthly, paymentComposition }) => {
  const seriesData = useMemo(
    () => (monthly || []).map((point) => ({ label: point.label || point.month, count: Number(point.count) || 0 })),
    [monthly],
  );

  const paymentData = useMemo(
    () =>
      (paymentComposition || [])
        .map((slice) => ({
          name: slice.label,
          value: Number(slice.count) || 0,
          color: PAYMENT_COLORS[slice.key] || '#607d8b',
        }))
        .filter((slice) => slice.value > 0),
    [paymentComposition],
  );

  const hasData = seriesData.length > 0 || paymentData.length > 0;

  if (!hasData) {
    return (
      <div className="dashboard-charts dashboard-charts--empty">
        <p>Sem dados suficientes para exibir os gráficos.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-charts">
      <div className="dashboard-charts__card">
        <h3 className="dashboard-charts__title">Inscrições por mês</h3>
        <div className="dashboard-charts__plot">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seriesData} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} width={36} />
              <Tooltip
                cursor={{ fill: 'rgba(32, 70, 145, 0.06)' }}
                contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13 }}
                labelStyle={{ color: '#374151' }}
                formatter={(value) => [value, 'Inscrições']}
              />
              <Bar dataKey="count" name="Inscrições" fill="#204691" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-charts__card">
        <h3 className="dashboard-charts__title">Forma de pagamento</h3>
        <div className="dashboard-charts__plot">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={paymentData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
                {paymentData.map((slice) => (
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
  monthly: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string,
      label: PropTypes.string,
      count: PropTypes.number,
    }),
  ),
  paymentComposition: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      count: PropTypes.number,
    }),
  ),
};

export default DashboardCharts;
