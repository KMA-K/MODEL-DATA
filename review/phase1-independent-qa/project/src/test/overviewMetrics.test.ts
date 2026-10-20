// src/test/overviewMetrics.test.ts
import { describe, expect, it } from 'vitest';
import { calculateOverviewMetrics } from '../core/overviewMetrics';
import { CleanRow } from '../core/types';

describe('Chỉ số Tổng quan (Overview Metrics) & Kiểm tra tính toán độc lập', () => {
  const sampleCleanRows: CleanRow[] = [
    {
      rowIndex: 1,
      orderId: 'DH001',
      date: '2026-01-10',
      monthStr: '2026-01',
      timestamp: new Date('2026-01-10').getTime(),
      productId: 'SP_A',
      productName: 'Sản phẩm A',
      category: 'Đồ uống',
      quantity: 10,
      unitPrice: 10000,
      revenue: 100000,
      costPrice: 6000,
      totalCost: 60000,
      profit: 40000,
      customerId: 'KH01'
    },
    {
      rowIndex: 2,
      orderId: 'DH001',
      date: '2026-01-10',
      monthStr: '2026-01',
      timestamp: new Date('2026-01-10').getTime(),
      productId: 'SP_B',
      productName: 'Sản phẩm B',
      category: 'Bánh kẹo',
      quantity: 5,
      unitPrice: 20000,
      revenue: 100000,
      costPrice: 12000,
      totalCost: 60000,
      profit: 40000,
      customerId: 'KH01'
    },
    {
      rowIndex: 3,
      orderId: 'DH002',
      date: '2026-01-12',
      monthStr: '2026-01',
      timestamp: new Date('2026-01-12').getTime(),
      productId: 'SP_C',
      productName: 'Sản phẩm C',
      category: 'Gia vị',
      quantity: 2,
      unitPrice: 50000,
      revenue: 100000,
      costPrice: 35000,
      totalCost: 70000,
      profit: 30000,
      customerId: 'KH02'
    }
  ];

  it('Kiểm tra tay con số 1: Tổng doanh thu và số lượng bán', () => {
    const result = calculateOverviewMetrics(sampleCleanRows);
    // Tính toán tay: 100.000 + 100.000 + 100.000 = 300.000 VND
    expect(result.totalRevenue).toBe(300000);
    // Tính toán tay: 10 + 5 + 2 = 17 món
    expect(result.totalQuantity).toBe(17);
  });

  it('Kiểm tra tay con số 2: Số đơn hàng và Giá trị đơn trung bình (AOV)', () => {
    const result = calculateOverviewMetrics(sampleCleanRows);
    // Tính toán tay: Có 2 đơn hàng duy nhất là DH001 và DH002
    expect(result.totalOrders).toBe(2);
    // AOV = 300.000 / 2 = 150.000 VND
    expect(result.averageOrderValue).toBe(150000);
  });

  it('Kiểm tra tay con số 3: Lợi nhuận gộp và Tỷ suất lợi nhuận %', () => {
    const result = calculateOverviewMetrics(sampleCleanRows);
    // Tính toán tay: 40.000 + 40.000 + 30.000 = 110.000 VND
    expect(result.totalProfit).toBe(110000);
    // Tỷ suất LN gộp: (110.000 / 300.000) * 100 = 36.666...% -> làm tròn 36.7%
    expect(result.profitMargin).toBe(36.7);
  });

  it('Khi không có dữ liệu giá vốn, Lợi nhuận gộp phải là null (không hiển thị số 0 sai lệch)', () => {
    const rowsNoCost: CleanRow[] = sampleCleanRows.map(r => ({
      ...r,
      costPrice: null,
      totalCost: null,
      profit: null
    }));

    const result = calculateOverviewMetrics(rowsNoCost);
    expect(result.totalProfit).toBeNull();
    expect(result.profitMargin).toBeNull();
  });
});
