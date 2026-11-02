import { useState } from 'react';
import { createSimulation } from '../../domain/entities/TradeSimulation';
import { executeBuy, executeSell, calcPortfolio } from '../../domain/usecases/simulateTrade';

export const useSimulation = () => {
  const [simulation, setSimulation] = useState(null);
  const [error, setError] = useState(null);
  const [finished, setFinished] = useState(false);

  const init = (initialCash, stockNo, records, feeEnabled, feeRate) => {
    setError(null);
    setFinished(false);
    setSimulation(
      createSimulation({ initialCash, stockNo, records, feeEnabled, feeRate })
    );
  };

  const buy = (date, shares) => {
    setError(null);
    try {
      const next = executeBuy(simulation, date, shares);
      setSimulation(next);
    } catch (err) {
      setError(err.message);
    }
  };

  const sell = (date, shares) => {
    setError(null);
    try {
      const next = executeSell(simulation, date, shares);
      setSimulation(next);
    } catch (err) {
      setError(err.message);
    }
  };

  const finish = () => setFinished(true);

  const reset = () => {
    setSimulation(null);
    setError(null);
    setFinished(false);
  };

  const getPortfolio = (price) => {
    if (!simulation || price == null) return null;
    return calcPortfolio(simulation, price);
  };

  return {
    simulation,
    getPortfolio,
    error,
    finished,
    init,
    buy,
    sell,
    finish,
    reset,
  };
};