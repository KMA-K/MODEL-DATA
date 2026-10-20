import type { ReactNode, CSSProperties } from 'react';
import { Sparkles, Puzzle } from 'lucide-react';

export function Reveal({ children, index = 0, className = '' }: { children: ReactNode; index?: number; className?: string }) {
  return <div className={`reveal ${className}`} style={{ '--delay': `${index * 65}ms` } as CSSProperties}>{children}</div>;
}
export function RichText({ text }: { text: string }) {
  // Render emphasis as React text nodes: uploaded product/customer names cannot inject HTML.
  return <>{text.split(/(\*\*.*?\*\*)/g).map((part, index) => part.startsWith('**') && part.endsWith('**') ? <strong key={index}>{part.slice(2, -2)}</strong> : part)}</>;
}
export function Insight({ text, title = 'Điểm tin kinh doanh', index = 0 }: { text: string; title?: string; index?: number }) {
  return <Reveal index={index} className="insight"><span className="icon-tile"><Sparkles size={21} /></span><div><p className="eyebrow">{title}</p><p><RichText text={text} /></p></div></Reveal>;
}
export function StoreIllustration() {
  return <svg className="store-illustration" viewBox="0 0 380 290" fill="none" aria-hidden="true">
    <ellipse cx="189" cy="264" rx="121" ry="11" fill="currentColor" opacity=".08" />
    <g className="svg-float"><rect x="78" y="100" width="219" height="151" rx="17" fill="var(--bg-card)" stroke="currentColor" strokeWidth="2" /><rect x="93" y="133" width="109" height="95" rx="9" fill="currentColor" opacity=".07" /><path d="M111 206V179M139 206V165M167 206V146" stroke="currentColor" strokeWidth="14" strokeLinecap="round" opacity=".65" /><rect x="220" y="145" width="56" height="106" rx="6" fill="currentColor" opacity=".12" /><circle cx="263" cy="198" r="3" fill="currentColor" /><path d="M88 74H288L310 113H66L88 74Z" fill="currentColor" opacity=".9" /><path d="M68 113H307V123C307 137 284 138 278 125C273 140 251 139 247 126C243 141 221 141 216 126C211 141 189 141 185 126C180 141 157 141 153 126C149 141 128 141 123 126C119 140 95 139 93 125C88 138 68 136 68 123V113Z" fill="currentColor" opacity=".3" /><rect x="150" y="46" width="77" height="26" rx="13" fill="var(--bg-card)" stroke="currentColor" strokeWidth="2" /><path d="M166 59H210" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></g>
    <g className="svg-float-delay"><rect x="271" y="31" width="75" height="65" rx="14" fill="var(--bg-card)" stroke="currentColor" strokeOpacity=".3" /><path d="M286 75L301 60L310 66L330 47M319 47H330V58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><rect x="22" y="161" width="82" height="55" rx="13" fill="var(--bg-card)" stroke="currentColor" strokeOpacity=".3" /><circle cx="42" cy="189" r="8" fill="currentColor" opacity=".2" /><path d="M60 183H87M60 193H76" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></g>
    <circle className="svg-spark" cx="42" cy="88" r="5" fill="currentColor" opacity=".4" /><path className="svg-spark" d="M328 191V205M321 198H335" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}
export function MissingData({ title, children }: { title: string; children: ReactNode }) {
  return <div className="missing-column-notice"><span className="puzzle-illustration"><Puzzle size={37} strokeWidth={1.3} /></span><div><h3>{title}</h3><p>{children}</p></div></div>;
}
