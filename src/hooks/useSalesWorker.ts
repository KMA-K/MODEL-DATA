import { useEffect, useRef, useState } from 'react';
import type { AnalysisProgress } from '../components/common/AnalysisLoader';
import type { ColumnMappingConfig, FullAnalysisData, ParseResult } from '../core/types';

export function useSalesWorker() {
  const workerRef = useRef<Worker | null>(null);
  const rejectRef = useRef<((reason: Error) => void) | null>(null);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  function cancel() {
    workerRef.current?.terminate();
    workerRef.current = null;
    rejectRef.current?.(new DOMException('Đã hủy xử lý.', 'AbortError'));
    rejectRef.current = null;
    setProgress(null);
  }
  useEffect(() => () => { workerRef.current?.terminate(); rejectRef.current?.(new DOMException('Đã hủy xử lý.', 'AbortError')); }, []);
  function run<T>(request: unknown, initial: AnalysisProgress): Promise<T> {
    cancel();
    setProgress(initial);
    return new Promise((resolve, reject) => {
      rejectRef.current = reject;
      let worker: Worker;
      try { worker = new Worker(new URL('../workers/sales.worker.ts', import.meta.url), { type: 'module' }); }
      catch (error) { setProgress(null); rejectRef.current = null; reject(error); return; }
      workerRef.current = worker;
      function finish() { worker.terminate(); workerRef.current = null; rejectRef.current = null; setProgress(null); }
      worker.onmessage = ({ data }) => {
        if (data.type === 'progress') setProgress(data.progress);
        else if (data.type === 'result') { finish(); resolve(data.result as T); }
        else if (data.type === 'error') { finish(); reject(new Error(data.message)); }
      };
      worker.onerror = () => { finish(); reject(new Error('Không thể khởi động bộ xử lý dữ liệu. Vui lòng tải lại trang.')); };
      worker.postMessage(request);
    });
  }
  return {
    progress, cancel,
    parse: (file: File) => run<ParseResult>({ type: 'parse', file }, { percent: 5, label: 'Đang đọc dữ liệu...' }),
    analyze: (rows: ParseResult['allRows'], mapping: ColumnMappingConfig) => run<FullAnalysisData>({ type: 'analyze', rows, mapping }, { percent: 5, label: 'Đang chuẩn bị phân tích...', rows: rows.length }),
  };
}
