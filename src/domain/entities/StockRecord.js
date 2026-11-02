/**
 * 代表一筆股票歷史記錄
 * @typedef {Object} StockRecord
 * @property {Date} date - 日期
 * @property {number} close - 收盤價
 */

export const createStockRecord = (date, close) => ({
  date,
  close,
});