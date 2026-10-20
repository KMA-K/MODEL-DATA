import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { runFullAnalysis } from '../core/analyzer';
import { parseFlexibleDate } from '../core/cleaner';
import { calculateProductMetrics } from '../core/productMetrics';
import { generateProfitMarginConclusion } from '../core/textConclusions';
import type { ColumnMappingConfig } from '../core/types';

const FIXTURES_DIR = path.resolve(__dirname, '../../review/data');

function readCsvFixture(fileName: string): Record<string, any>[] {
  const filePath = path.join(FIXTURES_DIR, fileName);
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = Papa.parse<Record<string, any>>(content, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: h => h.trim()
  });
  return parsed.data;
}

describe('Giai đoạn 1 — Data Integrity & Reliability Regression Tests', () => {

  // =========================================================================
  // UI-06: Phát hiện trùng làm mất dòng bán hàng hợp lệ
  // =========================================================================
  describe('UI-06: Duplicate Detection & Preservation Policy', () => {
    const mapping: ColumnMappingConfig = {
      dateCol: 'Ngày bán',
      productCol: 'Tên sản phẩm',
      quantityCol: 'Số lượng',
      revenueCol: 'Doanh thu',
      unitPriceCol: 'Đơn giá',
      costPriceCol: 'Giá vốn',
      orderIdCol: 'Mã đơn hàng',
      customerIdCol: 'Mã khách hàng',
      categoryCol: 'Danh mục'
    };

    it('Case A (Default safe policy): Giữ hai dòng bán thật giống nhau, doanh thu 200.000đ', () => {
      const rows = readCsvFixture('duplicate-real-order.csv');
      expect(rows).toHaveLength(2);

      // Mặc định: deduplicatePolicy = 'keep_all'
      const analysis = runFullAnalysis(rows, mapping);

      // Doanh thu thực tế phải là 200.000đ, không bị tự động xóa mất 100.000đ
      expect(analysis.overview.totalRevenue).toBe(200000);
      expect(analysis.cleaningReport.validRows).toBe(2);
      expect(analysis.cleaningReport.droppedTotal).toBe(0);

      // Đánh dấu nghi ngờ trùng để minh bạch với người dùng
      expect(analysis.cleaningReport.suspectedDuplicates?.count).toBe(1);
      expect(analysis.cleaningReport.suspectedDuplicates?.totalRevenue).toBe(100000);
      expect(analysis.cleaningReport.suspectedDuplicates?.sampleRows).toContain(2);
    });

    it('Case B (Confirmed drop): Người dùng chủ động chọn loại trùng, kết quả 100.000đ và ghi nhận dòng bị loại', () => {
      const rows = readCsvFixture('duplicate-real-order.csv');
      const analysis = runFullAnalysis(rows, {
        ...mapping,
        deduplicatePolicy: 'drop_exact_duplicates'
      });

      expect(analysis.overview.totalRevenue).toBe(100000);
      expect(analysis.cleaningReport.validRows).toBe(1);
      expect(analysis.cleaningReport.droppedTotal).toBe(1);

      const dupReason = analysis.cleaningReport.reasons.find(r => r.reason === 'duplicate');
      expect(dupReason).toBeDefined();
      expect(dupReason?.count).toBe(1);
      expect(dupReason?.sampleRows).toContain(2);
    });

    it('Case C: Hai dòng giống nhau nhưng thiếu mã đơn (duplicate-no-order.csv), không gộp sai', () => {
      const rows = readCsvFixture('duplicate-no-order.csv');
      const analysis = runFullAnalysis(rows, mapping);

      // Giữ cả 2 dòng, tổng doanh thu 200.000đ
      expect(analysis.overview.totalRevenue).toBe(200000);
      expect(analysis.cleaningReport.validRows).toBe(2);
      // Mã đơn bị thiếu nên không xem là tin cậy
      expect(analysis.overview.hasReliableOrderIds).toBe(false);
      expect(analysis.overview.orderIdStatus).toBe('missing');
    });

    it('Case D: Dữ liệu không có dòng nghi trùng (oracle-28.csv), kết quả không đổi', () => {
      const rows = readCsvFixture('oracle-28.csv');
      const analysis = runFullAnalysis(rows, mapping);

      expect(analysis.cleaningReport.suspectedDuplicates).toBeUndefined();
      expect(analysis.overview.totalRevenue).toBe(1000000);
      expect(analysis.cleaningReport.validRows).toBe(28);
    });
  });

  // =========================================================================
  // UI-14: Mã hóa đơn tái sử dụng khiến gộp sai đơn
  // =========================================================================
  describe('UI-14: Reused Order IDs & Transaction Disambiguation', () => {
    const mapping: ColumnMappingConfig = {
      dateCol: 'Ngày bán',
      productCol: 'Tên sản phẩm',
      quantityCol: 'Số lượng',
      revenueCol: 'Doanh thu',
      unitPriceCol: 'Đơn giá',
      costPriceCol: 'Giá vốn',
      orderIdCol: 'Mã đơn hàng',
      customerIdCol: 'Mã khách hàng',
      categoryCol: 'Danh mục'
    };

    it('Case order-reused-days.csv: Cùng mã đơn HD1, khác ngày, khác khách tách thành 2 đơn / AOV 60.000đ', () => {
      const rows = readCsvFixture('order-reused-days.csv');
      const analysis = runFullAnalysis(rows, mapping);

      // Tuyệt đối không được gộp thành 1 đơn 120.000đ
      expect(analysis.overview.totalRevenue).toBe(120000);
      expect(analysis.overview.totalOrders).toBe(2);
      expect(analysis.overview.averageOrderValue).toBe(60000);

      // Trạng thái tin cậy ghi nhận sự tái sử dụng mã và đã tách giao dịch
      expect(analysis.overview.hasOrderCollisions).toBe(true);
      expect(analysis.overview.orderIdStatus).toBe('reused_disambiguated');
      expect(analysis.overview.orderIdWarning).toBeDefined();

      // Sản phẩm mua cùng (co-occurrence) không được gộp giả tạo 2 món ở 2 ngày khác nhau
      expect(analysis.productAnalysis.coOccurrences).toHaveLength(0);

      // Phân nhóm khách hàng: KH1 có 1 đơn (100k), KH2 có 1 đơn (20k)
      expect(analysis.customerAnalysis.customers).toHaveLength(2);
      const kh1 = analysis.customerAnalysis.customers.find(c => c.customerId === 'KH1');
      const kh2 = analysis.customerAnalysis.customers.find(c => c.customerId === 'KH2');
      expect(kh1?.ordersCount).toBe(1);
      expect(kh1?.totalSpend).toBe(100000);
      expect(kh2?.ordersCount).toBe(1);
      expect(kh2?.totalSpend).toBe(20000);
    });

    it('Cùng mã đơn, cùng ngày, khác khách hàng: tách thành 2 giao dịch riêng', () => {
      const rows = [
        { 'Ngày bán': '2026-09-30', 'Tên sản phẩm': 'Trà', 'Số lượng': '1', 'Doanh thu': '50000', 'Mã đơn hàng': 'HD99', 'Mã khách hàng': 'KH_A' },
        { 'Ngày bán': '2026-09-30', 'Tên sản phẩm': 'Bánh', 'Số lượng': '1', 'Doanh thu': '50000', 'Mã đơn hàng': 'HD99', 'Mã khách hàng': 'KH_B' }
      ];
      const analysis = runFullAnalysis(rows, mapping);

      expect(analysis.overview.totalOrders).toBe(2);
      expect(analysis.overview.averageOrderValue).toBe(50000);
      expect(analysis.overview.hasOrderCollisions).toBe(true);
      expect(analysis.overview.orderIdStatus).toBe('reused_disambiguated');
    });

    it('Cùng mã đơn, cùng ngày, cùng khách: giữ nguyên 1 đơn hàng nhiều món (giỏ hàng hợp lệ)', () => {
      const rows = [
        { 'Ngày bán': '2026-09-30', 'Tên sản phẩm': 'Trà', 'Số lượng': '1', 'Doanh thu': '30000', 'Mã đơn hàng': 'HD100', 'Mã khách hàng': 'KH1' },
        { 'Ngày bán': '2026-09-30', 'Tên sản phẩm': 'Sữa', 'Số lượng': '2', 'Doanh thu': '40000', 'Mã đơn hàng': 'HD100', 'Mã khách hàng': 'KH1' }
      ];
      const analysis = runFullAnalysis(rows, mapping);

      expect(analysis.overview.totalOrders).toBe(1);
      expect(analysis.overview.averageOrderValue).toBe(70000);
      expect(analysis.overview.hasOrderCollisions).toBe(false);
      expect(analysis.overview.orderIdStatus).toBe('reliable');
    });

    it('Mã đơn thiếu hoặc rỗng: đánh dấu orderIdStatus = missing và hasReliableOrderIds = false', () => {
      const rows = readCsvFixture('order-none.csv');
      const analysis = runFullAnalysis(rows, mapping);

      expect(analysis.overview.hasReliableOrderIds).toBe(false);
      expect(analysis.overview.orderIdStatus).toBe('missing');
    });
  });

  // =========================================================================
  // UI-17: Tỷ trọng doanh thu khách VIP sử dụng mẫu số gây hiểu nhầm
  // =========================================================================
  describe('UI-17: VIP Revenue Share Denominator & Scope', () => {
    it('Case customer-partial.csv: Phân biệt tỷ trọng toàn tiệm (10%) và tỷ trọng nhóm đã nhận diện (100%)', () => {
      const rows = readCsvFixture('customer-partial.csv');
      const mapping: ColumnMappingConfig = {
        dateCol: 'Ngày bán',
        productCol: 'Tên sản phẩm',
        quantityCol: 'Số lượng',
        revenueCol: 'Doanh thu',
        costPriceCol: 'Giá vốn',
        orderIdCol: 'Mã đơn hàng',
        customerIdCol: 'Mã khách hàng'
      };

      const analysis = runFullAnalysis(rows, mapping);

      // Tổng doanh thu cửa hàng = 1.000.000đ
      expect(analysis.overview.totalRevenue).toBe(1000000);
      expect(analysis.customerAnalysis.totalStoreRevenue).toBe(1000000);

      // Doanh thu có mã khách = 100.000đ (KH1), độ phủ = 10%
      expect(analysis.customerAnalysis.identifiedCustomerRevenue).toBe(100000);
      expect(analysis.customerAnalysis.customerRevenueCoverage).toBe(10);

      const vip = analysis.customerAnalysis.segmentsSummary.find(s => s.segment === 'VIP');
      expect(vip).toBeDefined();
      expect(vip?.totalRevenue).toBe(100000);
      // Tỷ trọng trên nhóm đã nhận diện = 100%
      expect(vip?.revenuePercentage).toBe(100);
      // Tỷ trọng trên toàn cửa hàng = 10%
      expect(vip?.storeRevenuePercentage).toBe(10);

      // Nhận xét không được khẳng định 100% doanh thu toàn cửa hàng
      const conclusion = analysis.conclusions.customerRFM;
      expect(conclusion).toContain('10%');
      expect(conclusion).toContain('tổng doanh thu cửa hàng');
      expect(conclusion).toContain('100%');
      expect(conclusion).toContain('nhóm khách đã nhận diện');
      expect(conclusion).toContain('10%');
      expect(conclusion).toContain('độ phủ mã khách');
    });

    it('Độ phủ khách hàng 100%: tỷ trọng toàn cửa hàng và tỷ trọng nhóm khách bằng nhau', () => {
      const rows = [
        { 'Ngày bán': '2026-09-30', 'Tên sản phẩm': 'Trà', 'Số lượng': '1', 'Doanh thu': '100000', 'Mã đơn hàng': 'HD1', 'Mã khách hàng': 'KH1' },
        { 'Ngày bán': '2026-09-30', 'Tên sản phẩm': 'Bánh', 'Số lượng': '1', 'Doanh thu': '900000', 'Mã đơn hàng': 'HD2', 'Mã khách hàng': 'KH2' }
      ];
      const mapping: ColumnMappingConfig = {
        dateCol: 'Ngày bán', productCol: 'Tên sản phẩm', quantityCol: 'Số lượng',
        revenueCol: 'Doanh thu', orderIdCol: 'Mã đơn hàng', customerIdCol: 'Mã khách hàng'
      };
      const analysis = runFullAnalysis(rows, mapping);

      expect(analysis.customerAnalysis.customerRevenueCoverage).toBe(100);
      const vip = analysis.customerAnalysis.segmentsSummary.find(s => s.segment === 'VIP');
      if (vip) {
        expect(vip.storeRevenuePercentage).toBe(vip.revenuePercentage);
      }
    });

    it('Không có mã khách: hasCustomerData = false và nhận xét yêu cầu cột khách hàng', () => {
      const rows = [
        { 'Ngày bán': '2026-09-30', 'Tên sản phẩm': 'Trà', 'Số lượng': '1', 'Doanh thu': '100000', 'Mã đơn hàng': 'HD1' }
      ];
      const mapping: ColumnMappingConfig = {
        dateCol: 'Ngày bán', productCol: 'Tên sản phẩm', quantityCol: 'Số lượng',
        revenueCol: 'Doanh thu', orderIdCol: 'Mã đơn hàng'
      };
      const analysis = runFullAnalysis(rows, mapping);

      expect(analysis.customerAnalysis.hasCustomerData).toBe(false);
      expect(analysis.conclusions.customerRFM).toContain('Cần thêm cột Mã khách hàng');
    });
  });

  // =========================================================================
  // UI-05: Độ tin cậy của RFM/VIP khi mã đơn không đáng tin cậy
  // =========================================================================
  describe('UI-05: RFM/VIP Reliability Consistency', () => {
    it('Khi thiếu mã đơn (order-none.csv), nhận xét RFM thông báo chưa đủ điều kiện phân nhóm', () => {
      const rows = readCsvFixture('order-none.csv');
      const mapping: ColumnMappingConfig = {
        dateCol: 'Ngày bán', productCol: 'Tên sản phẩm', quantityCol: 'Số lượng',
        revenueCol: 'Doanh thu', orderIdCol: 'Mã đơn hàng', customerIdCol: 'Mã khách hàng'
      };
      const analysis = runFullAnalysis(rows, mapping);

      // Mã đơn không tin cậy
      expect(analysis.overview.hasReliableOrderIds).toBe(false);

      // Nhận xét customerRFM phải yêu cầu mã đơn đầy đủ, không tự nhận xét VIP bừa bãi
      expect(analysis.conclusions.customerRFM).toContain('Cần thêm mã hóa đơn đầy đủ');
      expect(analysis.conclusions.customerRFM).not.toContain('khách VIP');

      // Doanh thu và sản phẩm vẫn được tính toán chuẩn xác
      expect(analysis.overview.totalRevenue).toBe(120000);
      expect(analysis.productAnalysis.products).toHaveLength(2);
    });
  });

  // =========================================================================
  // UI-10: Nhận xét sản phẩm đang lỗ nhưng nhận xét lại đòi giá vốn
  // =========================================================================
  describe('UI-10: Negative Profit / Loss Product Conclusions', () => {
    it('Case negative-profit.csv: Có giá vốn 100%, lỗ -40.000đ, nhận xét phản ánh đúng lỗ, KHÔNG báo thiếu giá vốn', () => {
      const rows = readCsvFixture('negative-profit.csv');
      const mapping: ColumnMappingConfig = {
        dateCol: 'Ngày bán', productCol: 'Tên sản phẩm', quantityCol: 'Số lượng',
        revenueCol: 'Doanh thu', costPriceCol: 'Giá vốn', orderIdCol: 'Mã đơn hàng'
      };
      const analysis = runFullAnalysis(rows, mapping);

      // Số liệu lợi nhuận âm chuẩn xác
      expect(analysis.overview.totalRevenue).toBe(100000);
      expect(analysis.overview.totalProfit).toBe(-40000);
      expect(analysis.overview.profitMargin).toBe(-40);
      expect(analysis.overview.costCoverage).toBe(100);

      // Sản phẩm ghi nhận lỗ
      expect(analysis.productAnalysis.hasCostPrice).toBe(true);
      expect(analysis.productAnalysis.topProfitable).toHaveLength(0); // Không có sản phẩm lãi dương
      expect(analysis.productAnalysis.topLossMaking).toHaveLength(1);
      expect(analysis.productAnalysis.topLossMaking[0].name).toBe('Trà');
      expect(analysis.productAnalysis.topLossMaking[0].profit).toBe(-40000);

      // Nhận xét TUYỆT ĐỐI KHÔNG yêu cầu "Cần nhập cột Giá vốn"
      const conclusion = analysis.conclusions.productProfit;
      expect(conclusion).not.toContain('Cần nhập cột Giá vốn');
      expect(conclusion).toContain('lợi nhuận âm');
      expect(conclusion).toContain('Trà');
      expect(conclusion).toContain('-40.000 đ');
      expect(conclusion).toContain('-40%');
    });

    it('Trường hợp hòa vốn (profit === 0): nhận xét phản ánh đúng hòa vốn', () => {
      const prodAnalysis = calculateProductMetrics([{
        rowIndex: 1, orderId: 'HD1', date: '2026-09-01', monthStr: '2026-09', timestamp: 1000,
        productId: 'Nước lọc', productName: 'Nước lọc', category: 'Chung',
        quantity: 2, unitPrice: 10000, revenue: 20000, costPrice: 10000, totalCost: 20000, profit: 0, customerId: null
      }]);

      const conclusion = generateProfitMarginConclusion(prodAnalysis);
      expect(conclusion).not.toContain('Cần nhập cột Giá vốn');
      expect(conclusion).toContain('hòa vốn');
    });

    it('Trường hợp có cả sản phẩm lãi và lỗ: nhận xét sản phẩm lãi cao nhất và cảnh báo sản phẩm lỗ', () => {
      const prodAnalysis = calculateProductMetrics([
        {
          rowIndex: 1, orderId: 'HD1', date: '2026-09-01', monthStr: '2026-09', timestamp: 1000,
          productId: 'Cà phê', productName: 'Cà phê', category: 'Chung',
          quantity: 2, unitPrice: 25000, revenue: 50000, costPrice: 15000, totalCost: 30000, profit: 20000, customerId: null
        },
        {
          rowIndex: 2, orderId: 'HD2', date: '2026-09-01', monthStr: '2026-09', timestamp: 1000,
          productId: 'Bánh mì', productName: 'Bánh mì', category: 'Chung',
          quantity: 1, unitPrice: 10000, revenue: 10000, costPrice: 15000, totalCost: 15000, profit: -5000, customerId: null
        }
      ]);

      const conclusion = generateProfitMarginConclusion(prodAnalysis);
      expect(conclusion).toContain('Cà phê');
      expect(conclusion).toContain('20.000 đ');
      expect(conclusion).toContain('1 mặt hàng đang bán thấp hơn giá vốn');
    });

    it('Trường hợp hoàn toàn không có giá vốn: yêu cầu nhập cột giá vốn', () => {
      const prodAnalysis = calculateProductMetrics([{
        rowIndex: 1, orderId: 'HD1', date: '2026-09-01', monthStr: '2026-09', timestamp: 1000,
        productId: 'Kẹo', productName: 'Kẹo', category: 'Chung',
        quantity: 1, unitPrice: 5000, revenue: 5000, costPrice: null, totalCost: null, profit: null, customerId: null
      }]);

      const conclusion = generateProfitMarginConclusion(prodAnalysis);
      expect(conclusion).toContain('Cần nhập cột Giá vốn');
    });
  });

  // =========================================================================
  // UI-18: Nhận xét khách hàng quay lại tích cực dù tất cả chỉ mua một lần
  // =========================================================================
  describe('UI-18: Customer Retention & Repeat Customer Rate', () => {
    it('Case same-day-customers.csv: 6 khách đều F=1, repeat rate = 0%, KHÔNG nhận xét quay lại tích cực', () => {
      const rows = readCsvFixture('same-day-customers.csv');
      const mapping: ColumnMappingConfig = {
        dateCol: 'Ngày bán', productCol: 'Tên sản phẩm', quantityCol: 'Số lượng',
        revenueCol: 'Doanh thu', costPriceCol: 'Giá vốn', orderIdCol: 'Mã đơn hàng',
        customerIdCol: 'Mã khách hàng', categoryCol: 'Danh mục'
      };
      const analysis = runFullAnalysis(rows, mapping);

      expect(analysis.customerAnalysis.totalCustomers).toBe(6);
      expect(analysis.customerAnalysis.repeatCustomersCount).toBe(0);
      expect(analysis.customerAnalysis.repeatCustomerRate).toBe(0);

      // Nhận xét TUYỆT ĐỐI KHÔNG khẳng định tỷ lệ quay lại tích cực
      const conclusion = analysis.conclusions.customerRFM;
      expect(conclusion).not.toContain('tỷ lệ khách quay lại mua sắm rất tích cực');
      expect(conclusion).toContain('Toàn bộ **6 khách hàng** đều mới phát sinh 1 đơn hàng trong kỳ dữ liệu (chưa có lượt mua lặp lại)');
    });

    it('Trường hợp có khách quay lại (F >= 2): ghi nhận đúng số lượng và tỷ lệ % mua lặp', () => {
      const rows = [
        { 'Ngày bán': '2026-09-01', 'Tên sản phẩm': 'Trà', 'Số lượng': '1', 'Doanh thu': '50000', 'Mã đơn hàng': 'HD1', 'Mã khách hàng': 'KH1' },
        { 'Ngày bán': '2026-09-10', 'Tên sản phẩm': 'Trà', 'Số lượng': '1', 'Doanh thu': '50000', 'Mã đơn hàng': 'HD2', 'Mã khách hàng': 'KH1' },
        { 'Ngày bán': '2026-09-15', 'Tên sản phẩm': 'Bánh', 'Số lượng': '1', 'Doanh thu': '30000', 'Mã đơn hàng': 'HD3', 'Mã khách hàng': 'KH2' }
      ];
      const mapping: ColumnMappingConfig = {
        dateCol: 'Ngày bán', productCol: 'Tên sản phẩm', quantityCol: 'Số lượng',
        revenueCol: 'Doanh thu', orderIdCol: 'Mã đơn hàng', customerIdCol: 'Mã khách hàng'
      };
      const analysis = runFullAnalysis(rows, mapping);

      expect(analysis.customerAnalysis.totalCustomers).toBe(2);
      expect(analysis.customerAnalysis.repeatCustomersCount).toBe(1); // KH1 có 2 đơn
      expect(analysis.customerAnalysis.repeatCustomerRate).toBe(50); // 1/2 = 50%

      expect(analysis.conclusions.customerRFM).toContain('Có **1/2 khách hàng** (50%) đã quay lại mua sắm từ 2 lần trở lên');
    });
  });

  // =========================================================================
  // UI-12: Bảo mật và độ tin cậy của thư viện Excel
  // =========================================================================
  describe('UI-12: Excel Parsing & Security Verification', () => {
    it('Đọc chuẩn xác file XLSX thông thường (excel-first-normal.xlsx)', () => {
      const filePath = path.join(FIXTURES_DIR, 'excel-first-normal.xlsx');
      const buffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet);

      expect(rows.length).toBeGreaterThan(0);
      expect(Object.keys(rows[0])).toContain('Ngày bán');
      expect(Object.keys(rows[0])).toContain('Tên sản phẩm');
    });

    it('Đọc chuẩn xác file XLS legacy định dạng cũ (legacy.xls)', () => {
      const filePath = path.join(FIXTURES_DIR, 'legacy.xls');
      const buffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet);

      expect(rows.length).toBeGreaterThan(0);
      expect(workbook.SheetNames.length).toBeGreaterThanOrEqual(1);
    });

    it('Xử lý an toàn file Excel có ô trống (excel-blanks.xlsx)', () => {
      const filePath = path.join(FIXTURES_DIR, 'excel-blanks.xlsx');
      const buffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' });

      expect(rows.length).toBeGreaterThan(0);
    });

    it('Xử lý chuẩn xác ngày Excel Serial (excel-date-serial.xlsx)', () => {
      const filePath = path.join(FIXTURES_DIR, 'excel-date-serial.xlsx');
      const buffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet);

      expect(rows.length).toBeGreaterThan(0);
      const dateVal = rows[0]['Ngày bán'];
      // Serial date được parseFlexibleDate xử lý chính xác
      const parsed = parseFlexibleDate(dateVal);
      expect(parsed).not.toBeNull();
      expect(parsed?.dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('Bảo toàn ký tự Unicode tiếng Việt có dấu trong dữ liệu bán hàng', () => {
      const sampleNames = ['Cà phê sữa đá', 'Trà lài đường phèn', 'Bánh mì chả lụa'];
      for (const name of sampleNames) {
        const rows = [{
          'Ngày bán': '2026-09-01',
          'Tên sản phẩm': name,
          'Số lượng': '2',
          'Doanh thu': '50000',
          'Mã đơn hàng': 'HD_TEST'
        }];
        const mapping: ColumnMappingConfig = {
          dateCol: 'Ngày bán', productCol: 'Tên sản phẩm', quantityCol: 'Số lượng',
          revenueCol: 'Doanh thu', orderIdCol: 'Mã đơn hàng'
        };
        const analysis = runFullAnalysis(rows, mapping);
        expect(analysis.productAnalysis.products[0].name).toBe(name);
      }
    });
  });
});
