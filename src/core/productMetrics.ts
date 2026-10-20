// src/core/productMetrics.ts
import { 
  ABCGroup, 
  CleanRow, 
  CoOccurrenceItem, 
  ProductAnalysisResult, 
  ProductMetricsItem, 
  TrendDirection 
} from './types';

export function calculateProductMetrics(cleanRows: CleanRow[]): ProductAnalysisResult {
  if (cleanRows.length === 0) {
    return {
      products: [],
      abcSummary: {
        groupA: { count: 0, revenue: 0, percentage: 0 },
        groupB: { count: 0, revenue: 0, percentage: 0 },
        groupC: { count: 0, revenue: 0, percentage: 0 }
      },
      topProfitable: [],
      topLossMaking: [],
      topRevenue: [],
      slowMoving: [],
      coOccurrences: [],
      hasCostPrice: false,
      hasOrderId: false
    };
  }

  // 1. Thu thập danh sách các tháng có trong dữ liệu (sắp xếp tăng dần)
  const allMonthsSet = new Set<string>();
  cleanRows.forEach(r => allMonthsSet.add(r.monthStr));
  const sortedMonths = Array.from(allMonthsSet).sort();
  const lastMonth = sortedMonths[sortedMonths.length - 1];
  const prevMonth = sortedMonths.length >= 2 ? sortedMonths[sortedMonths.length - 2] : null;

  // 2. Gom nhóm theo sản phẩm
  interface ProductAgg {
    id: string;
    name: string;
    category: string;
    quantity: number;
    revenue: number;
    costTotal: number;
    coveredRevenue: number;
    hasCostCount: number;
    orderSet: Set<string>;
    monthlyQty: Map<string, number>;
    monthlyRev: Map<string, number>;
  }

  const prodMap = new Map<string, ProductAgg>();
  let hasAnyCost = false;
  let hasValidOrderId = false;

  // Dùng để phân tích cặp mua cùng nhau
  const orderItemsMap = new Map<string, Set<string>>();

  for (const row of cleanRows) {
    if (row.orderId && !row.orderId.startsWith('AUTO-')) {
      hasValidOrderId = true;
    }

    // Nhóm sản phẩm trong từng đơn hàng
    if (!orderItemsMap.has(row.orderId)) {
      orderItemsMap.set(row.orderId, new Set());
    }
    orderItemsMap.get(row.orderId)!.add(row.productName);

    let agg = prodMap.get(row.productName);
    if (!agg) {
      agg = {
        id: row.productId,
        name: row.productName,
        category: row.category,
        quantity: 0,
        revenue: 0,
        costTotal: 0,
        coveredRevenue: 0,
        hasCostCount: 0,
        orderSet: new Set(),
        monthlyQty: new Map(),
        monthlyRev: new Map()
      };
      prodMap.set(row.productName, agg);
    }

    agg.quantity += row.quantity;
    agg.revenue += row.revenue;
    agg.orderSet.add(row.orderId);

    if (row.totalCost !== null) {
      hasAnyCost = true;
      agg.costTotal += row.totalCost;
      agg.coveredRevenue += row.revenue;
      agg.hasCostCount += row.quantity;
    }

    const currentMQty = agg.monthlyQty.get(row.monthStr) || 0;
    agg.monthlyQty.set(row.monthStr, currentMQty + row.quantity);

    const currentMRev = agg.monthlyRev.get(row.monthStr) || 0;
    agg.monthlyRev.set(row.monthStr, currentMRev + row.revenue);
  }

  const totalStoreRevenue = Array.from(prodMap.values()).reduce((sum, p) => sum + p.revenue, 0);

  // 3. Sắp xếp giảm dần theo doanh thu để phân loại ABC
  const sortedProds = Array.from(prodMap.values()).sort((a, b) => b.revenue - a.revenue);

  let cumulativeRevenue = 0;
  const products: ProductMetricsItem[] = [];

  let countA = 0, revA = 0;
  let countB = 0, revB = 0;
  let countC = 0, revC = 0;

  for (const p of sortedProds) {
    cumulativeRevenue += p.revenue;
    const revenueShare = totalStoreRevenue > 0 ? (p.revenue / totalStoreRevenue) * 100 : 0;
    const cumulativeShare = totalStoreRevenue > 0 ? (cumulativeRevenue / totalStoreRevenue) * 100 : 0;

    // Phân loại ABC (Pareto)
    let abcGroup: ABCGroup = 'C';
    // Nếu tỷ lệ tích lũy của các món trước < 80% hoặc đây là món đầu tiên
    if (cumulativeShare - revenueShare < 80 || products.length === 0) {
      abcGroup = 'A';
      countA++;
      revA += p.revenue;
    } else if (cumulativeShare - revenueShare < 95) {
      abcGroup = 'B';
      countB++;
      revB += p.revenue;
    } else {
      abcGroup = 'C';
      countC++;
      revC += p.revenue;
    }

    // Giá vốn và Lợi nhuận
    const hasCost = hasAnyCost && p.hasCostCount > 0;
    const avgCost = hasCost ? p.costTotal / p.hasCostCount : null;
    const profit = hasCost ? p.coveredRevenue - p.costTotal : null;
    const profitMargin = (hasCost && p.coveredRevenue > 0 && profit !== null)
      ? (profit / p.coveredRevenue) * 100
      : null;

    // Xu hướng tháng gần nhất
    const lastRev = p.monthlyRev.get(lastMonth) || 0;
    const prevRev = prevMonth ? (p.monthlyRev.get(prevMonth) || 0) : 0;
    let trend: TrendDirection = 'Ổn định';

    if (prevMonth) {
      if (prevRev === 0 && lastRev > 0) {
        trend = 'Mới xuất hiện';
      } else if (prevRev > 0) {
        const changePercent = ((lastRev - prevRev) / prevRev) * 100;
        if (changePercent > 10) trend = 'Tăng trưởng';
        else if (changePercent < -10) trend = 'Giảm sút';
        else trend = 'Ổn định';
      } else {
        trend = 'Giảm sút';
      }
    }

    // Dữ liệu xu hướng theo tất cả các tháng
    const monthlyTrendData = sortedMonths.map(m => ({
      month: m,
      quantity: p.monthlyQty.get(m) || 0,
      revenue: Math.round(p.monthlyRev.get(m) || 0)
    }));

    // Khuyến nghị hành động
    let recommendation: 'Đáng đầu tư' | 'Duy trì ổn định' | 'Cân nhắc loại bỏ' = 'Duy trì ổn định';
    let reasonText = '';

    if (abcGroup === 'A') {
      recommendation = 'Đáng đầu tư';
      reasonText = `Sản phẩm chủ lực (Nhóm A), đóng góp ${revenueShare.toFixed(1)}% doanh thu. Luôn ưu tiên giữ hàng và vị trí trưng bày đẹp.`;
    } else if (abcGroup === 'C') {
      if (trend === 'Giảm sút' || lastRev === 0) {
        recommendation = 'Cân nhắc loại bỏ';
        reasonText = `Doanh thu thấp (<5% toàn tiệm) và sức mua đang giảm. Xem xét xả hàng tồn để giải phóng vốn.`;
      } else {
        recommendation = 'Duy trì ổn định';
        reasonText = `Sản phẩm nhóm C, doanh thu nhỏ nhưng doanh số đều đặn. Không nên ôm hàng số lượng lớn.`;
      }
    } else {
      // Nhóm B
      if (trend === 'Tăng trưởng') {
        recommendation = 'Đáng đầu tư';
        reasonText = `Tiềm năng trở thành sản phẩm chủ lực với đà tăng trưởng tốt trong tháng gần nhất.`;
      } else {
        recommendation = 'Duy trì ổn định';
        reasonText = `Sản phẩm bán ổn định ở mức trung bình, phục vụ nhu cầu thường ngày của khách.`;
      }
    }

    products.push({
      id: p.id,
      name: p.name,
      category: p.category,
      quantity: p.quantity,
      revenue: Math.round(p.revenue),
      revenueShare: parseFloat(revenueShare.toFixed(1)),
      cumulativeShare: parseFloat(cumulativeShare.toFixed(1)),
      abcGroup,
      costPrice: avgCost !== null ? Math.round(avgCost) : null,
      profit: profit !== null ? Math.round(profit) : null,
      profitMargin: profitMargin !== null ? parseFloat(profitMargin.toFixed(1)) : null,
      ordersCount: p.orderSet.size,
      trend,
      monthlyTrendData,
      recommendation,
      reasonText
    });
  }

  // 4. Phân tích sản phẩm hay mua cùng nhau (Co-occurrence)
  const coOccurrences: CoOccurrenceItem[] = [];
  if (hasValidOrderId) {
    const pairCountMap = new Map<string, number>();
    let multiItemOrdersCount = 0;

    for (const [, items] of orderItemsMap.entries()) {
      if (items.size >= 2) {
        multiItemOrdersCount++;
        const itemList = Array.from(items).sort();
        for (let i = 0; i < itemList.length; i++) {
          for (let j = i + 1; j < itemList.length; j++) {
            const pairKey = `${itemList[i]}|||${itemList[j]}`;
            pairCountMap.set(pairKey, (pairCountMap.get(pairKey) || 0) + 1);
          }
        }
      }
    }

    for (const [pairKey, count] of pairCountMap.entries()) {
      const [productA, productB] = pairKey.split('|||');
      const percentage = multiItemOrdersCount > 0 
        ? parseFloat(((count / multiItemOrdersCount) * 100).toFixed(1)) 
        : 0;
      coOccurrences.push({ productA, productB, count, percentage });
    }

    // Sắp xếp các cặp phổ biến nhất lên đầu, lấy top 10
    coOccurrences.sort((a, b) => b.count - a.count);
    coOccurrences.splice(10);
  }

  // 5. Danh sách nổi bật
  const topRevenue = [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  
  const topProfitable = hasAnyCost
    ? [...products]
        .filter(p => p.profit !== null && p.profit > 0)
        .sort((a, b) => (b.profit || 0) - (a.profit || 0))
        .slice(0, 10)
    : [];

  const topLossMaking = hasAnyCost
    ? [...products]
        .filter(p => p.profit !== null && p.profit < 0)
        .sort((a, b) => (a.profit || 0) - (b.profit || 0))
        .slice(0, 10)
    : [];

  const slowMoving = products
    .filter(p => p.recommendation === 'Cân nhắc loại bỏ')
    .slice(0, 10);

  return {
    products,
    abcSummary: {
      groupA: {
        count: countA,
        revenue: Math.round(revA),
        percentage: totalStoreRevenue > 0 ? parseFloat(((revA / totalStoreRevenue) * 100).toFixed(1)) : 0
      },
      groupB: {
        count: countB,
        revenue: Math.round(revB),
        percentage: totalStoreRevenue > 0 ? parseFloat(((revB / totalStoreRevenue) * 100).toFixed(1)) : 0
      },
      groupC: {
        count: countC,
        revenue: Math.round(revC),
        percentage: totalStoreRevenue > 0 ? parseFloat(((revC / totalStoreRevenue) * 100).toFixed(1)) : 0
      }
    },
    topProfitable,
    topLossMaking,
    topRevenue,
    slowMoving,
    coOccurrences,
    hasCostPrice: hasAnyCost,
    hasOrderId: hasValidOrderId
  };
}
