const PortfolioPanel = ({ portfolio, initialCash }) => {
  if (!portfolio) return null;

  const formatMoney = (n) => `$${n.toLocaleString()}`;
  const formatRate = (n) => `${n >= 0 ? '+' : ''}${n}%`;
  const profitColor = (n) => (n >= 0 ? '#1e8e3e' : '#d93025');

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#fafafa',
      marginBottom: '24px',
    }}>
      <h3 style={{ marginBottom: '16px' }}>📊 即時損益</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <div style={{ color: '#888', fontSize: '13px' }}>起始資金</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {formatMoney(initialCash)}
          </div>
        </div>
        <div>
          <div style={{ color: '#888', fontSize: '13px' }}>目前現金</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {formatMoney(portfolio.cash)}
          </div>
        </div>
        <div>
          <div style={{ color: '#888', fontSize: '13px' }}>持股張數</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {portfolio.holdings} 張
          </div>
        </div>
        <div>
          <div style={{ color: '#888', fontSize: '13px' }}>持股市值</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {formatMoney(portfolio.marketValue)}
          </div>
        </div>
        <div>
          <div style={{ color: '#888', fontSize: '13px' }}>未實現損益</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: profitColor(portfolio.unrealizedProfit) }}>
            {formatMoney(portfolio.unrealizedProfit)}
          </div>
        </div>
        <div>
          <div style={{ color: '#888', fontSize: '13px' }}>已實現損益</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: profitColor(portfolio.realizedProfit) }}>
            {formatMoney(portfolio.realizedProfit)}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '16px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: portfolio.returnRate >= 0 ? '#e6f4ea' : '#fce8e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ color: '#888', fontSize: '13px' }}>總資產</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
            {formatMoney(portfolio.totalAsset)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#888', fontSize: '13px' }}>總報酬率</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: profitColor(portfolio.returnRate) }}>
            {formatRate(portfolio.returnRate)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPanel;