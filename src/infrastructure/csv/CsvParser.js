import Papa from 'papaparse';

export const CsvParser = {
  parse: (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        encoding: 'Big5',
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const rows = results.data;

            // 找到包含「日期」的那一行作為 header
            const headerRowIndex = rows.findIndex(row =>
              row.some(cell => cell.includes('日期'))
            );

            if (headerRowIndex === -1) {
              throw new Error('找不到日期欄位，請確認 CSV 格式');
            }

            const headers = rows[headerRowIndex];
            const dateIndex = headers.findIndex(h => h.includes('日期'));
            const closeIndex = headers.findIndex(h => h.includes('收盤'));

            // 取資料列（header 之後的行）
            const dataRows = rows.slice(headerRowIndex + 1);

            const records = dataRows
              .filter(row => row[dateIndex] && row[closeIndex] && row[dateIndex].match(/^\d{2,3}\/\d{2}\/\d{2}$/))
              .map(row => {
                const date = convertRocToStandardDate(row[dateIndex].trim());
                const close = parseFloat(row[closeIndex].toString().replace(/,/g, ''));
                return { date, close };
              });

            if (records.length === 0) {
              throw new Error('沒有找到有效的股票資料');
            }

            resolve(records);
          } catch (err) {
            reject(err);
          }
        },
        error: (err) => reject(err),
      });
    });
  },
};

const convertRocToStandardDate = (raw) => {
  const match = raw.match(/^(\d{2,3})\/(\d{2})\/(\d{2})$/);
  if (match) {
    const year = parseInt(match[1]) + 1911;
    return `${year}-${match[2]}-${match[3]}`;
  }
  throw new Error(`無法解析日期格式：${raw}`);
};