/**
 * 計算回測結果的指標
 * @param {number[]} navs - 每日資產淨值，依日期由舊到新
 * @returns {{ totalReturn: number, maxDrawdown: number }} 皆為小數比例（-0.2 代表 -20%），不四捨五入
 */
export const MetricsService = {
  calculate: (navs) => {
    if (navs.length === 0) {
      throw new Error('淨值序列不能是空的');
    }

    const first = navs[0];
    if (first <= 0) {
      throw new Error(`期初淨值必須大於 0：${first}`);
    }

    const totalReturn = navs[navs.length - 1] / first - 1;

    // 對每一天算「從截至當天的最高點回落多少」，取最大值
    let peak = first;
    let maxDrawdown = 0;
    for (const nav of navs) {
      if (nav > peak) peak = nav;
      const drawdown = (peak - nav) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    return { totalReturn, maxDrawdown };
  },
};
