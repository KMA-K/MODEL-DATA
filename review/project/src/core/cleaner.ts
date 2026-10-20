// src/core/cleaner.ts
import { CleaningReport, CleanRow, ColumnMappingConfig, DropReasonCount } from './types';

/**
 * Chuẩn hóa số từ chuỗi tiếng Việt hoặc tiếng Anh
 * Ví dụ: "125.000", "125,000.50", " 35,000 đ", "100k", "-50"
 */
export function parseFlexibleNumber(val: any): number {
  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : 0;
  }
  if (!val) return 0;

  let str = String(val).trim().toLowerCase();
  
  // Bỏ ký hiệu tiền tệ hoặc ký tự không cần thiết
  str = str.replace(/[₫đ$vnd\s]/g, '');

  // Xử lý hậu tố k (nghìn)
  let multiplier = 1;
  if (str.endsWith('k')) {
    multiplier = 1000;
    str = str.slice(0, -1);
  } else if (str.endsWith('m') || str.endsWith('tr')) {
    multiplier = 1000000;
    str = str.replace(/(m|tr)$/, '');
  }

  // Nhận diện dấu thập phân và dấu phân cách hàng nghìn:
  // Nếu có cả dấu chấm và phẩy: "1.250.000,50" -> dấu phẩy là thập phân
  // "1,250,000.50" -> dấu chấm là thập phân
  if (str.includes('.') && str.includes(',')) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      // Dạng VN/EU: 1.250.000,50
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // Dạng US: 1,250,000.50
      str = str.replace(/,/g, '');
    }
  } else if (str.includes('.')) {
    // Chỉ có dấu chấm: nếu có từ 2 dấu chấm trở lên, đó là phân cách hàng nghìn: "1.250.000"
    const dotCount = (str.match(/\./g) || []).length;
    if (dotCount > 1) {
      str = str.replace(/\./g, '');
    } else {
      // 1 dấu chấm: nếu phần sau dấu chấm có đúng 3 chữ số và không có số thập phân lẻ, có thể là hàng nghìn "125.000"
      // Nhưng nếu < 1000 (ví dụ 12.5) thì là số thập phân.
      const parts = str.split('.');
      if (parts[1].length === 3 && parseInt(parts[0], 10) >= 1) {
        // Khả năng cao là hàng nghìn: "50.000" -> 50000
        str = str.replace(/\./g, '');
      }
    }
  } else if (str.includes(',')) {
    // Chỉ có dấu phẩy: tương tự
    const commaCount = (str.match(/,/g) || []).length;
    if (commaCount > 1) {
      str = str.replace(/,/g, '');
    } else {
      const parts = str.split(',');
      if (parts[1].length === 3 && parseInt(parts[0], 10) >= 1) {
        str = str.replace(/,/g, '');
      } else {
        str = str.replace(',', '.');
      }
    }
  }

  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(str)) return 0;
  const num = Number(str) * multiplier;
  return Number.isFinite(num) ? num : 0;
}

/**
 * Chuẩn hóa chuỗi ngày tháng sang dạng YYYY-MM-DD
 * Hỗ trợ: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, Excel Date Serial (ví dụ 45210)
 */
