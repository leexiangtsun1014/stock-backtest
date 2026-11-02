import { useState } from 'react';
import { useBacktest } from '../hooks/useBacktest';
import ResultCard from '../components/ResultCard';
import PriceChart from '../components/PriceChart';

const BacktestContainer = () => {
  const [mode, setMode] = useState('api'); // 'api' or 'csv'
  const [stockNo, setStockNo] = useState('');
  const [file, setFile] = useState(null);
  const [buyDate, setBuyDate] = useState('');
  const [sellDate, setSellDate] = useState('');
  const { runWithCsv, runWithApi, result, records, error, loading } = useBacktest();

  const handleSubmit = () => {
    if (!buyDate || !sellDate) {
      alert('請填寫買入和賣出日期');
      return;
    }
    if (buyDate >= sellDate) {
      alert('買入日期必須早於賣出日期');
      return;
    }
    if (mode === 'api') {
      if (!stockNo) {
        alert('請輸入股票代號');
        return;
      }
      runWithApi(stockNo, buyDate, sellDate);
    } else {
      if (!file) {
        alert('請上傳 CSV 檔案');
        return;
      }
      runWithCsv(file, buyDate, sellDate);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ marginBottom: '32px' }}>📈 台股回測系統</h1>

      {/* 模式切換 */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setMode('api')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: '2px solid #1a73e8',
            backgroundColor: mode === 'api' ? '#1a73e8' : 'white',
            color: mode === 'api' ? 'white' : '#1a73e8',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          線上抓取
        </button>
        <button
          onClick={() => setMode('csv')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: '2px solid #1a73e8',
            backgroundColor: mode === 'csv' ? '#1a73e8' : 'white',
            color: mode === 'csv' ? 'white' : '#1a73e8',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          上傳 CSV
        </button>
      </div>

      {/* 線上抓取模式 */}
      {mode === 'api' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            股票代號
          </label>
          <input
            type="text"
            placeholder="例如：0050、2330"
            value={stockNo}
            onChange={(e) => setStockNo(e.target.value)}
            style={{ padding: '8px', fontSize: '16px', width: '200px' }}
          />
        </div>
      )}

      {/* CSV 上傳模式 */}
      {mode === 'csv' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            上傳 CSV 檔案
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
      )}

      {/* 買入日期 */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          買入日期
        </label>
        <input
          type="date"
          value={buyDate}
          onChange={(e) => setBuyDate(e.target.value)}
          style={{ padding: '8px', fontSize: '16px' }}
        />
      </div>

      {/* 賣出日期 */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          賣出日期
        </label>
        <input
          type="date"
          value={sellDate}
          onChange={(e) => setSellDate(e.target.value)}
          style={{ padding: '8px', fontSize: '16px' }}
        />
      </div>

      {/* 執行按鈕 */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: '10px 24px',
          fontSize: '16px',
          backgroundColor: '#1a73e8',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '資料抓取中...' : '開始回測'}
      </button>

      {/* 錯誤訊息 */}
      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fce8e6',
          borderRadius: '6px',
          color: '#d93025',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* 結果 */}
      <ResultCard result={result} />
      <PriceChart records={records} buyDate={buyDate} sellDate={sellDate} />
    </div>
  );
};

export default BacktestContainer;