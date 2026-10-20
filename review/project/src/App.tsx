import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AlertCircle, BarChart3, CalendarDays, CheckCircle2, FileSpreadsheet, Info, Package, ShieldCheck, Users } from 'lucide-react';
import { Header } from './components/common/Header';
import { FileUploadZone } from './components/upload/FileUploadZone';
import { ColumnMapper } from './components/upload/ColumnMapper';
import { CleaningReportModal } from './components/upload/CleaningReportModal';
import { ThemeCustomizer } from './components/common/ThemeCustomizer';
import { AnalysisLoader } from './components/common/AnalysisLoader';
import { useSalesWorker } from './hooks/useSalesWorker';
import { useTheme } from './theme/useTheme';
import type { ColumnMappingConfig, FullAnalysisData, ParseResult } from './core/types';

type Step = 'upload' | 'mapping' | 'dashboard';
type Tab = 'overview' | 'products' | 'customers';
const TABS = [{ id: 'overview', label: 'Tổng quan', Icon: BarChart3 }, { id: 'products', label: 'Sản phẩm', Icon: Package }, { id: 'customers', label: 'Khách hàng', Icon: Users }] as const;
const OverviewTab = lazy(() => import('./components/dashboard/OverviewTab').then(module => ({ default: module.OverviewTab })));
const ProductTab = lazy(() => import('./components/dashboard/ProductTab').then(module => ({ default: module.ProductTab })));
const CustomerTab = lazy(() => import('./components/dashboard/CustomerTab').then(module => ({ default: module.CustomerTab })));