export function parseFlexibleDate(val: any): { dateStr: string; monthStr: string; timestamp: number } | null {
  if (!val) return null;

  // Nếu là đối tượng Date có sẵn (từ SheetJS)
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return {
      dateStr: `${y}-${m}-${d}`,
      monthStr: `${y}-${m}`,
      timestamp: val.getTime()
    };
  }

  // Nếu là số Excel serial date (ví dụ ~ 44000 đến 48000 cho 2020-2030)
  if (typeof val === 'number') {
    if (val > 30000 && val < 60000) {
      // Excel epoch: 1899-12-30
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return {
          dateStr: `${y}-${m}-${d}`,
          monthStr: `${y}-${m}`,
          timestamp: date.getTime()
        };
      }
    }
    return null;
  }

  const str = String(val).trim();
  if (!str) return null;

  // Dạng YYYY-MM-DD hoặc YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const mm = String(m).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
      return {
        dateStr: `${y}-${mm}-${dd}`,
        monthStr: `${y}-${mm}`,
        timestamp: date.getTime()
      };
    }
  }

  // Dạng DD/MM/YYYY hoặc DD-MM-YYYY (phổ biến tại Việt Nam)
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10);
    const y = parseInt(dmyMatch[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const mm = String(m).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
      return {
        dateStr: `${y}-${mm}-${dd}`,
        monthStr: `${y}-${mm}`,
        timestamp: date.getTime()
      };
    }
  }

  // Thử parse bằng Date tiêu chuẩn
  const fallbackDate = new Date(str);
  if (!isNaN(fallbackDate.getTime())) {
    const y = fallbackDate.getFullYear();
    const m = String(fallbackDate.getMonth() + 1).padStart(2, '0');
    const d = String(fallbackDate.getDate()).padStart(2, '0');
    // Giới hạn năm thực tế (từ 2000 đến 2100)
    if (y >= 2000 && y <= 2100) {
      return {
        dateStr: `${y}-${m}-${d}`,
        monthStr: `${y}-${m}`,
        timestamp: fallbackDate.getTime()
      };
    }
  }

  return null;
}

/**
 * Làm sạch dữ liệu và lập báo cáo chi tiết các dòng bị loại
 */
