/**
 * 建立初始模擬狀態
 */
export const createSimulation = ({
  initialCash,
  stockNo,
  records,
  feeRate = 0.001425,
  taxRate = 0.003,
  feeEnabled = true,
}) => ({
  initialCash,
  cash: initialCash,
  stockNo,
  records,
  feeRate,
  taxRate,
  feeEnabled,
  holdings: 0,        // 目前持股張數
  lastTradeDate: null, // 最後交易日期
  transactions: [],    // 交易紀錄
  realizedProfit: 0,   // 已實現損益
});

/**
 * 計算買入成本（含手續費）
 */
export const calcBuyCost = (price, shares, feeRate, feeEnabled) => {
  const principal = price * shares * 1000;
  const fee = feeEnabled ? Math.round(principal * feeRate) : 0;
  return { principal, fee, total: principal + fee };
};

/**
 * 計算賣出所得（扣手續費和交易稅）
 */
export const calcSellProceeds = (price, shares, feeRate, taxRate, feeEnabled) => {
  const principal = price * shares * 1000;
  const fee = feeEnabled ? Math.round(principal * feeRate) : 0;
  const tax = feeEnabled ? Math.round(principal * taxRate) : 0;
  return { principal, fee, tax, total: principal - fee - tax };
};