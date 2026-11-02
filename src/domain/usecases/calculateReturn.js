/**
 * 計算買賣區間的報酬率
 * @param {Array} records - StockRecord 陣列
 * @param {string} buyDate - 買入日期，格式 'YYYY-MM-DD'
 * @param {string} sellDate - 賣出日期，格式 'YYYY-MM-DD'
 * @returns {{ buyPrice, sellPrice, returnRate, buyDate, sellDate }}
 */
export const calculateReturn = (records, buyDate, sellDate) => {
  const buyRecord = records.find(r => r.date === buyDate);
  const sellRecord = records.find(r => r.date === sellDate);

  if (!buyRecord) {
    throw new Error(`找不到買入日期的資料：${buyDate}`);
  }
  if (!sellRecord) {
    throw new Error(`找不到賣出日期的資料：${sellDate}`);
  }

  const returnRate = ((sellRecord.close - buyRecord.close) / buyRecord.close) * 100;

  return {
    buyDate,
    sellDate,
    buyPrice: buyRecord.close,
    sellPrice: sellRecord.close,
    returnRate: Math.round(returnRate * 100) / 100,
  };
};