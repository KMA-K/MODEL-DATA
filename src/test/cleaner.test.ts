// src/test/cleaner.test.ts
import { describe, expect, it } from 'vitest';
import { cleanSalesData, parseFlexibleDate, parseFlexibleNumber } from '../core/cleaner';
import { ColumnMappingConfig } from '../core/types';

describe('Bộ làm sạch dữ liệu (Data Cleaner)', () => {
  it('parseFlexibleNumber chuẩn hóa chính xác số tiền và ký hiệu tiếng Việt', () => {
    expect(parseFlexibleNumber(125000)).toBe(125000);
    expect(parseFlexibleNumber('125.000')).toBe(125000);
    expect(parseFlexibleNumber('125,000')).toBe(125000);
    expect(parseFlexibleNumber(' 125.000 đ ')).toBe(125000);
    expect(parseFlexibleNumber('50k')).toBe(50000);
    expect(parseFlexibleNumber('2.5tr')).toBe(2500000);
    expect(parseFlexibleNumber('-30000')).toBe(-30000);
    expect(parseFlexibleNumber('abc')).toBe(0);
  });

  it('parseFlexibleDate hỗ trợ các định dạng ngày phổ biến', () => {
    expect(parseFlexibleDate('2026-03-15')?.dateStr).toBe('2026-03-15');
    expect(parseFlexibleDate('15/03/2026')?.dateStr).toBe('2026-03-15');
    expect(parseFlexibleDate('15-03-2026')?.dateStr).toBe('2026-03-15');
    expect(parseFlexibleDate('')).toBeNull();
    expect(parseFlexibleDate('ngày không hợp lệ')).toBeNull();
  });

  it('Làm sạch dữ liệu, loại bỏ dòng lỗi và báo cáo lý do minh bạch', () => {
    const rawRows = [
      // Hợp lệ 1
      { 'Ngày': '2026-01-10', 'Sản phẩm': 'Cà phê A', 'Số lượng': '2', 'Doanh thu': '200000', 'Mã đơn': 'DH1' },
      // Trùng lặp với hợp lệ 1
      { 'Ngày': '2026-01-10', 'Sản phẩm': 'Cà phê A', 'Số lượng': '2', 'Doanh thu': '200000', 'Mã đơn': 'DH1' },
      // Thiếu ngày
      { 'Ngày': '', 'Sản phẩm': 'Trà B', 'Số lượng': '1', 'Doanh thu': '50000', 'Mã đơn': 'DH2' },
      // Thiếu tên sản phẩm
      { 'Ngày': '2026-01-11', 'Sản phẩm': '', 'Số lượng': '1', 'Doanh thu': '50000', 'Mã đơn': 'DH3' },
      // Số lượng âm
      { 'Ngày': '2026-01-12', 'Sản phẩm': 'Bánh C', 'Số lượng': '-1', 'Doanh thu': '30000', 'Mã đơn': 'DH4' },
      // Doanh thu = 0
      { 'Ngày': '2026-01-13', 'Sản phẩm': 'Kẹo D', 'Số lượng': '5', 'Doanh thu': '0', 'Mã đơn': 'DH5' },
      // Hợp lệ 2
      { 'Ngày': '2026-01-14', 'Sản phẩm': 'Sữa E', 'Số lượng': '3', 'Doanh thu': '150000', 'Mã đơn': 'DH6' }
    ];

    const mapping: ColumnMappingConfig = {
      dateCol: 'Ngày',
      productCol: 'Sản phẩm',
      quantityCol: 'Số lượng',
      revenueCol: 'Doanh thu',
      orderIdCol: 'Mã đơn'
    };

    // Mặc định: Chính sách an toàn giữ lại dòng trùng nghi vấn (UI-06 Case A)
    const { cleanRows, report } = cleanSalesData(rawRows, mapping);
    expect(cleanRows.length).toBe(3);
    expect(report.totalRows).toBe(7);
    expect(report.validRows).toBe(3);
    expect(report.droppedTotal).toBe(4);
    expect(report.suspectedDuplicates?.count).toBe(1);

    // Khi người dùng chủ động chọn loại dòng trùng lặp (UI-06 Case B)
    const { cleanRows: strictCleanRows, report: strictReport } = cleanSalesData(rawRows, {
      ...mapping,
      deduplicatePolicy: 'drop_exact_duplicates'
    });
    expect(strictCleanRows.length).toBe(2);
    expect(strictReport.validRows).toBe(2);
    expect(strictReport.droppedTotal).toBe(5);

    // Kiểm tra có đầy đủ báo cáo lý do bị loại
    const reasonsMap = new Map(strictReport.reasons.map(r => [r.reason, r.count]));
    expect(reasonsMap.get('duplicate')).toBe(1);
    expect(reasonsMap.get('missing_date')).toBe(1);
    expect(reasonsMap.get('missing_product')).toBe(1);
    expect(reasonsMap.get('invalid_quantity')).toBe(1);
    expect(reasonsMap.get('invalid_revenue')).toBe(1);
  });

  it('Tự tính Doanh thu = Số lượng * Đơn giá khi không có cột Doanh thu', () => {
    const rawRows = [
      { 'Ngày': '2026-02-01', 'Tên hàng': 'Bút bi', 'SL': '10', 'Giá': '5000' }
    ];

    const mapping: ColumnMappingConfig = {
      dateCol: 'Ngày',
      productCol: 'Tên hàng',
      quantityCol: 'SL',
      revenueCol: '',
      unitPriceCol: 'Giá'
    };

    const { cleanRows } = cleanSalesData(rawRows, mapping);
    expect(cleanRows.length).toBe(1);
    expect(cleanRows[0].revenue).toBe(50000);
    expect(cleanRows[0].unitPrice).toBe(5000);
  });
});
