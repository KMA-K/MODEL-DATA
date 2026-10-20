import type { LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { Reveal } from '../common/Visuals';
import { formatVND } from '../../core/textConclusions';
export function KpiCard({ title, value, subtitle, Icon, money = false, featured = false, index = 0, format }: { title: string; value: number | null; subtitle: string; Icon: LucideIcon; money?: boolean; featured?: boolean; index?: number; format?: (value: number) => string }) {
  const currency = (number: number) => formatVND(Math.round(number));
  return <Reveal index={index} className={`kpi-card ${featured ? 'kpi-featured' : ''}`}><div className="kpi-title"><span>{title}</span><span className="icon-tile"><Icon size={16} /></span></div><div className="kpi-value">{value === null ? <span className="text-base">Chưa đủ dữ liệu</span> : <AnimatedNumber value={value} format={format || (money ? currency : undefined)} />}</div><p className="kpi-subtext">{subtitle}</p></Reveal>;
}
