// src/components/export/exportCsv.ts

/**
 * Xuất dữ liệu mảng đối tượng ra file CSV với UTF-8 BOM để Excel hiển thị tiếng Việt hoàn hảo
 */
export function exportToCsv(filename: string, headers: { key: string; label: string }[], data: Record<string, any>[]) {
  const headerRow = headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',');
  
  const rows = data.map(item => {
    return headers.map(h => {
      let val = item[h.key];
      if (val === undefined || val === null) {
        val = '';
      } else {
        val = String(val);
        // Spreadsheet formulas in uploaded text must remain literal on export.
        if (typeof item[h.key] === 'string' && /^[=+@\-\t\r]/.test(val)) val = `'${val}`;
      }
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
