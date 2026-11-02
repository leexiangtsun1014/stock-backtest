import { CsvParser } from '../../infrastructure/csv/CsvParser';
import { TwseAPI } from '../../infrastructure/api/TwseAPI';
import { calculateReturn } from '../../domain/usecases/calculateReturn';

/**
 * 找到最近的下一個交易日
 */
const findNearestTradeDate = (records, date) => {
  // 先找完全符合的
  const exact = records.find((r) => r.date === date);
  if (exact) return exact.date;

  // 找最近的下一個交易日
  const next = records.find((r) => r.date > date);
  if (next) return next.date;

  // 找最近的上一個交易日
  const prev = [...records].reverse().find((r) => r.date < date);
  if (prev) return prev.date;

  return null;
};

export const BacktestService = {
  runWithCsv: async (file, buyDate, sellDate) => {
    const records = await CsvParser.parse(file);
    const result = calculateReturn(records, buyDate, sellDate);
    return { result, records };
  },

  runWithApi: async (stockNo, buyDate, sellDate) => {
    const records = await TwseAPI.fetch(stockNo, buyDate, sellDate);
    const result = calculateReturn(records, buyDate, sellDate);
    return { result, records };
  },

  loadRecords: async (mode, stockNo, file, startDate, endDate, onProgress) => {
    let records;
    if (mode === 'api') {
      records = await TwseAPI.fetch(stockNo, startDate, endDate, onProgress);
    } else {
      const res = await CsvParser.parse(file);
      records = res.filter((r) => r.date >= startDate && r.date <= endDate);
    }

    if (records.length === 0) {
      throw new Error('此區間內沒有交易資料');
    }

    const actualStartDate = findNearestTradeDate(records, startDate);
    return { records, actualStartDate };
  },
};