import {
  calcBuyCost,
  calcSellProceeds,
} from '../entities/TradeSimulation';

/**
 * 執行買入
 */
export const executeBuy = (simulation, date, shares) => {
  const record = simulation.records.find((r) => r.date === date);
  if (!record) throw new Error(`找不到 ${date} 的股價資料`);

  if (simulation.lastTradeDate && date <= simulation.lastTradeDate) {
    throw new Error(`交易日期必須晚於上次交易日期 ${simulation.lastTradeDate}`);
  }

  const { principal, fee, total } = calcBuyCost(
    record.close,
    shares,
    simulation.feeRate,
    simulation.feeEnabled
  );

  if (total > simulation.cash) {
    throw new Error(
      `資金不足！需要 $${total.toLocaleString()}，目前現金 $${simulation.cash.toLocaleString()}`
    );
  }

  const transaction = {
    date,
    type: 'buy',
    price: record.close,
    shares,
    principal,
    fee,
    tax: 0,
    total,
  };

  return {
    ...simulation,
    cash: simulation.cash - total,
    holdings: simulation.holdings + shares,
    lastTradeDate: date,
    transactions: [...simulation.transactions, transaction],
  };
};

/**
 * 執行賣出
 */
export const executeSell = (simulation, date, shares) => {
  const record = simulation.records.find((r) => r.date === date);
  if (!record) throw new Error(`找不到 ${date} 的股價資料`);

  if (simulation.lastTradeDate && date <= simulation.lastTradeDate) {
    throw new Error(`交易日期必須晚於上次交易日期 ${simulation.lastTradeDate}`);
  }

  if (shares > simulation.holdings) {
    throw new Error(
      `持股不足！想賣 ${shares} 張，目前持有 ${simulation.holdings} 張`
    );
  }

  const { principal, fee, tax, total } = calcSellProceeds(
    record.close,
    shares,
    simulation.feeRate,
    simulation.taxRate,
    simulation.feeEnabled
  );

  // 計算已實現損益（用平均成本）
  const avgCost = calcAvgCost(simulation);
  const realizedProfit =
    total - avgCost * shares * 1000;

  const transaction = {
    date,
    type: 'sell',
    price: record.close,
    shares,
    principal,
    fee,
    tax,
    total,
    realizedProfit: Math.round(realizedProfit),
  };

  return {
    ...simulation,
    cash: simulation.cash + total,
    holdings: simulation.holdings - shares,
    lastTradeDate: date,
    realizedProfit: simulation.realizedProfit + Math.round(realizedProfit),
    transactions: [...simulation.transactions, transaction],
  };
};

/**
 * 計算平均持股成本（每股）
 */
const calcAvgCost = (simulation) => {
  const buyTxs = simulation.transactions.filter((t) => t.type === 'buy');
  const totalShares = buyTxs.reduce((sum, t) => sum + t.shares, 0);
  const totalCost = buyTxs.reduce((sum, t) => sum + t.total, 0);
  if (totalShares === 0) return 0;
  return totalCost / (totalShares * 1000);
};

/**
 * 計算目前總資產和未實現損益
 */
export const calcPortfolio = (simulation, currentPrice) => {
  const marketValue = simulation.holdings * currentPrice * 1000;
  const totalAsset = simulation.cash + marketValue;
  const unrealizedProfit = simulation.holdings > 0
    ? marketValue - calcAvgCost(simulation) * simulation.holdings * 1000
    : 0;

  return {
    cash: simulation.cash,
    holdings: simulation.holdings,
    marketValue,
    totalAsset,
    unrealizedProfit: Math.round(unrealizedProfit),
    realizedProfit: simulation.realizedProfit,
    totalProfit: Math.round(unrealizedProfit) + simulation.realizedProfit,
    returnRate: Math.round(
      ((totalAsset - simulation.initialCash) / simulation.initialCash) * 10000
    ) / 100,
  };
};