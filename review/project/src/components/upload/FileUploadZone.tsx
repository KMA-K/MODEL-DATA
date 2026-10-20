import { useRef, useState } from 'react';
import { ArrowRight, ChartNoAxesCombined, FileSpreadsheet, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';
import { Reveal, StoreIllustration } from '../common/Visuals';

export function FileUploadZone({ onFile, onLoadSample }: { onFile: (file: File) => void; onLoadSample: () => void }) {
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  return <>
    <div className="welcome-grid">
      <Reveal className="welcome-copy"><p className="eyebrow">TRỢ LÝ DỮ LIỆU CHO CỬA HÀNG</p><h1>Bán hàng mỗi ngày.<br /><span>Thấu hiểu từng con số.</span></h1><p>Biến file bán hàng thành góc nhìn rõ ràng về doanh thu, sản phẩm và khách hàng. Không cần giỏi Excel để tìm ra cơ hội tiếp theo.</p><div className="welcome-art"><StoreIllustration /><p>Một bức tranh kinh doanh.<br />Nhiều quyết định sáng suốt.</p></div></Reveal>
      <Reveal index={2}>
        <div className={`dropzone ${dragging ? 'active' : ''}`} onDragEnter={event => { event.preventDefault(); dragDepth.current++; setDragging(true); }} onDragOver={event => event.preventDefault()} onDragLeave={event => { event.preventDefault(); dragDepth.current--; if (dragDepth.current <= 0) setDragging(false); }} onDrop={event => { event.preventDefault(); dragDepth.current = 0; setDragging(false); if (event.dataTransfer.files[0]) onFile(event.dataTransfer.files[0]); }}>
          <input ref={input} type="file" accept=".csv,.xlsx,.xls" hidden aria-hidden="true" tabIndex={-1} aria-label="Chọn file bán hàng" onChange={event => { if (event.target.files?.[0]) onFile(event.target.files[0]); event.target.value = ''; }} />
          <div className="dropzone-icon"><UploadCloud size={33} strokeWidth={1.5} /></div><h2>{dragging ? 'Thả file để bắt đầu khám phá' : 'Đưa dữ liệu của bạn vào đây'}</h2><p>Kéo thả file bán hàng hoặc chọn từ thiết bị.</p><button type="button" className="btn btn-primary" onClick={() => input.current?.click()}>Chọn file bán hàng<ArrowRight size={16} /></button><small>CSV, XLSX, XLS · Số dòng xử lý tùy bộ nhớ thiết bị</small><div className="flex items-center gap-2 muted"><ShieldCheck size={14} /><small>File của bạn luôn ở trên thiết bị của bạn.</small></div>
        </div>
        <div className="sample-card"><div className="flex items-center gap-3"><span className="icon-tile"><Sparkles size={19} /></span><div><strong>Chưa có file? Cứ thử trước.</strong><p>Dữ liệu mẫu với 5.030 dòng và 50 mặt hàng.</p></div></div><button type="button" className="btn btn-outline btn-sm" onClick={onLoadSample}>Khám phá<ArrowRight size={14} /></button></div>
        <div className="flex justify-center gap-5 mt-4 muted"><a href={`${import.meta.env.BASE_URL}sample-data/du_lieu_ban_hang_mau.csv`} download className="text-xs flex items-center gap-1"><FileSpreadsheet size={13} />Tải CSV mẫu</a><a href={`${import.meta.env.BASE_URL}sample-data/du_lieu_ban_hang_mau.xlsx`} download className="text-xs">Tải Excel mẫu</a></div>
      </Reveal>
    </div>
    <div className="feature-strip">{[{ Icon: ChartNoAxesCombined, title: 'Nhìn rõ bức tranh kinh doanh', text: 'Doanh thu, lợi nhuận và xu hướng được trình bày dễ hiểu.' }, { Icon: Sparkles, title: 'Từ con số đến hành động', text: 'Tìm mặt hàng chủ lực và nhóm khách cần chăm sóc.' }, { Icon: ShieldCheck, title: 'Riêng tư ngay từ đầu', text: 'Phân tích tại thiết bị, không cần tài khoản hay tải dữ liệu lên.' }].map((item, index) => <Reveal key={item.title} index={index + 3}><span className="icon-tile"><item.Icon size={20} /></span><div><h3>{item.title}</h3><p>{item.text}</p></div></Reveal>)}</div>
  </>;
}
