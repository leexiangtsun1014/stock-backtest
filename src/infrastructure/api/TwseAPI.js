/**
 * 透過 Yahoo Finance API 抓取台股歷史收盤價
 * 一次請求即可取得多年資料
 * 請求經由 src/setupProxy.js 的開發代理轉送（只在 npm start 時有效）
 */
export const TwseAPI = {
  fetch: async (stockNo, startDate, endDate, onProgress) => {
    const symbol = `${stockNo}.TW`;

    // 計算時間範圍（Unix timestamp）
    const start = Math.floor(new Date(startDate).getTime() / 1000);
    const end = Math.floor(new Date(endDate).getTime() / 1000);

    if (onProgress) onProgress({ current: 1, total: 1, month: '資料載入中' });

    const url = `/yahoo/v8/finance/chart/${symbol}?interval=1d&period1=${start}&period2=${end}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`無法取得股票資料，請確認股票代號是否正確`);

    const json = await res.json();

    const result = json?.chart?.result?.[0];
    if (!result) throw new Error(`找不到股票 ${stockNo} 的資料`);

    const timestamps = result.timestamp;
    const closes = result.indicators?.quote?.[0]?.close;

    if (!timestamps || !closes) throw new Error(`資料格式異常`);

    const records = timestamps
      .map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        close: closes[i] ? Math.round(closes[i] * 100) / 100 : null,
      }))
      .filter((r) => r.close !== null && r.date >= startDate && r.date <= endDate);

    if (records.length === 0) throw new Error(`此區間內沒有交易資料`);

    return records;
  },
};