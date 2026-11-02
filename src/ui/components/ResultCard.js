const ResultCard = ({ result }) => {
  if (!result) return null;

  const isPositive = result.returnRate >= 0;

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '24px',
      marginTop: '24px',
      backgroundColor: '#fafafa',
    }}>
      <h2 style={{ marginBottom: '16px' }}>回測結果</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <div style={{ color: '#888', fontSize: '14px' }}>買入日期</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{result.buyDate}</div>
        </div>
        <div>
          <div style={{ color: '#888', fontSize: '14px' }}>賣出日期</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{result.sellDate}</div>
        </div>
        <div>
          <div style={{ color: '#888', fontSize: '14px' }}>買入價格</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{result.buyPrice}</div>
        </div>
        <div>
          <div style={{ color: '#888', fontSize: '14px' }}>賣出價格</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{result.sellPrice}</div>
        </div>
      </div>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: isPositive ? '#e6f4ea' : '#fce8e6',
        textAlign: 'center',
      }}>
        <div style={{ color: '#888', fontSize: '14px' }}>報酬率</div>
        <div style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: isPositive ? '#1e8e3e' : '#d93025',
        }}>
          {isPositive ? '+' : ''}{result.returnRate}%
        </div>
      </div>
    </div>
  );
};

export default ResultCard;