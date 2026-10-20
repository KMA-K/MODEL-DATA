// src/test/productMetrics.test.ts
import { describe, expect, it } from 'vitest';
import { calculateProductMetrics } from '../core/productMetrics';
import { CleanRow } from '../core/types';

describe('Chỉ số Sản phẩm & Phân loại Pareto ABC (Product Metrics)', () => {
  const sampleRows: CleanRow[] = [
    // Tháng 1: SP1 bán 80k, SP2 bán 15k, SP3 bán 5k (Tổng 100k)
    {
      rowIndex: 1,
      orderId: 'DH10',
      date: '2026-01-15',
      monthStr: '2026-01',
      timestamp: new Date('2026-01-15').getTime(),
      productId: 'SP1',
      productName: 'Mặt hàng Chủ lực',
      category: 'Đồ uống',
      quantity: 8,
      unitPrice: 10000,
      revenue: 80000,
      costPrice: 5000,
      totalCost: 40000,
      profit: 40000,
      customerId: 'KH1'
    },
    {
      rowIndex: 2,
      orderId: 'DH10', // Cùng mua trong DH10 với SP1
      date: '2026-01-15',
      monthStr: '2026-01',
      timestamp: new Date('2026-01-15').getTime(),
      productId: 'SP2',
      productName: 'Mặt hàng Trung bình',
      category: 'Bánh kẹo',
      quantity: 3,
      unitPrice: 5000,
      revenue: 15000,
      costPrice: 3000,
      totalCost: 9000,
      profit: 6000,
      customerId: 'KH1'
    },
    {
      rowIndex: 3,
      orderId: 'DH11',
      date: '2026-01-20',
      monthStr: '2026-01',
      timestamp: new Date('2026-01-20').getTime(),
      productId: 'SP3',
      productName: 'Mặt hàng Bán chậm',
      category: 'Văn phòng phẩm',
      quantity: 1,
      unitPrice: 5000,
      revenue: 5000,
      costPrice: 4000,
      totalCost: 4000,
      profit: 1000,
      customerId: 'KH2'
    },
    // Tháng 2: SP1 tăng doanh thu lên 100k (>10%), SP3 giảm xuống 2k (<-10%)
    {
      rowIndex: 4,
      orderId: 'DH12',
      date: '2026-02-10',
      monthStr: '2026-02',
      timestamp: new Date('2026-02-10').getTime(),
      productId: 'SP1',
      productName: 'Mặt hàng Chủ lực',
      category: 'Đồ uống',
      quantity: 10,
      unitPrice: 10000,
      revenue: 100000,
      costPrice: 5000,
      totalCost: 50000,
      profit: 50000,
      customerId: 'KH3'
    },
    {
      rowIndex: 5,
      orderId: 'DH13',
      date: '2026-02-12',
      monthStr: '2026-02',
      timestamp: new Date('2026-02-12').getTime(),
      productId: 'SP3',
      productName: 'Mặt hàng Bán chậm',
      category: 'Văn phòng phẩm',
      quantity: 1,
      unitPrice: 2000,
      revenue: 2000,
      costPrice: 1800,
      totalCost: 1800,
      profit: 200,
      customerId: 'KH4'
    }
  ];

  it('Phân loại Pareto ABC chính xác theo tỷ trọng doanh thu', () => {
    const result = calculateProductMetrics(sampleRows);
    const prodA = result.products.find(p => p.name === 'Mặt hàng Chủ lực');
    const prodB = result.products.find(p => p.name === 'Mặt hàng Trung bình');
    const prodC = result.products.find(p => p.name === 'Mặt hàng Bán chậm');

    expect(prodA?.abcGroup).toBe('A');
    expect(prodA?.recommendation).toBe('Đáng đầu tư');

    expect(prodB?.abcGroup).toBe('B');

    expect(prodC?.abcGroup).toBe('C');
    expect(prodC?.recommendation).toBe('Cân nhắc loại bỏ');
  });

  it('Tính toán xu hướng tháng gần nhất (Tăng trưởng vs Giảm sút)', () => {
    const result = calculateProductMetrics(sampleRows);
    const prodA = result.products.find(p => p.name === 'Mặt hàng Chủ lực');
    const prodC = result.products.find(p => p.name === 'Mặt hàng Bán chậm');

    // SP1 từ 80k lên 100k -> Tăng trưởng
    expect(prodA?.trend).toBe('Tăng trưởng');
    // SP3 từ 5k xuống 2k -> Giảm sút
    expect(prodC?.trend).toBe('Giảm sút');
  });

  it('Phát hiện cặp sản phẩm hay mua cùng nhau khi có mã đơn hàng', () => {
    const result = calculateProductMetrics(sampleRows);
    expect(result.hasOrderId).toBe(true);
    expect(result.coOccurrences.length).toBeGreaterThan(0);

    const pair = result.coOccurrences[0];
    const names = [pair.productA, pair.productB];
    expect(names).toContain('Mặt hàng Chủ lực');
    expect(names).toContain('Mặt hàng Trung bình');
    expect(pair.count).toBe(1);
  });
});
