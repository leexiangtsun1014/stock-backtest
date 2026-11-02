import { useState } from 'react';
import BacktestContainer from './ui/containers/BacktestContainer';
import SimulationContainer from './ui/containers/SimulationContainer';

function App() {
  const [page, setPage] = useState('backtest');

  return (
    <div>
      {/* 導覽列 */}
      <div style={{
        backgroundColor: '#1a73e8',
        padding: '12px 32px',
        display: 'flex',
        gap: '24px',
      }}>
        <button
          onClick={() => setPage('backtest')}
          style={{
            background: 'none',
            border: 'none',
            color: page === 'backtest' ? 'white' : 'rgba(255,255,255,0.6)',
            fontSize: '16px',
            fontWeight: page === 'backtest' ? 'bold' : 'normal',
            cursor: 'pointer',
            borderBottom: page === 'backtest' ? '2px solid white' : 'none',
            paddingBottom: '4px',
          }}
        >
          📈 回測系統
        </button>
        <button
          onClick={() => setPage('simulation')}
          style={{
            background: 'none',
            border: 'none',
            color: page === 'simulation' ? 'white' : 'rgba(255,255,255,0.6)',
            fontSize: '16px',
            fontWeight: page === 'simulation' ? 'bold' : 'normal',
            cursor: 'pointer',
            borderBottom: page === 'simulation' ? '2px solid white' : 'none',
            paddingBottom: '4px',
          }}
        >
          🎮 模擬交易
        </button>
      </div>

      {/* 頁面內容 */}
      {page === 'backtest' && <BacktestContainer />}
      {page === 'simulation' && <SimulationContainer />}
    </div>
  );
}

export default App;