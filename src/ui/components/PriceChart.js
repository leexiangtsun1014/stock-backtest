import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

const PriceChart = ({ records, buyDate, sellDate }) => {
  if (!records || records.length === 0) return null;

  // 只顯示買入到賣出區間的資料
  const filteredRecords = records.filter(
    (r) => r.date >= buyDate && r.date <= sellDate
  );

  return (
    <div style={{ marginTop: '24px' }}>
      <h2>價格走勢</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredRecords}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
          <Tooltip />
          <ReferenceLine x={buyDate} stroke="green" label="買入" />
          <ReferenceLine x={sellDate} stroke="red" label="賣出" />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#1a73e8"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;