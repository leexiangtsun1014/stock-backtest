import { useState } from 'react';
import { BacktestService } from '../../application/services/BacktestService';

export const useBacktest = () => {
  const [records, setRecords] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const runWithCsv = async (file, buyDate, sellDate) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { result, records } = await BacktestService.runWithCsv(file, buyDate, sellDate);
      setResult(result);
      setRecords(records);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runWithApi = async (stockNo, buyDate, sellDate) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { result, records } = await BacktestService.runWithApi(stockNo, buyDate, sellDate);
      setResult(result);
      setRecords(records);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { runWithCsv, runWithApi, result, records, error, loading };
};