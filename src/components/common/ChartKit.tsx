import { formatVND } from '../../core/textConclusions';

interface TooltipEntry { name?: string | number; value?: string | number; color?: string; dataKey?: string | number }
export function GlassTooltip({ active, payload, label }: { active?: boolean; payload?: readonly TooltipEntry[]; label?: string | number }) {
  if (!active || !payload?.length) return null;
  return <div className="glass-tooltip"><strong>{label}</strong>{payload.map((entry, index) => <div key={index}><span className="tooltip-dot" style={{ background: entry.color || 'var(--color-primary)' }} /><span>{entry.name}</span><b>{['orders', 'count'].includes(String(entry.dataKey)) ? Number(entry.value).toLocaleString('vi-VN') : formatVND(Number(entry.value))}</b></div>)}</div>;
}
