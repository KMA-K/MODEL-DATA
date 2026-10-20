import { useState } from 'react';
import { ArrowRight, FileSpreadsheet, Table2 } from 'lucide-react';
import { guessColumnMapping } from '../../core/columnMapping';
import type { ColumnMappingConfig, ParseResult } from '../../core/types';
import { Reveal } from '../common/Visuals';

const FIELDS: { key: keyof ColumnMappingConfig; label: string; hint: string; required?: boolean }[] = [
  { key: 'dateCol', label: 'Ngày bán', hint: 'Ngày phát sinh giao dịch', required: true },
  { key: 'productCol', label: 'Tên / mã sản phẩm', hint: 'Nhận diện mặt hàng', required: true },
  { key: 'quantityCol', label: 'Số lượng', hint: 'Số lượng trên từng dòng hàng', required: true },
  { key: 'revenueCol', label: 'Doanh thu', hint: 'Thành tiền của từng dòng, không phải tổng hóa đơn' },
  { key: 'unitPriceCol', label: 'Đơn giá bán', hint: 'Dùng tính doanh thu nếu thiếu thành tiền' },
  { key: 'costPriceCol', label: 'Giá vốn đơn vị', hint: 'Mở phân tích lợi nhuận gộp' },
  { key: 'orderIdCol', label: 'Mã đơn / hóa đơn', hint: 'Tính số đơn, AOV và cặp mua cùng' },
  { key: 'customerIdCol', label: 'Mã / tên khách hàng', hint: 'Mở phân nhóm và chăm sóc khách hàng' },
  { key: 'categoryCol', label: 'Danh mục sản phẩm', hint: 'Nhóm hàng hóa trong cửa hàng' },
];
export function ColumnMapper({ parseResult, onConfirmMapping, onCancel }: { parseResult: ParseResult; onConfirmMapping: (mapping: ColumnMappingConfig) => void; onCancel: () => void }) {
  const [mapping, setMapping] = useState(() => guessColumnMapping(parseResult.headers));
  const [preview, setPreview] = useState(false);
  const selected = Object.values(mapping).filter(Boolean);
  const duplicate = new Set(selected).size !== selected.length;
  const ready = !!(mapping.dateCol && mapping.productCol && mapping.quantityCol && (mapping.revenueCol || mapping.unitPriceCol)) && !duplicate;
  return <div className="mapping-page dashboard-stack"><div className="page-heading"><div><p className="eyebrow">BƯỚC 02 · XÁC NHẬN DỮ LIỆU</p><h1>Đúng cột. Đúng góc nhìn.</h1><p>Chúng tôi đã ghép cột gợi ý. Bạn kiểm tra lại trước khi bắt đầu nhé.</p></div></div>
    <Reveal className="card"><div className="flex items-center justify-between flex-wrap gap-3"><div className="flex items-center gap-3"><span className="icon-tile"><FileSpreadsheet size={22} /></span><div><strong>{parseResult.fileName}</strong><p className="muted">{parseResult.totalRows.toLocaleString('vi-VN')} dòng · {parseResult.headers.length} cột · {(parseResult.fileSizeBytes / 1024).toFixed(1)} KB</p></div></div><button type="button" className="btn btn-outline btn-sm" aria-expanded={preview} onClick={() => setPreview(!preview)}><Table2 size={15} />{preview ? 'Ẩn xem trước' : 'Xem trước dữ liệu'}</button></div>
      {preview && <div className="table-container mt-5"><table className="data-table"><thead><tr>{parseResult.headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{parseResult.previewRows.map((row, index) => <tr key={index}>{parseResult.headers.map(header => <td key={header}>{String(row[header] ?? '')}</td>)}</tr>)}</tbody></table></div>}
    </Reveal>
    <Reveal index={1} className="card"><div className="card-heading"><div><h2>Ghép cột dữ liệu</h2><p>Cần ngày, sản phẩm, số lượng và doanh thu hoặc đơn giá. Mỗi dòng tương ứng một mặt hàng trong hóa đơn.</p></div><span className="badge badge-a">Tự nhận diện tiếng Việt</span></div><div className="mapping-grid">{FIELDS.map(field => <div className="mapping-field" key={field.key}><label htmlFor={`map-${field.key}`}>{field.label}{field.required && <span className="text-accent"> *</span>}</label><select id={`map-${field.key}`} value={mapping[field.key] || ''} onChange={event => setMapping(current => ({ ...current, [field.key]: event.target.value }))}><option value="">{field.required ? 'Chọn cột tương ứng' : 'Không có / bỏ qua'}</option>{parseResult.headers.map(header => <option value={header} key={header}>{header}</option>)}</select><small>{field.hint}</small></div>)}</div>
      {!ready && <p className="muted" role="status">{duplicate ? 'Một cột đang được dùng cho nhiều trường. Hãy chọn cột riêng cho từng trường.' : 'Chọn đủ các trường bắt buộc và doanh thu hoặc đơn giá để tiếp tục.'}</p>}
      <div className="flex justify-end flex-wrap gap-3 mt-6"><button type="button" className="btn btn-outline" onClick={onCancel}>Chọn file khác</button><button type="button" className="btn btn-primary" disabled={!ready} onClick={() => onConfirmMapping(mapping)}>Khám phá dữ liệu<ArrowRight size={16} /></button></div>
    </Reveal>
  </div>;
}
