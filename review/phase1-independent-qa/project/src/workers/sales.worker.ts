import { parseSalesFile } from '../core/parser';
import { runFullAnalysisAsync } from '../core/analyzer';
import type { ColumnMappingConfig, ParseResult } from '../core/types';

type Request = { type: 'parse'; file: File } | { type: 'analyze'; rows: ParseResult['allRows']; mapping: ColumnMappingConfig };
const scope = self as unknown as { onmessage: ((event: MessageEvent<Request>) => void) | null; postMessage: (data: unknown) => void };
scope.onmessage = async ({ data }) => {
  try {
    if (data.type === 'parse') {
      scope.postMessage({ type: 'progress', progress: { percent: 10, label: 'Đang đọc dữ liệu...' } });
      const result = await parseSalesFile(data.file);
      scope.postMessage({ type: 'result', result });
    } else {
      const result = await runFullAnalysisAsync(data.rows, data.mapping, (percent, label) => scope.postMessage({ type: 'progress', progress: { percent, label, rows: data.rows.length } }));
      scope.postMessage({ type: 'result', result });
    }
  } catch (error) {
    scope.postMessage({ type: 'error', message: error instanceof Error ? error.message : 'Không thể xử lý dữ liệu.' });
  }
};
