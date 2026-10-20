export function chartGradients(id: string, colors: readonly string[]) {
  return <defs><linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={colors[0]} stopOpacity={.4} /><stop offset="100%" stopColor={colors[0]} stopOpacity={.015} /></linearGradient><linearGradient id={`${id}-bar`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={colors[1]} /><stop offset="100%" stopColor={colors[0]} /></linearGradient></defs>;
}
