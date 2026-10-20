import { ArrowUpRight, FileSpreadsheet, Store } from 'lucide-react';

export function Header({ 
  onReset, 
  onLoadSample, 
  hasData, 
  disabled 
}: { 
  onReset: () => void; 
  onLoadSample: () => void; 
  hasData: boolean; 
  disabled: boolean;
}) {
  return (
    <header className="app-header">
      <button 
        type="button" 
        className="brand-wrapper" 
        onClick={onReset}
        title="Bấm để quay về trang chính"
        aria-label="Bấm vào logo để quay về trang chính"
      >
        <div className="brand-logo">
          <Store size={24} strokeWidth={1.8} />
        </div>
        <div>
          <p className="brand-title">Bán Hàng <span>Smarter.</span></p>
          <p className="brand-subtitle">Dữ liệu nhỏ. Góc nhìn lớn.</p>
        </div>
      </button>

      <div className="flex items-center gap-5">
        <span className="header-status">
          <span className="status-dot" />Không gian riêng của bạn
        </span>
        <button 
          type="button" 
          className="btn btn-outline btn-sm" 
          disabled={disabled} 
          onClick={hasData ? onReset : onLoadSample}
        >
          {hasData ? <ArrowUpRight size={16} /> : <FileSpreadsheet size={16} />}
          {hasData ? 'Phân tích file mới' : 'Khám phá dữ liệu mẫu'}
        </button>
      </div>
    </header>
  );
}
