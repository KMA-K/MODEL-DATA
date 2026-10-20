// src/core/textConclusions.ts
import { 
  CustomerAnalysisResult, 
  OverviewMetrics, 
  ProductAnalysisResult 
} from './types';

/**
 * Định dạng tiền tệ VND dễ đọc cho người Việt:
 * Ví dụ: 1.250.000.000 -> "1,25 tỷ đ", 450.200.000 -> "450,2 triệu đ", 350.000 -> "350.000 đ"
 */
export function formatVND(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ đ`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu đ`;
  }
  return `${amount.toLocaleString('vi-VN')} đ`;
}

export function formatNumberVN(val: number): string {
  return val.toLocaleString('vi-VN');
}

/**
 * Kết luận cho Tab Tổng quan
 */
export function generateOverviewConclusion(overview: OverviewMetrics): string {
  if (overview.totalOrders === 0) {
    return 'Chưa có đủ dữ liệu đơn hàng để tạo kết luận tổng quan.';
  }

  const revText = formatVND(overview.totalRevenue);
  const ordersText = `${formatNumberVN(overview.totalOrders)} đơn`;
  const aovText = formatVND(overview.averageOrderValue);
  const timeText = overview.dateRange.days > 0 ? `trong ${overview.dateRange.days} ngày` : '';

  let profitPart = '';
  if (overview.totalProfit !== null && overview.profitMargin !== null) {
    profitPart = `, ghi nhận lợi nhuận gộp **${formatVND(overview.totalProfit)}** trên phần dữ liệu có giá vốn (${overview.costCoverage}% doanh thu; biên lãi **${overview.profitMargin}%**)`;
  }

  return overview.hasReliableOrderIds
    ? `Cửa hàng ghi nhận **${ordersText}** với tổng doanh thu **${revText}** ${timeText}${profitPart}. Giá trị trung bình mỗi đơn đạt **${aovText}**.`
    : `Tổng doanh thu **${revText}** ${timeText}${profitPart}. Bổ sung mã hóa đơn cho các dòng để tính số đơn và giá trị đơn trung bình.`;
}

/**
 * Kết luận cho Biểu đồ Doanh thu theo tháng
 */
export function generateMonthlyRevenueConclusion(overview: OverviewMetrics): string {
  const m = overview.monthlyRevenue;
  if (!m || m.length < 2) {
    return 'Dữ liệu phát sinh trong 1 tháng duy nhất.';
  }

  // Tìm tháng cao nhất
  let bestMonth = m[0];
  for (const item of m) {
    if (item.revenue > bestMonth.revenue) {
      bestMonth = item;
    }
  }

  // So sánh 2 tháng cuối
  const latest = m[m.length - 1];
  const prev = m[m.length - 2];
  const diffPercent = prev.revenue > 0 ? ((latest.revenue - prev.revenue) / prev.revenue) * 100 : 0;
  const trendWord = diffPercent >= 5 ? 'tăng' : (diffPercent <= -5 ? 'giảm' : 'ổn định');

  return `Tháng cao điểm nhất là **${bestMonth.month}** (${formatVND(bestMonth.revenue)}). Doanh thu tháng gần nhất (${latest.month}) có xu hướng **${trendWord} ${Math.abs(diffPercent).toFixed(1)}%** so với tháng trước.`;
}

/**
 * Kết luận cho Phân tích Pareto ABC Sản phẩm
 */
export function generateAbcConclusion(prodResult: ProductAnalysisResult): string {
  const { groupA, groupC } = prodResult.abcSummary;
  const totalCount = prodResult.products.length;

  if (totalCount === 0) {
    return 'Chưa có dữ liệu sản phẩm để phân loại.';
  }

  return `Chỉ **${groupA.count} sản phẩm nhóm A** (chiếm ${((groupA.count / totalCount) * 100).toFixed(0)}% số lượng mặt hàng) đã đóng góp tới **${groupA.percentage}% doanh thu** (${formatVND(groupA.revenue)}). Trong khi đó, **${groupC.count} sản phẩm nhóm C** chỉ đóng góp ${groupC.percentage}%.`;
}

/**
 * Kết luận cho Biên lợi nhuận sản phẩm
 */
