import { useState } from 'react';
import { Monitor, Moon, Sun, Palette, Minus, Plus, RotateCcw, Sparkles, Check } from 'lucide-react';
import { ACCENTS } from '../../theme/settings';
import { useTheme } from '../../theme/useTheme';
import { Dialog } from './Dialog';

export function ThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const { settings, update, reset, systemReducedMotion } = useTheme();
  return <>
    <button type="button" className="theme-trigger btn" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} aria-label="Tùy chỉnh giao diện"><Palette size={19} /><span>Tùy chỉnh giao diện</span></button>
    {open && <Dialog drawer labelledBy="theme-title" onClose={() => setOpen(false)}>
      <div className="drawer-heading"><span className="icon-tile"><Palette size={24} /></span><p className="eyebrow">THEO CÁCH CỦA BẠN</p><h2 id="theme-title">Tùy chỉnh giao diện</h2><p>Một không gian làm việc thật dễ chịu.</p></div>
      <fieldset><legend>Chế độ hiển thị</legend><div className="mode-options grid grid-cols-3 gap-2">
        {([{ value: 'light', label: 'Sáng', Icon: Sun }, { value: 'dark', label: 'Tối', Icon: Moon }, { value: 'system', label: 'Hệ thống', Icon: Monitor }] as const).map(({ value, label, Icon }) => <button key={value} type="button" className={`choice ${settings.mode === value ? 'selected' : ''}`} aria-pressed={settings.mode === value} onClick={() => update({ mode: value })}><Icon size={20} />{label}</button>)}
      </div></fieldset>
      <fieldset><legend>Màu chủ đạo <span>{ACCENTS[settings.accent].label}</span></legend><div className="accent-options flex justify-between gap-3">{Object.entries(ACCENTS).map(([key, value]) => <button key={key} type="button" className={`swatch ${key === settings.accent ? 'selected' : ''}`} style={{ background: value.swatch }} title={value.label} aria-label={`Màu ${value.label}`} aria-pressed={key === settings.accent} onClick={() => update({ accent: key as keyof typeof ACCENTS })}>{key === settings.accent && <Check size={21} />}</button>)}</div></fieldset>
      <fieldset><legend>Mật độ hiển thị</legend><div className="grid grid-cols-2 gap-2">{([{ value: 'comfortable', label: 'Thoáng', detail: 'Thêm khoảng thở' }, { value: 'compact', label: 'Gọn', detail: 'Nhiều dữ liệu hơn' }] as const).map(item => <button type="button" key={item.value} className={`choice ${settings.density === item.value ? 'selected' : ''}`} aria-pressed={settings.density === item.value} onClick={() => update({ density: item.value })}><strong>{item.label}</strong><small>{item.detail}</small></button>)}</div></fieldset>
      <fieldset><legend>Cỡ chữ</legend><div className="font-control flex items-center justify-between"><button type="button" className="btn btn-outline" disabled={settings.fontSize === 16} aria-label="Giảm cỡ chữ" onClick={() => update({ fontSize: settings.fontSize === 20 ? 18 : 16 })}><Minus size={17} /></button><span className="font-sample">Aa <small>{settings.fontSize === 16 ? 'Tiêu chuẩn' : settings.fontSize === 18 ? 'Lớn' : 'Rất lớn'}</small></span><button type="button" className="btn btn-outline" disabled={settings.fontSize === 20} aria-label="Tăng cỡ chữ" onClick={() => update({ fontSize: settings.fontSize === 16 ? 18 : 20 })}><Plus size={17} /></button></div></fieldset>
      <fieldset><legend>Chuyển động</legend><label className="motion-setting flex items-center justify-between gap-3"><span><strong>Giảm hiệu ứng động</strong><small>Hiển thị ngay, nhẹ máy hơn</small></span><input className="switch" type="checkbox" checked={settings.reducedMotion} onChange={event => update({ reducedMotion: event.target.checked })} /></label>{systemReducedMotion && <p className="setting-note">Thiết bị đang yêu cầu giảm chuyển động. Giao diện sẽ tôn trọng thiết lập này.</p>}</fieldset>
      <div className="theme-preview"><Sparkles size={17} /><span>Các thay đổi được áp dụng ngay và tự động lưu.</span></div>
      <button type="button" className="btn btn-outline w-full" onClick={reset}><RotateCcw size={15} />Khôi phục mặc định</button>
    </Dialog>}
  </>;
}
