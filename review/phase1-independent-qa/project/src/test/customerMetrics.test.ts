// src/test/customerMetrics.test.ts
import { describe, expect, it } from 'vitest';
import { calculateCustomerMetrics } from '../core/customerMetrics';
import { CleanRow } from '../core/types';

describe('Phân tích Khách hàng & Phân khúc RFM (Customer Metrics)', () => {
  it('Khi không có mã khách hàng, trả về hasCustomerData: false để giao diện ẩn an toàn', () => {
    const rowsWithoutCustomer: CleanRow[] = [
      {
        rowIndex: 1,
        orderId: 'DH1',
        date: '2026-03-01',
        monthStr: '2026-03',
        timestamp: new Date('2026-03-01').getTime(),
        productId: 'SP1',
        productName: 'SP 1',
        category: 'Chung',
        quantity: 1,
        unitPrice: 10000,
        revenue: 10000,
        costPrice: null,
        totalCost: null,
        profit: null,
        customerId: null // Thiếu mã khách
      }
    ];

    const result = calculateCustomerMetrics(rowsWithoutCustomer);
    expect(result.hasCustomerData).toBe(false);
    expect(result.totalCustomers).toBe(0);
    expect(result.vipCustomers.length).toBe(0);
  });

  it('Phân loại chính xác khách VIP, Có nguy cơ rời đi và Mới', () => {
    // Ngày tham chiếu mới nhất: 2026-04-01
    const baseDate = new Date('2026-04-01').getTime();
    const dayMs = 24 * 3600 * 1000;

    const rowsWithCustomers: CleanRow[] = [
      // KH_VIP: Chi tiêu rất cao (10 triệu), mua gần đây (5 ngày trước)
      {
        rowIndex: 1,
        orderId: 'DH_V1',
        date: '2026-03-27',
        monthStr: '2026-03',
        timestamp: baseDate - 5 * dayMs,
        productId: 'SP1',
        productName: 'Mặt hàng cao cấp',
        category: 'Đồ gia dụng',
        quantity: 10,
        unitPrice: 1000000,
        revenue: 10000000,
        costPrice: 700000,
        totalCost: 7000000,
        profit: 3000000,
        customerId: 'KH_VIP'
      },
      // KH_AT_RISK: Từng chi tiêu cao (8 triệu) nhưng mua cách đây 80 ngày (>60 ngày)
      {
        rowIndex: 2,
        orderId: 'DH_R1',
        date: '2026-01-10',
        monthStr: '2026-01',
        timestamp: baseDate - 81 * dayMs,
        productId: 'SP1',
        productName: 'Mặt hàng cao cấp',
        category: 'Đồ gia dụng',
        quantity: 8,
        unitPrice: 1000000,
        revenue: 8000000,
        costPrice: 700000,
        totalCost: 5600000,
        profit: 2400000,
        customerId: 'KH_AT_RISK'
      },
      // KH_NEW: Khách mới mua đơn đầu tiên cách đây 10 ngày
      {
        rowIndex: 3,
        orderId: 'DH_N1',
        date: '2026-03-22',
        monthStr: '2026-03',
        timestamp: baseDate - 10 * dayMs,
        productId: 'SP2',
        productName: 'Mặt hàng nhỏ',
        category: 'Đồ uống',
        quantity: 2,
        unitPrice: 50000,
        revenue: 100000,
        costPrice: 30000,
        totalCost: 60000,
        profit: 40000,
        customerId: 'KH_NEW'
      }
    ];

    const result = calculateCustomerMetrics(rowsWithCustomers);
    expect(result.hasCustomerData).toBe(true);
    expect(result.totalCustomers).toBe(3);

    const vip = result.topCustomers.find(c => c.customerId === 'KH_VIP');
    const atRisk = result.topCustomers.find(c => c.customerId === 'KH_AT_RISK');
    const newCust = result.topCustomers.find(c => c.customerId === 'KH_NEW');

    expect(vip?.segment).toBe('VIP');
    expect(atRisk?.segment).toBe('Có nguy cơ rời đi');
    expect(newCust?.segment).toBe('Mới');
  });
});