export function generateProfitMarginConclusion(prodResult: ProductAnalysisResult): string {
  if (!prodResult.hasCostPrice) {
    return 'Cần nhập cột Giá vốn để xem xếp hạng biên lợi nhuận và lãi gộp.';
  }

  const withProfit = prodResult.products.filter(p => p.profit !== null);
  if (withProfit.length === 0) {
    return 'Cần nhập cột Giá vốn để xem xếp hạng biên lợi nhuận và lãi gộp.';
  }

  const profitable = withProfit.filter(p => (p.profit ?? 0) > 0);
  const lossMaking = withProfit.filter(p => (p.profit ?? 0) < 0);
  const breakEven = withProfit.filter(p => (p.profit ?? 0) === 0);

  // Phân biệt chính xác trường hợp toàn bộ sản phẩm đang lỗ (UI-10)
  if (profitable.length === 0 && lossMaking.length > 0) {
    const worst = [...lossMaking].sort((a, b) => (a.profit ?? 0) - (b.profit ?? 0))[0];
    return `Tất cả mặt hàng có giá vốn hiện đang ghi nhận mức lợi nhuận âm. Mặt hàng chênh lệch âm nhiều nhất là **${worst.name}** (${formatVND(worst.profit || 0)}, biên lãi **${worst.profitMargin}%**).`;
  }

  // Trường hợp hòa vốn
  if (profitable.length === 0 && breakEven.length > 0) {
    return 'Các mặt hàng có giá vốn hiện đang ở mức hòa vốn (doanh thu bằng đúng giá vốn).';
  }

  // Trường hợp có sản phẩm lãi dương
  if (profitable.length > 0) {
    const top = [...profitable].sort((a, b) => (b.profit ?? 0) - (a.profit ?? 0))[0];
    const lossPart = lossMaking.length > 0 
      ? ` Cửa hàng có ${lossMaking.length} mặt hàng đang bán thấp hơn giá vốn.` 
      : '';
    return `Mặt hàng mang lại nhiều tiền lãi nhất là **${top.name}** với lợi nhuận gộp **${formatVND(top.profit || 0)}** (biên lãi **${top.profitMargin}%**).${lossPart}`;
  }

  return 'Chưa có đủ dữ liệu giá vốn hợp lệ để tính toán lợi nhuận.';
}

/**
 * Kết luận cho Phân khúc Khách hàng RFM
 */
export function generateCustomerConclusion(custResult: CustomerAnalysisResult, hasReliableOrderIds?: boolean): string {
  if (!custResult.hasCustomerData) {
    return 'Cần thêm cột Mã khách hàng để xem phân tích chân dung và mức độ gắn bó của khách.';
  }

  if (hasReliableOrderIds === false) {
    return `Đã nhận diện **${custResult.totalCustomers} khách hàng** trong kỳ kinh doanh. Cần thêm mã hóa đơn đầy đủ và nhất quán để phân nhóm RFM và tính tần suất mua sắm đáng tin cậy.`;
  }

  // Tỷ trọng doanh thu VIP và phân biệt mẫu số (UI-17)
  const vip = custResult.segmentsSummary.find(s => s.segment === 'VIP');
  let vipPart = '';
  if (vip && vip.count > 0) {
    if (custResult.customerRevenueCoverage < 99.5) {
      vipPart = `**${vip.count} khách VIP** đóng góp **${formatVND(vip.totalRevenue)}** (chiếm **${vip.storeRevenuePercentage}%** tổng doanh thu cửa hàng, tương đương **${vip.revenuePercentage}%** doanh thu nhóm khách đã nhận diện; độ phủ mã khách: **${custResult.customerRevenueCoverage}%**). `;
    } else {
      vipPart = `**${vip.count} khách VIP** đóng góp **${vip.storeRevenuePercentage}% doanh thu** (${formatVND(vip.totalRevenue)}). `;
    }
  }

  // Tỷ lệ khách quay lại mua sắm (UI-18)
  const atRisk = custResult.segmentsSummary.find(s => s.segment === 'Có nguy cơ rời đi');
  let retentionPart = '';

  if (custResult.repeatCustomersCount === 0) {
    retentionPart = `Toàn bộ **${custResult.totalCustomers} khách hàng** đều mới phát sinh 1 đơn hàng trong kỳ dữ liệu (chưa có lượt mua lặp lại).`;
  } else {
    retentionPart = `Có **${custResult.repeatCustomersCount}/${custResult.totalCustomers} khách hàng** (${custResult.repeatCustomerRate}%) đã quay lại mua sắm từ 2 lần trở lên.`;
  }

  if (atRisk && atRisk.count > 0) {
    retentionPart += ` Đáng chú ý có **${atRisk.count} khách hàng tiềm năng/VIP** đang có nguy cơ rời đi vì chưa mua lại trong hơn 60 ngày.`;
  }

  return `${vipPart}${retentionPart}`.trim();
}

/**
 * Kết luận cho Sản phẩm hay mua cùng nhau (Cross-sell)
 */
export function generateCoOccurrenceConclusion(prodResult: ProductAnalysisResult): string {
  if (!prodResult.hasOrderId) {
    return 'Cần thêm cột Mã đơn hàng để phân tích các mặt hàng khách thường mua kèm trong cùng một hóa đơn.';
  }

  if (prodResult.coOccurrences.length === 0) {
    return 'Chưa tìm thấy cặp sản phẩm nào được mua chung trên 2 lần.';
  }

  const topPair = prodResult.coOccurrences[0];
  return `Cặp đôi được mua cùng nhau nhiều nhất là **"${topPair.productA}"** và **"${topPair.productB}"** (xuất hiện cùng nhau trong **${topPair.count} đơn hàng**, chiếm ${topPair.percentage}% các đơn mua từ 2 món trở lên).`;
}
