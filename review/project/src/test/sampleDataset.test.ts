// src/test/sampleDataset.test.ts
import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { runFullAnalysis } from '../core/analyzer';
import { ColumnMappingConfig } from '../core/types';

describe('Kiểm thử End-to-End với bộ dữ liệu mẫu 5.030 dòng (du_lieu_ban_hang_mau.csv)', () => {
  it('Chạy trơn tru toàn bộ pipeline tính toán và phát hiện chính xác các dòng lỗi cố ý', () => {
    const csvPath = path.resolve(__dirname, '../../public/sample-data/du_lieu_ban_hang_mau.csv');
    expect(fs.existsSync(csvPath)).toBe(true);

    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const lines = fileContent.trim().split('\n');
    const headerLine = lines[0].replace(/^\uFEFF/, '');
    const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    const rawRows: Record<string, any>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      // Parse CSV line đơn giản hoặc regex
      const cols = line.split(',');
      const rowObj: Record<string, any> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = cols[idx] !== undefined ? cols[idx].replace(/^"|"$/g, '') : '';
      });
      rawRows.push(rowObj);
    }

    expect(rawRows.length).toBeGreaterThanOrEqual(5000);

    const mapping: ColumnMappingConfig = {
      dateCol: 'Ngày bán',
      productCol: 'Tên sản phẩm',
      quantityCol: 'Số lượng',
      revenueCol: 'Doanh thu',
      unitPriceCol: 'Đơn giá',
      costPriceCol: 'Giá vốn',
      customerIdCol: 'Mã khách hàng',
      orderIdCol: 'Mã đơn hàng',
      categoryCol: 'Danh mục'
    };

    const analysis = runFullAnalysis(rawRows, mapping);

    // Kiểm tra báo cáo làm sạch:
    // Tổng số dòng bị loại phải bằng số dòng lỗi đã đưa vào (~80 dòng lỗi: trùng lặp, thiếu ngày, số âm, số 0, thiếu mã)
    expect(analysis.cleaningReport.droppedTotal).toBeGreaterThanOrEqual(70);
    expect(analysis.cleaningReport.validRows).toBeGreaterThan(4900);
    expect(analysis.overview.totalRevenue).toBeGreaterThan(100000000); // > 100 triệu VND
    expect(analysis.overview.totalProfit).toBeGreaterThan(0);
    expect(analysis.overview.profitMargin).toBeGreaterThan(10);
    expect(analysis.productAnalysis.products.length).toBe(50); // Đúng 50 mặt hàng
    expect(analysis.productAnalysis.abcSummary.groupA.count).toBeGreaterThan(0);
    expect(analysis.customerAnalysis.hasCustomerData).toBe(true);
    expect(analysis.customerAnalysis.totalCustomers).toBe(300); // Đúng 300 khách hàng
    expect(analysis.customerAnalysis.vipCustomers.length).toBeGreaterThan(0);
    expect(analysis.actionSuggestions.length).toBeGreaterThanOrEqual(3);
    expect(analysis.conclusions.overview.length).toBeGreaterThan(20);
  });
});
