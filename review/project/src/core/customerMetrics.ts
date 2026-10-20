// src/core/customerMetrics.ts
import { CleanRow, CustomerAnalysisResult, CustomerMetricsItem, RFMSegment } from './types';

export function calculateCustomerMetrics(cleanRows: CleanRow[]): CustomerAnalysisResult {
  // Kiểm tra có dữ liệu khách hàng không
  const hasCust = cleanRows.some(r => r.customerId && r.customerId.trim() !== '');

  if (!hasCust || cleanRows.length === 0) {
    return {
      hasCustomerData: false,
      customers: [],
      totalCustomers: 0,
      segmentsSummary: [],
      topCustomers: [],
      vipCustomers: [],
      atRiskCustomers: [],
      churnedCustomers: [],
      newCustomers: []
    };
  }

  // Tìm ngày giao dịch mới nhất trong toàn bộ dữ liệu làm mốc tính Recency
  let maxTimestamp = -Infinity;
  for (const r of cleanRows) {
    if (r.timestamp > maxTimestamp) {
      maxTimestamp = r.timestamp;
    }
  }

  // 1. Gom nhóm theo khách hàng
  interface CustomerAgg {
    id: string;
    name?: string;
    orders: Set<string>;
    totalSpend: number;
    lastDate: string;
    lastTimestamp: number;
    firstDate: string;
    firstTimestamp: number;
  }

  const custMap = new Map<string, CustomerAgg>();

  for (const r of cleanRows) {
    if (!r.customerId) continue;
    const cid = r.customerId.trim();

    let agg = custMap.get(cid);
    if (!agg) {
      agg = {
        id: cid,
        name: cid, // Nếu có tên khách trong tương lai thì gắn vào
        orders: new Set(),
        totalSpend: 0,
        lastDate: r.date,
        lastTimestamp: r.timestamp,
        firstDate: r.date,
        firstTimestamp: r.timestamp
      };
      custMap.set(cid, agg);
    }

    agg.orders.add(r.orderId);
    agg.totalSpend += r.revenue;

    if (r.timestamp > agg.lastTimestamp) {
      agg.lastTimestamp = r.timestamp;
      agg.lastDate = r.date;
    }
    if (r.timestamp < agg.firstTimestamp) {
      agg.firstTimestamp = r.timestamp;
      agg.firstDate = r.date;
    }
  }

  const allCustomers = Array.from(custMap.values());
  const totalCustomers = allCustomers.length;
  if (totalCustomers === 0) {
    return {
      hasCustomerData: false,
      customers: [],
      totalCustomers: 0,
      segmentsSummary: [],
      topCustomers: [],
      vipCustomers: [],
      atRiskCustomers: [],
      churnedCustomers: [],
      newCustomers: []
    };
  }

  // Sắp xếp theo Monetary để tìm ngưỡng Khách hàng chi tiêu cao
  allCustomers.sort((a, b) => b.totalSpend - a.totalSpend);
  const avgSpend = allCustomers.reduce((sum, c) => sum + c.totalSpend, 0) / (totalCustomers || 1);
  const vipIndex = Math.min(allCustomers.length - 1, Math.max(0, Math.floor(totalCustomers * 0.2)));
  // Ngưỡng chi tiêu cao: lấy phân vị top 20% hoặc lớn hơn mức trung bình
  const vipSpendThreshold = Math.min(allCustomers[vipIndex].totalSpend, avgSpend * 1.2);

  const ONE_DAY_MS = 1000 * 60 * 60 * 24;
  const customerItems: CustomerMetricsItem[] = [];

  for (const c of allCustomers) {
    const daysSinceLastOrder = Math.max(0, Math.round((maxTimestamp - c.lastTimestamp) / ONE_DAY_MS));
    const ordersCount = c.orders.size > 0 ? c.orders.size : 1;
    const aov = c.totalSpend / ordersCount;

    // Phân nhóm RFM thân thiện cho bán lẻ:
    let segment: RFMSegment = 'Bình thường';
    let actionAdvice = '';

    const isHighSpend = c.totalSpend >= vipSpendThreshold;
    const isFrequent = ordersCount >= 4;

    if (isHighSpend) {
      if (daysSinceLastOrder <= 60) {
        segment = 'VIP';
        actionAdvice = 'Khách VIP đang mua đều. Nên gửi quà tri ân, chăm sóc đặc quyền.';
      } else {
        segment = 'Có nguy cơ rời đi';
        actionAdvice = 'Từng chi tiêu nhiều nhưng quá 60 ngày chưa quay lại. Cần liên hệ ngay!';
      }
    } else if (isFrequent) {
      if (daysSinceLastOrder <= 60) {
        segment = 'Trung thành';
        actionAdvice = 'Khách mua thường xuyên. Tặng voucher hoặc điểm tích lũy để duy trì thói quen.';
      } else {
        segment = 'Có nguy cơ rời đi';
        actionAdvice = 'Khách quen nhưng lâu không thấy ghé. Nhắn tin hỏi thăm gợi ý sản phẩm mới.';
      }
    } else if (ordersCount === 1) {
      if (daysSinceLastOrder <= 45) {
        segment = 'Mới';
        actionAdvice = 'Khách hàng mới phát sinh đơn đầu tiên. Gửi ưu đãi cho lần mua tiếp theo.';
      } else if (daysSinceLastOrder > 120) {
        segment = 'Đã ngừng mua';
        actionAdvice = 'Khách chỉ mua 1 lần từ lâu. Không cần tốn quá nhiều chi phí tiếp thị.';
      } else {
        segment = 'Bình thường';
        actionAdvice = 'Khách vãng lai, theo dõi thêm.';
      }
    } else {
      if (daysSinceLastOrder > 90) {
        segment = 'Đã ngừng mua';
        actionAdvice = 'Đã lâu không mua hàng.';
      } else {
        segment = 'Bình thường';
        actionAdvice = 'Duy trì chăm sóc tiêu chuẩn.';
      }
    }

    // Điểm RFM đơn giản (1 đến 5)
    const rScore = daysSinceLastOrder <= 30 ? 5 : (daysSinceLastOrder <= 60 ? 4 : (daysSinceLastOrder <= 90 ? 3 : (daysSinceLastOrder <= 180 ? 2 : 1)));
    const fScore = ordersCount >= 8 ? 5 : (ordersCount >= 5 ? 4 : (ordersCount >= 3 ? 3 : (ordersCount >= 2 ? 2 : 1)));
    const mScore = isHighSpend ? 5 : (c.totalSpend >= vipSpendThreshold * 0.5 ? 4 : (c.totalSpend >= vipSpendThreshold * 0.25 ? 3 : 2));

    customerItems.push({
      customerId: c.id,
      customerName: c.name,
      ordersCount,
      totalSpend: Math.round(c.totalSpend),
      averageOrderValue: Math.round(aov),
      lastOrderDate: c.lastDate,
      daysSinceLastOrder,
      firstOrderDate: c.firstDate,
      rfmScore: { r: rScore, f: fScore, m: mScore, total: rScore + fScore + mScore },
      segment,
      actionAdvice
    });
  }

  // Tổng hợp tỷ trọng các nhóm
  const totalStoreCustomerSpend = customerItems.reduce((sum, c) => sum + c.totalSpend, 0);
  const segmentOrder: RFMSegment[] = ['VIP', 'Trung thành', 'Mới', 'Có nguy cơ rời đi', 'Đã ngừng mua', 'Bình thường'];

  const segmentsSummary = segmentOrder.map(seg => {
    const list = customerItems.filter(c => c.segment === seg);
    const count = list.length;
    const spend = list.reduce((sum, c) => sum + c.totalSpend, 0);
    return {
      segment: seg,
      count,
      percentage: totalCustomers > 0 ? parseFloat(((count / totalCustomers) * 100).toFixed(1)) : 0,
      totalRevenue: Math.round(spend),
      revenuePercentage: totalStoreCustomerSpend > 0 ? parseFloat(((spend / totalStoreCustomerSpend) * 100).toFixed(1)) : 0
    };
  });

  return {
    hasCustomerData: true,
    customers: customerItems,
    totalCustomers,
    segmentsSummary,
    topCustomers: [...customerItems].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 15),
    vipCustomers: customerItems.filter(c => c.segment === 'VIP'),
    atRiskCustomers: customerItems.filter(c => c.segment === 'Có nguy cơ rời đi'),
    churnedCustomers: customerItems.filter(c => c.segment === 'Đã ngừng mua'),
    newCustomers: customerItems.filter(c => c.segment === 'Mới')
  };
}
