# 📈 台股回測系統 (stock-backtest)

一個用 React 做的台股回測與模擬交易工具。可以線上抓歷史股價（Yahoo Finance），也可以上傳證交所下載的 CSV。它會算出指定買賣日期之間的報酬率，也能逐日模擬買賣、即時算出損益。

## 功能

### 回測系統
- 輸入股票代號（例如 `0050`、`2330`），或上傳 CSV
- 選擇買入和賣出日期，算出區間報酬率
- 用折線圖顯示價格走勢，並標出買入／賣出點

### 模擬交易
- 設定股票、日期區間和起始資金
- 逐日前進／後退（1、5、22 個交易日），或跳到指定日期
- 以「張」（1 張 = 1000 股）為單位買入、賣出
- 可選擇是否計算手續費（預設 0.1425%，可調整）和證交稅（賣出時 0.3%）
- 即時顯示現金、持股、市值、未實現／已實現損益和總報酬率
- 完整的交易紀錄表

## 技術棧

| 項目 | 使用 |
| --- | --- |
| 框架 | React 19（Create React App / `react-scripts` 5） |
| 圖表 | [Recharts](https://recharts.org/) |
| CSV 解析 | [PapaParse](https://www.papaparse.com/)（Big5 編碼） |
| 股價資料 | Yahoo Finance Chart API（透過 `corsproxy.io` 代理） |

## 快速開始

需要 Node.js 18 以上。

```bash
npm install
npm start
```

用瀏覽器開啟 <http://localhost:3000>。

其他指令：

```bash
npm test         # 執行測試（watch 模式）
npm run build    # 產生正式版到 build/
```

## 資料來源

### 線上抓取
`src/infrastructure/api/TwseAPI.js` 會用 `{股票代號}.TW` 向 Yahoo Finance 取得每日收盤價。因為瀏覽器有 CORS 限制，請求會經過公開代理 `corsproxy.io`。代理如果失效，線上抓取就不能用，可以改用 CSV。

> 目前只支援上市股票（`.TW`）。上櫃股票要用 `.TWO` 後綴，還沒有支援。

### 上傳 CSV
支援台灣證券交易所「個股日成交資訊」下載的 CSV：
- 編碼：Big5
- 需要有「日期」和「收盤價」欄位
- 日期是民國年格式（例如 `113/01/02`），會自動轉成 `2024-01-02`

## 專案架構

採用分層（Clean Architecture 風格）設計，依賴方向由外往內：`ui → application → domain`，由 `infrastructure` 負責向外取資料。

```
src/
├── App.js                         # 頂部導覽列，切換「回測」和「模擬交易」頁
├── index.js                       # React 進入點
│
├── domain/                        # 核心商業邏輯（純函式，不依賴 React 或外部服務）
│   ├── entities/
│   │   ├── StockRecord.js         # 股價資料結構 { date, close }
│   │   └── TradeSimulation.js     # 模擬狀態、買入成本和賣出所得計算
│   └── usecases/
│       ├── calculateReturn.js     # 計算兩個日期之間的報酬率
│       └── simulateTrade.js       # 執行買入／賣出，計算持倉和損益
│
├── application/
│   └── services/
│       └── BacktestService.js     # 串接資料來源和 domain 邏輯
│
├── infrastructure/                # 向外存取資料
│   ├── api/TwseAPI.js             # 從 Yahoo Finance 抓歷史股價
│   └── csv/CsvParser.js           # 解析證交所 CSV
│
└── ui/
    ├── hooks/
    │   ├── useBacktest.js         # 回測頁的狀態管理
    │   └── useSimulation.js       # 模擬交易頁的狀態管理
    ├── containers/                # 頁面層級元件（表單、流程控制）
    │   ├── BacktestContainer.js
    │   └── SimulationContainer.js
    └── components/                # 純顯示元件
        ├── ResultCard.js          # 回測結果卡片
        ├── PriceChart.js          # 價格走勢圖
        ├── PortfolioPanel.js      # 即時損益面板
        └── TransactionLog.js      # 交易紀錄表
```

### 資料流程

```
使用者輸入
   ↓
Container（BacktestContainer / SimulationContainer）
   ↓
Hook（useBacktest / useSimulation）
   ↓
BacktestService ──→ TwseAPI / CsvParser   取得 [{ date, close }, ...]
   ↓
domain usecases（calculateReturn / simulateTrade）
   ↓
回傳結果 → 由 components 顯示
```

## 計算方式

- **報酬率**：`(賣出收盤價 − 買入收盤價) / 買入收盤價 × 100%`
- **買入成本**：`股價 × 張數 × 1000 + 手續費`
- **賣出所得**：`股價 × 張數 × 1000 − 手續費 − 證交稅`
- **手續費／稅**：四捨五入到整數元，沒有設定最低手續費
- **成交價**：一律用當日收盤價
- 模擬交易時，每次交易日期必須晚於上一次的交易日期

## 免責聲明

本專案只供學習和研究使用，計算結果不構成任何投資建議。
