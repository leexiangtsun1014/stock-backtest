const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * 開發用代理（只在 npm start 時生效）
 * 瀏覽器請求 /yahoo/... → 由本機轉送到 Yahoo Finance，避開 CORS 限制
 */
module.exports = function (app) {
  app.use(
    '/yahoo',
    createProxyMiddleware({
      target: 'https://query1.finance.yahoo.com',
      changeOrigin: true,
      pathRewrite: { '^/yahoo': '' },
      // Yahoo 會擋沒有 User-Agent 的請求（回 429）
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
  );
};