export default function App() {
  const [step, setStep] = useState<Step>('upload');
  const [tab, setTab] = useState<Tab>('overview');
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [analysis, setAnalysis] = useState<FullAnalysisData | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [error, setError] = useState('');
  const [sampleLoading, setSampleLoading] = useState(false);
  const worker = useSalesWorker();
  const { reducedMotion, colors } = useTheme();
  const fetchRef = useRef<AbortController | null>(null);
  const confettiRef = useRef<{ reset: () => void } | null>(null);
  const busy = !!worker.progress || sampleLoading;
  useEffect(() => () => fetchRef.current?.abort(), []);
  function handleError(value: unknown) { if (value instanceof Error && value.name !== 'AbortError') setError(value.message); }
  async function upload(file: File) {
    setError('');
    try { const result = await worker.parse(file); setParsed(result); setStep('mapping'); }
    catch (value) { handleError(value); }
  }
  async function loadSample() {
    if (busy) return;
    setError(''); setSampleLoading(true);
    const controller = new AbortController(); fetchRef.current = controller;
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}sample-data/du_lieu_ban_hang_mau.csv`, { signal: controller.signal });
      if (!response.ok) throw new Error('Không thể tải dữ liệu mẫu. Vui lòng thử lại.');
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      setSampleLoading(false);
      await upload(new File([blob], 'du_lieu_ban_hang_mau.csv', { type: 'text/csv' }));
    } catch (value) { handleError(value); }
    finally { if (fetchRef.current === controller) { fetchRef.current = null; setSampleLoading(false); } }
  }
  async function analyze(mapping: ColumnMappingConfig) {
    if (!parsed || busy) return;
    setError('');
    try {
      const result = await worker.analyze(parsed.allRows, mapping);
      setAnalysis(result); setTab('overview'); setStep('dashboard');
      // Read current motion preference, including changes made while analysis ran.
      if (document.documentElement.dataset.motion !== 'reduced' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const { default: confetti } = await import('canvas-confetti');
        confettiRef.current = confetti;
        if (document.documentElement.dataset.motion !== 'reduced') void confetti({ particleCount: 85, spread: 65, origin: { y: .7 }, colors: [...colors.slice(0, 4)], disableForReducedMotion: true, ticks: 160, gravity: 1.1 });
      }
    } catch (value) { handleError(value); }
  }
  function cancel() { fetchRef.current?.abort(); worker.cancel(); setSampleLoading(false); }
  function reset() { cancel(); confettiRef.current?.reset(); setParsed(null); setAnalysis(null); setError(''); setReportOpen(false); setStep('upload'); }
  useEffect(() => { if (reducedMotion) confettiRef.current?.reset(); }, [reducedMotion]);
  useEffect(() => () => confettiRef.current?.reset(), []);
  function tabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') next = (index + TABS.length - 1) % TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = TABS.length - 1;
    else return;
    event.preventDefault(); setTab(TABS[next].id); document.getElementById(`tab-${TABS[next].id}`)?.focus();
  }
  return <>
    <Header hasData={step !== 'upload'} onReset={reset} onLoadSample={loadSample} disabled={busy} />
    <div className="privacy-banner"><span className="privacy-pulse" /><ShieldCheck size={15} /><span>Dữ liệu được xử lý 100% trên thiết bị của bạn, bảo mật tuyệt đối và <strong>KHÔNG</strong> gửi lên bất kỳ máy chủ nào.</span></div>
    <main className="container">
      {error && <div className="error-notice" role="alert"><AlertCircle size={20} /><span>{error}</span><button type="button" className="ml-auto" onClick={() => setError('')} aria-label="Đóng thông báo lỗi">×</button></div>}
      {busy ? <AnalysisLoader progress={worker.progress || { percent: 5, label: 'Đang tải dữ liệu mẫu...' }} onCancel={cancel} /> : <div className="motion-page" key={step}>
        {step === 'upload' && <FileUploadZone onFile={upload} onLoadSample={loadSample} />}
        {step === 'mapping' && parsed && <ColumnMapper parseResult={parsed} onConfirmMapping={analyze} onCancel={reset} />}
        {step === 'dashboard' && analysis && <>
          <div className="page-heading"><div><p className="eyebrow">KHÔNG GIAN KINH DOANH</p><h1>Mỗi con số, một cơ hội.</h1><p>Hiểu cửa hàng hôm nay. Quyết định tự tin hơn ngày mai.</p></div><div className="heading-date"><CalendarDays size={16} />{analysis.overview.dateRange.start} — {analysis.overview.dateRange.end}</div></div>
          <div className="file-summary"><div className="file-summary-left"><FileSpreadsheet size={16} /><span>{parsed?.fileName}</span><span className="badge badge-a"><CheckCircle2 size={12} />{analysis.cleaningReport.validRows.toLocaleString('vi-VN')} dòng hợp lệ</span>{analysis.cleaningReport.droppedTotal > 0 && <span className="badge badge-c">{analysis.cleaningReport.droppedTotal} dòng bị loại</span>}</div><button type="button" className="btn btn-outline btn-sm" onClick={() => setReportOpen(true)}><Info size={14} />Báo cáo làm sạch</button></div>
          <div className="tabs-container" role="tablist" aria-label="Phân tích bán hàng">{TABS.map(({ id, label, Icon }, index) => <button key={id} type="button" id={`tab-${id}`} role="tab" aria-selected={tab === id} aria-controls={`panel-${id}`} tabIndex={tab === id ? 0 : -1} className={`tab-btn ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)} onKeyDown={event => tabKeyDown(event, index)}><Icon size={17} />{label}{id === 'products' && <span className="tab-count">{analysis.productAnalysis.products.length}</span>}{id === 'customers' && <span className="tab-count">{analysis.customerAnalysis.totalCustomers}</span>}</button>)}</div>
          <div key={tab} className="motion-page" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0}>
            <Suspense fallback={<div className="grid grid-cols-2 gap-4" role="status" aria-label="Đang mở trang phân tích"><div className="skeleton" /><div className="skeleton" /></div>}>
              {tab === 'overview' && <OverviewTab data={analysis} />}{tab === 'products' && <ProductTab data={analysis} />}{tab === 'customers' && <CustomerTab data={analysis} />}
            </Suspense>
          </div>
          {reportOpen && <CleaningReportModal report={analysis.cleaningReport} onClose={() => setReportOpen(false)} />}
        </>}
      </div>}
      <footer className="footer-note">Bán Hàng Smarter · Những quyết định tốt bắt đầu từ dữ liệu rõ ràng.</footer>
    </main>
    <ThemeCustomizer />
  </>;
}
