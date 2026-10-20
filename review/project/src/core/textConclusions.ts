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
  if (!prodResult.hasCostPrice || prodResult.topProfitable.length === 0) {
    return 'Cần nhập cột Giá vốn để xem xếp hạng biên lợi nhuận và lãi gộp.';
  }

  const top = prodResult.topProfitable[0];
  return `Mặt hàng mang lại nhiều tiền lãi nhất là **${top.name}** với lợi nhuận gộp **${formatVND(top.profit || 0)}** (biên lãi **${top.profitMargin}%**).`;
}

/**
 * Kết luận cho Phân khúc Khách hàng RFM
 */
export function generateCustomerConclusion(custResult: CustomerAnalysisResult): string {
  if (!custResult.hasCustomerData) {
    return 'Cần thêm cột Mã khách hàng để xem phân tích chân dung và mức độ gắn bó của khách.';
  }

  const vip = custResult.segmentsSummary.find(s => s.segment === 'VIP');
  const atRisk = custResult.segmentsSummary.find(s => s.segment === 'Có nguy cơ rời đi');

  const vipPart = vip 
    ? `**${vip.count} khách VIP** đóng góp **${vip.revenuePercentage}% doanh thu** (${formatVND(vip.totalRevenue)}). ` 
    : '';

  const atRiskPart = atRisk && atRisk.count > 0
    ? `Đáng chú ý có **${atRisk.count} khách hàng tiềm năng/VIP** đang có nguy cơ rời đi vì chưa mua lại trong hơn 60 ngày.`
    : 'Cửa hàng đang duy trì tỷ lệ khách quay lại mua sắm rất tích cực.';

  return `${vipPart}${atRiskPart}`;
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
