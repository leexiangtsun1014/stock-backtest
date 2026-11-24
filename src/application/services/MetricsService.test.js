import { MetricsService } from './MetricsService';

// 規格：小數比對以誤差 0.0001 內視為相等
const TOLERANCE = 0.0001;
const expectClose = (actual, expected) => {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(TOLERANCE);
};

describe('驗收條件', () => {
  test('[100, 120, 90, 110, 80]', () => {
    const { totalReturn, maxDrawdown } = MetricsService.calculate([100, 120, 90, 110, 80]);
    expectClose(totalReturn, -0.2);
    expectClose(maxDrawdown, 0.3333);
  });

  test('[100, 110, 120]', () => {
    const { totalReturn, maxDrawdown } = MetricsService.calculate([100, 110, 120]);
    expectClose(totalReturn, 0.2);
    expect(maxDrawdown).toBe(0);
  });

  test('[] 拋出錯誤', () => {
    expect(() => MetricsService.calculate([])).toThrow();
  });
});

describe('邊界情況', () => {
  test('只有一筆：兩者皆為 0', () => {
    expect(MetricsService.calculate([100])).toEqual({ totalReturn: 0, maxDrawdown: 0 });
  });

  test('期初淨值為 0：拋出錯誤', () => {
    expect(() => MetricsService.calculate([0, 100])).toThrow();
  });

  test('期初淨值為負數：拋出錯誤', () => {
    expect(() => MetricsService.calculate([-5, 100])).toThrow();
  });

  test('持續上漲：maxDrawdown 為 0', () => {
    expect(MetricsService.calculate([100, 101, 105, 130]).maxDrawdown).toBe(0);
  });

  test('最大回撤取自最高點，而不是期初', () => {
    // 期初 100 → 高點 200 → 低點 150：回撤是 (200 - 150) / 200 = 0.25，不是 0
    expectClose(MetricsService.calculate([100, 200, 150]).maxDrawdown, 0.25);
  });

  test('中途出現 0 照公式計算，不拋錯', () => {
    expect(MetricsService.calculate([100, 0]).maxDrawdown).toBe(1);
  });
});
