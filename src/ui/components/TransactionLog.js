const TransactionLog = ({ transactions }) => {
  if (!transactions || transactions.length === 0) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3>📋 交易紀錄</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f3f4' }}>
            <th style={thStyle}>日期</th>
            <th style={thStyle}>操作</th>
            <th style={thStyle}>股價</th>
            <th style={thStyle}>張數</th>
            <th style={thStyle}>手續費</th>
            <th style={thStyle}>交易稅</th>
            <th style={thStyle}>實際金額</th>
            <th style={thStyle}>已實現損益</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tdStyle}>{tx.date}</td>
              <td style={{ ...tdStyle, color: tx.type === 'buy' ? '#1e8e3e' : '#d93025', fontWeight: 'bold' }}>
                {tx.type === 'buy' ? '買入' : '賣出'}
              </td>
              <td style={tdStyle}>{tx.price}</td>
              <td style={tdStyle}>{tx.shares} 張</td>
              <td style={tdStyle}>${tx.fee.toLocaleString()}</td>
              <td style={tdStyle}>${tx.tax.toLocaleString()}</td>
              <td style={{ ...tdStyle, color: tx.type === 'buy' ? '#d93025' : '#1e8e3e' }}>
                {tx.type === 'buy' ? '-' : '+'}${tx.total.toLocaleString()}
              </td>
              <td style={{
                ...tdStyle,
                color: tx.type === 'sell'
                  ? tx.realizedProfit >= 0 ? '#1e8e3e' : '#d93025'
                  : '#888',
              }}>
                {tx.type === 'sell'
                  ? `${tx.realizedProfit >= 0 ? '+' : ''}$${tx.realizedProfit.toLocaleString()}`
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  padding: '10px 12px',
  textAlign: 'right',
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '10px 12px',
  textAlign: 'right',
};

export default TransactionLog;