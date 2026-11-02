import { createSimulation } from '../entities/TradeSimulation';
import { executeBuy, executeSell, calcPortfolio } from './simulateTrade';

const records = [
  { date: '2024-01-02', close: 100 },
  { date: '2024-01-03', close: 120 },
  { date: '2024-01-04', close: 150 },
  { date: '2024-01-05', close: 130 },
];

const newSimulation = () =>
  createSimulation({ initialCash: 1000000, stockNo: 'TEST', records, feeEnabled: false });

test('partial sell then rebuy uses cost of remaining holdings', () => {
  let sim = newSimulation();
  sim = executeBuy(sim, '2024-01-02', 2);   // 成本 200,000
  sim = executeSell(sim, '2024-01-03', 1);  // 賣 1 張，成本 100,000
  expect(sim.transactions[1].realizedProfit).toBe(20000);
  expect(sim.costBasis).toBe(100000);

  sim = executeBuy(sim, '2024-01-04', 1);   // 持股 2 張，成本 250,000
  expect(calcPortfolio(sim, 150).unrealizedProfit).toBe(50000);

  sim = executeSell(sim, '2024-01-05', 2);  // 所得 260,000
  expect(sim.transactions[3].realizedProfit).toBe(10000);
  expect(sim.realizedProfit).toBe(30000);
  expect(sim.costBasis).toBe(0);
});

test('realized plus unrealized profit matches change in total asset', () => {
  let sim = newSimulation();
  sim = executeBuy(sim, '2024-01-02', 3);
  sim = executeSell(sim, '2024-01-03', 1);
  sim = executeBuy(sim, '2024-01-04', 2);
  const portfolio = calcPortfolio(sim, 130);
  expect(portfolio.totalProfit).toBe(portfolio.totalAsset - sim.initialCash);
});
