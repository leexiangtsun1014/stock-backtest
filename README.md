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
| 股價資料 | Yahoo Finance Chart API（透過開發伺服器代理） |

## 快速開始

需要 Node.js（已在 Node.js 24 測試過）。

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
`src/infrastructure/api/TwseAPI.js` 會用 `{股票代號}.TW` 向 Yahoo Finance 取得每日收盤價。因為瀏覽器有 CORS 限制，請求會送到 `/yahoo/...`，再由 `src/setupProxy.js` 在本機轉送給 Yahoo。

> ⚠️ 這個代理只在 `npm start` 時有效。`npm run build` 產生的正式版沒有代理，線上抓取不能用；要部署的話，需要另外寫一個後端來轉送請求。

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

兩個頁面的流程不同。

**回測系統**：一次完成「抓資料 → 計算」

```
BacktestContainer（檢查輸入）
   ↓
useBacktest（loading / error / result 狀態）
   ↓
BacktestService.runWithApi / runWithCsv
   ├──→ TwseAPI / CsvParser   取得 [{ date, close }, ...]
   └──→ calculateReturn       計算報酬率
   ↓
ResultCard、PriceChart 顯示結果
```

**模擬交易**：先載入資料，之後每次買賣都在本機計算

```
SimulationContainer
   ├── 載入：BacktestService.loadRecords ──→ TwseAPI / CsvParser
   │         （取得股價，並找出最接近開始日的交易日）
   │
   └── 買賣：useSimulation ──→ simulateTrade（executeBuy / executeSell / calcPortfolio）
                              （直接呼叫 domain，不經過 BacktestService）
   ↓
PortfolioPanel、TransactionLog、PriceChart 顯示結果
```

## 計算方式

- **報酬率**：`(賣出收盤價 − 買入收盤價) / 買入收盤價 × 100%`
- **買入成本**：`股價 × 張數 × 1000 + 手續費`
- **賣出所得**：`股價 × 張數 × 1000 − 手續費 − 證交稅`
- **平均成本**：記錄目前持股的總成本（含手續費）。買入時加上這筆成本；賣出時，按平均成本扣掉賣出部分的成本；全部賣出後歸零
- **已實現損益**：`賣出所得 − 平均成本 × 賣出股數`
- **未實現損益**：`目前市值 − 目前持股的總成本`
- **手續費／稅**：四捨五入到整數元，沒有設定最低手續費
- **成交價**：一律用當日收盤價
- 模擬交易時，每次交易日期必須晚於上一次的交易日期

## 免責聲明

本專案只供學習和研究使用，計算結果不構成任何投資建議。