export function cleanSalesData(
  rawRows: Record<string, any>[],
  mapping: ColumnMappingConfig
): { cleanRows: CleanRow[]; report: CleaningReport } {
  const cleanRows: CleanRow[] = [];

  const reasonStats: Record<string, { description: string; count: number; sampleRows: number[] }> = {
    missing_required_columns: {
      description: 'Thiếu cấu hình cột bắt buộc',
      count: 0,
      sampleRows: []
    },
    duplicate: {
      description: 'Dòng trùng lặp hoàn toàn với dòng trước đó',
      count: 0,
      sampleRows: []
    },
    missing_date: {
      description: 'Ngày bán bị trống hoặc không đúng định dạng ngày tháng',
      count: 0,
      sampleRows: []
    },
    missing_product: {
      description: 'Thiếu tên hoặc mã sản phẩm',
      count: 0,
      sampleRows: []
    },
    invalid_quantity: {
      description: 'Số lượng bán nhỏ hơn hoặc bằng 0, hoặc không phải số',
      count: 0,
      sampleRows: []
    },
    invalid_revenue: {
      description: 'Doanh thu hoặc đơn giá nhỏ hơn hoặc bằng 0',
      count: 0,
      sampleRows: []
    }
  };

  const recordDrop = (key: keyof typeof reasonStats, rowIndex: number) => {
    reasonStats[key].count++;
    if (reasonStats[key].sampleRows.length < 5) {
      reasonStats[key].sampleRows.push(rowIndex);
    }
  };

  // Kiểm tra cấu hình bắt buộc
  if (!mapping.dateCol || !mapping.productCol || !mapping.quantityCol || (!mapping.revenueCol && !mapping.unitPriceCol)) {
    return {
      cleanRows: [],
      report: {
        totalRows: rawRows.length,
        validRows: 0,
        droppedTotal: rawRows.length,
        reasons: [{
          reason: 'missing_required_columns',
          description: 'Chưa chọn đủ các cột bắt buộc: Ngày bán, Tên/Mã SP, Số lượng, và Doanh thu (hoặc Đơn giá)',
          count: rawRows.length,
          sampleRows: [1]
        }]
      }
    };
  }

  // Dùng Set lưu hash dòng để phát hiện trùng lặp
  const seenRowSignatures = new Set<string>();

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i];
    const rowIndex = i + 1; // 1-based cho người dùng dễ đối chiếu

    // 1. Kiểm tra ngày bán
    const dateVal = raw[mapping.dateCol];
    const parsedDate = parseFlexibleDate(dateVal);
    if (!parsedDate) {
      recordDrop('missing_date', rowIndex);
      continue;
    }

    // 2. Kiểm tra tên/mã sản phẩm
    const productVal = raw[mapping.productCol];
    const productName = productVal ? String(productVal).trim() : '';
    if (!productName) {
      recordDrop('missing_product', rowIndex);
      continue;
    }

    // 3. Kiểm tra số lượng
    const quantityVal = raw[mapping.quantityCol];
    const quantity = parseFlexibleNumber(quantityVal);
    if (quantity <= 0) {
      recordDrop('invalid_quantity', rowIndex);
      continue;
    }

    // 4. Kiểm tra doanh thu / đơn giá
    let revenue = 0;
    let unitPrice = 0;

    if (mapping.revenueCol && raw[mapping.revenueCol] !== undefined && raw[mapping.revenueCol] !== '') {
      revenue = parseFlexibleNumber(raw[mapping.revenueCol]);
      if (mapping.unitPriceCol && raw[mapping.unitPriceCol]) {
        unitPrice = parseFlexibleNumber(raw[mapping.unitPriceCol]);
      } else {
        unitPrice = quantity > 0 ? revenue / quantity : 0;
      }
    } else if (mapping.unitPriceCol) {
      unitPrice = parseFlexibleNumber(raw[mapping.unitPriceCol]);
      revenue = quantity * unitPrice;
    }

    if (revenue <= 0 || unitPrice <= 0) {
      recordDrop('invalid_revenue', rowIndex);
      continue;
    }

    // 5. Kiểm tra trùng lặp (Dựa trên ngày, sản phẩm, số lượng, doanh thu, đơn hàng, khách hàng)
    const orderId = mapping.orderIdCol && raw[mapping.orderIdCol]
      ? String(raw[mapping.orderIdCol]).trim()
      : `AUTO-${parsedDate.dateStr}-${rowIndex}`;

    const customerId = mapping.customerIdCol && raw[mapping.customerIdCol]
      ? String(raw[mapping.customerIdCol]).trim()
      : null;

    const signature = `${parsedDate.dateStr}|${orderId}|${productName}|${quantity}|${revenue}|${customerId || ''}`;
    if (seenRowSignatures.has(signature)) {
      recordDrop('duplicate', rowIndex);
      continue;
    }
    seenRowSignatures.add(signature);

    // 6. Xử lý các trường tùy chọn: Giá vốn & Lợi nhuận
    let costPrice: number | null = null;
    let totalCost: number | null = null;
    let profit: number | null = null;

    if (mapping.costPriceCol && raw[mapping.costPriceCol] !== undefined && raw[mapping.costPriceCol] !== '') {
      const parsedCost = parseFlexibleNumber(raw[mapping.costPriceCol]);
      if (parsedCost > 0) {
        costPrice = parsedCost;
        totalCost = costPrice * quantity;
        profit = revenue - totalCost;
      }
    }

    const category = mapping.categoryCol && raw[mapping.categoryCol]
      ? String(raw[mapping.categoryCol]).trim()
      : 'Chung';

    cleanRows.push({
      rowIndex,
      orderId,
      date: parsedDate.dateStr,
      monthStr: parsedDate.monthStr,
      timestamp: parsedDate.timestamp,
      productId: productName, // Dùng tên làm ID định danh nếu không tách riêng
      productName,
      category: category || 'Chung',
      quantity,
      unitPrice,
      revenue,
      costPrice,
      totalCost,
      profit,
      customerId
    });
  }

  // Tổng hợp báo cáo lý do bị loại
  const reasons: DropReasonCount[] = Object.keys(reasonStats)
    .filter(k => reasonStats[k].count > 0)
    .map(k => ({
      reason: k,
      description: reasonStats[k].description,
      count: reasonStats[k].count,
      sampleRows: reasonStats[k].sampleRows
    }));

  const droppedTotal = reasons.reduce((sum, r) => sum + r.count, 0);

  return {
    cleanRows,
    report: {
      totalRows: rawRows.length,
      validRows: cleanRows.length,
      droppedTotal,
      reasons
    }
  };
}
