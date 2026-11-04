import { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { BacktestService } from '../../application/services/BacktestService';
import PortfolioPanel from '../components/PortfolioPanel';
import TransactionLog from '../components/TransactionLog';
import PriceChart from '../components/PriceChart';

const SimulationContainer = () => {
  const [mode, setMode] = useState('api');
  const [stockNo, setStockNo] = useState('');
  const [file, setFile] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [initialCash, setInitialCash] = useState(1000000);
  const [feeEnabled, setFeeEnabled] = useState(true);
  const [feeRate, setFeeRate] = useState(0.001425);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [progress, setProgress] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [jumpDate, setJumpDate] = useState('');
  const [tradeShares, setTradeShares] = useState(1);
  const [tradeType, setTradeType] = useState('buy');

  const { simulation, getPortfolio, error, finished, init, buy, sell, finish, reset } = useSimulation();

  const handleLoad = async () => {
    if (!startDate || !endDate) return alert('請填寫日期範圍');
    if (startDate >= endDate) return alert('開始日期必須早於結束日期');
    if (mode === 'api' && !stockNo) return alert('請輸入股票代號');
    if (mode === 'csv' && !file) return alert('請上傳 CSV 檔案');

    setLoading(true);
    setLoadError(null);

    try {
      const { records, actualStartDate } = await BacktestService.loadRecords(
        mode, stockNo, file, startDate, endDate,
        (p) => setProgress(p)
      );

      const startIndex = records.findIndex((r) => r.date === actualStartDate);
      setCurrentIndex(startIndex >= 0 ? startIndex : 0);
      init(initialCash, stockNo || file.name, records, feeEnabled, feeRate);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setProgress(null);
      setLoading(false);
    }
  };

  const currentRecord = simulation ? simulation.records[currentIndex] : null;
  const currentDate = currentRecord ? currentRecord.date : null;
  const currentPrice = currentRecord ? currentRecord.close : null;

  // 即時計算當前持倉損益
  const currentPortfolio = getPortfolio(currentPrice);

  // 時間只能往後走，避免先看到未來的股價再回頭交易
  const jumpDays = (tradingDays) => {
    setCurrentIndex((i) => Math.min(simulation.records.length - 1, i + tradingDays));
  };

  const handleJumpToDate = () => {
    if (!jumpDate || !simulation) return;
    // 找最近的交易日
    let idx = simulation.records.findIndex((r) => r.date >= jumpDate);
    if (idx === -1) idx = simulation.records.length - 1;
    if (idx < currentIndex) return alert('只能往後跳，不能回到過去的日期');
    setCurrentIndex(idx);
  };

  const handleTrade = () => {
    if (!currentDate) return alert('請先選擇交易日期');
    if (tradeShares < 1) return alert('張數至少為 1');
    if (tradeType === 'buy') {
      buy(currentDate, tradeShares);
    } else {
      sell(currentDate, tradeShares);
    }
  };

  const isLast = simulation && currentIndex === simulation.records.length - 1;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ marginBottom: '32px' }}>🎮 模擬交易</h1>

      {/* 設定區 */}
      {!simulation && (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>初始設定</h3>

          <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
            {['api', 'csv'].map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: '8px 20px', borderRadius: '6px',
                border: '2px solid #1a73e8',
                backgroundColor: mode === m ? '#1a73e8' : 'white',
                color: mode === m ? 'white' : '#1a73e8',
                cursor: 'pointer', fontWeight: 'bold',
              }}>
                {m === 'api' ? '線上抓取' : '上傳 CSV'}
              </button>
            ))}
          </div>

          {mode === 'api' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>股票代號</label>
              <input type="text" placeholder="例如：0050、2330"
                value={stockNo} onChange={(e) => setStockNo(e.target.value)}
                style={{ padding: '8px', fontSize: '16px', width: '200px' }} />
            </div>
          )}

          {mode === 'csv' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>上傳 CSV</label>
              <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>開始日期</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '8px', fontSize: '16px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>結束日期</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '8px', fontSize: '16px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>起始資金（元）</label>
            <input type="number" value={initialCash}
              onChange={(e) => setInitialCash(Number(e.target.value))}
              style={{ padding: '8px', fontSize: '16px', width: '200px' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '8px' }}>
              <input type="checkbox" checked={feeEnabled} onChange={(e) => setFeeEnabled(e.target.checked)} />
              計算手續費和交易稅
            </label>
            {feeEnabled && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '24px' }}>
                <span style={{ fontSize: '14px' }}>手續費率：</span>
                <input type="number" value={feeRate} step="0.0001"
                  onChange={(e) => setFeeRate(Number(e.target.value))}
                  style={{ padding: '6px', fontSize: '14px', width: '100px' }} />
                <span style={{ fontSize: '14px', color: '#888' }}>（交易稅固定 0.3%）</span>
              </div>
            )}
          </div>

          <button onClick={handleLoad} disabled={loading} style={{
            padding: '10px 24px', fontSize: '16px',
            backgroundColor: '#1a73e8', color: 'white',
            border: 'none', borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading
              ? progress
                ? `載入中 ${progress.current} / ${progress.total} 個月...`
                : '載入中...'
              : '開始模擬'}
          </button>

          {loadError && (
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fce8e6', borderRadius: '6px', color: '#d93025' }}>
              ⚠️ {loadError}
            </div>
          )}
        </div>
      )}

      {/* 模擬進行中 */}
      {simulation && !finished && (
        <>
          {/* 即時損益（用當天價格計算） */}
          <PortfolioPanel portfolio={currentPortfolio} initialCash={simulation.initialCash} />

          {/* 日期導航 */}
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>交易日期</h3>

            <div style={{ marginBottom: '20px' }}>
              {/* 目前日期顯示 */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{currentDate}</div>
                <div style={{ fontSize: '20px', color: '#1a73e8', marginTop: '4px' }}>
                  收盤價：<strong>{currentPrice}</strong>
                </div>
                <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                  第 {currentIndex + 1} / {simulation.records.length} 個交易日
                </div>
              </div>

              {/* 導航按鈕（只能往後） */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <button onClick={() => jumpDays(1)} disabled={isLast} style={navBtnStyle(isLast)}>
                  後1個交易日 ▶
                </button>
                <button onClick={() => jumpDays(5)} disabled={isLast} style={navBtnStyle(isLast)}>
                  後5個交易日 ▶▶
                </button>
                <button onClick={() => jumpDays(22)} disabled={isLast} style={navBtnStyle(isLast)}>
                  後22個交易日 ▶▶▶
                </button>
              </div>

              {/* 指定日期跳轉 */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>前往指定日期：</span>
                <input
                  type="date"
                  value={jumpDate}
                  min={currentDate}
                  onChange={(e) => setJumpDate(e.target.value)}
                  style={{ padding: '6px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ddd' }}
                />
                <button onClick={handleJumpToDate} style={{
                  padding: '6px 14px', fontSize: '14px',
                  backgroundColor: '#1a73e8', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                }}>前往</button>
              </div>
            </div>

            {/* 買賣操作 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {['buy', 'sell'].map((t) => (
                <button key={t} onClick={() => setTradeType(t)} style={{
                  padding: '8px 20px', borderRadius: '6px',
                  border: `2px solid ${t === 'buy' ? '#1e8e3e' : '#d93025'}`,
                  backgroundColor: tradeType === t ? (t === 'buy' ? '#1e8e3e' : '#d93025') : 'white',
                  color: tradeType === t ? 'white' : (t === 'buy' ? '#1e8e3e' : '#d93025'),
                  cursor: 'pointer', fontWeight: 'bold',
                }}>
                  {t === 'buy' ? '買入' : '賣出'}
                </button>
              ))}

              <input type="number" min="1" value={tradeShares}
                onChange={(e) => setTradeShares(Number(e.target.value))}
                style={{ padding: '8px', fontSize: '16px', width: '80px', borderRadius: '6px', border: '1px solid #ddd' }} />
              <span style={{ fontSize: '14px' }}>張</span>

              {currentPrice && tradeShares > 0 && (
                <span style={{ fontSize: '14px', color: '#888' }}>
                  預估：${(currentPrice * tradeShares * 1000).toLocaleString()}
                </span>
              )}

              <button onClick={handleTrade} style={{
                padding: '8px 20px', fontSize: '15px',
                backgroundColor: tradeType === 'buy' ? '#1e8e3e' : '#d93025',
                color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
              }}>
                確認{tradeType === 'buy' ? '買入' : '賣出'}
              </button>
            </div>

            {error && (
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fce8e6', borderRadius: '6px', color: '#d93025' }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={finish} style={{
              marginTop: '16px', padding: '8px 20px', fontSize: '14px',
              backgroundColor: '#666', color: 'white',
              border: 'none', borderRadius: '6px', cursor: 'pointer',
            }}>結束模擬</button>
          </div>

          <TransactionLog transactions={simulation.transactions} />
          {/* 只畫到今天，不洩漏未來走勢 */}
          <PriceChart records={simulation.records.slice(0, currentIndex + 1)} buyDate={startDate} sellDate={endDate} />
        </>
      )}

      {/* 模擬結束 */}
      {finished && simulation && (
        <>
          <div style={{
            padding: '20px', borderRadius: '8px', marginBottom: '24px',
            backgroundColor: currentPortfolio?.returnRate >= 0 ? '#e6f4ea' : '#fce8e6',
            textAlign: 'center',
          }}>
            <h2>模擬結束！</h2>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: currentPortfolio?.returnRate >= 0 ? '#1e8e3e' : '#d93025' }}>
              {currentPortfolio?.returnRate >= 0 ? '+' : ''}{currentPortfolio?.returnRate}%
            </div>
            <div style={{ fontSize: '18px', marginTop: '8px' }}>
              起始資金 ${simulation.initialCash.toLocaleString()} → 最終資產 ${currentPortfolio?.totalAsset.toLocaleString()}
            </div>
          </div>

          <PortfolioPanel portfolio={currentPortfolio} initialCash={simulation.initialCash} />
          <TransactionLog transactions={simulation.transactions} />
          <PriceChart records={simulation.records} buyDate={startDate} sellDate={endDate} />

          <button onClick={reset} style={{
            marginTop: '24px', padding: '10px 24px', fontSize: '16px',
            backgroundColor: '#1a73e8', color: 'white',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
          }}>重新開始</button>
        </>
      )}
    </div>
  );
};

const navBtnStyle = (disabled) => ({
  padding: '8px 16px',
  fontSize: '14px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  backgroundColor: disabled ? '#f5f5f5' : 'white',
  color: disabled ? '#aaa' : '#333',
  cursor: disabled ? 'not-allowed' : 'pointer',
});

export default SimulationContainer;