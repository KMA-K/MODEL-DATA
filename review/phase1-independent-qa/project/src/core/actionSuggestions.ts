// src/core/actionSuggestions.ts
import { formatVND } from './textConclusions';
import { 
  ActionSuggestion, 
  CustomerAnalysisResult, 
  OverviewMetrics, 
  ProductAnalysisResult 
} from './types';

export function generateActionSuggestions(
  overview: OverviewMetrics,
  productResult: ProductAnalysisResult,
  customerResult: CustomerAnalysisResult
): ActionSuggestion[] {
  const suggestions: ActionSuggestion[] = [];

  // Gợi ý 1: Khách VIP có nguy cơ rời đi (Nếu có dữ liệu khách hàng)
  if (customerResult.hasCustomerData && customerResult.atRiskCustomers.length > 0) {
    const atRiskCount = customerResult.atRiskCustomers.length;
    const atRiskSpend = customerResult.atRiskCustomers.reduce((sum, c) => sum + c.totalSpend, 0);
    suggestions.push({
      id: 'cust-at-risk',
      type: 'customer',
      severity: 'high',
      title: `Chăm sóc ${atRiskCount} khách hàng đang có nguy cơ rời đi`,
      description: `Nhóm này từng chi tiêu tổng cộng ${formatVND(atRiskSpend)} nhưng đã hơn 60 ngày không mua hàng. Nên gửi tin nhắn Zalo/SMS thăm hỏi, tặng mã giảm giá tri ân hoặc giới thiệu mặt hàng họ từng yêu thích.`,
      metricBadge: `${atRiskCount} khách cần liên hệ`
    });
  }

  // Gợi ý 2: Ưu tiên tồn kho cho nhóm sản phẩm chủ lực (Nhóm A)
  if (productResult.products.length > 0) {
    const countA = productResult.abcSummary.groupA.count;
    const revA = productResult.abcSummary.groupA.revenue;
    const pctA = productResult.abcSummary.groupA.percentage;
    const topProd = productResult.topRevenue[0]?.name || 'các sản phẩm chủ lực';

    suggestions.push({
      id: 'prod-abc-stock',
      type: 'inventory',
      severity: 'high',
      title: `Đảm bảo nguồn hàng cho ${countA} sản phẩm chủ lực (Nhóm A)`,
      description: `Chỉ ${countA} mặt hàng này mang về ${pctA}% doanh thu toàn tiệm (${formatVND(revA)}), dẫn đầu là "${topProd}". Hãy luôn kiểm kê và đặt hàng nhà cung cấp sớm để tránh đứt hàng vào giờ cao điểm.`,
      metricBadge: `${pctA}% doanh thu`
    });
  }

  // Gợi ý 3: Cân nhắc giải phóng tồn kho sản phẩm bán chậm (Nhóm C giảm sút)
  if (productResult.slowMoving.length > 0) {
    const slowCount = productResult.slowMoving.length;
    const slowNames = productResult.slowMoving.slice(0, 3).map(p => `"${p.name}"`).join(', ');

    suggestions.push({
      id: 'prod-slow-moving',
      type: 'product',
      severity: 'medium',
      title: `Thanh lý hoặc ngừng nhập ${slowCount} sản phẩm bán chậm`,
      description: `Các mặt hàng như ${slowNames}... có doanh thu rất thấp và sức mua đang giảm sút. Bạn nên gom làm quà tặng kèm, bán thanh lý thu hồi vốn và không nên tiếp tục nhập thêm số lượng lớn.`,
      metricBadge: `${slowCount} mã hàng bán chậm`
    });
  }

  // Gợi ý 4: Tạo combo bán chéo dựa trên thói quen mua sắm (Nếu có mã đơn hàng)
  if (productResult.hasOrderId && productResult.coOccurrences.length > 0) {
    const topPair = productResult.coOccurrences[0];
    suggestions.push({
      id: 'prod-cross-sell',
      type: 'pricing',
      severity: 'medium',
      title: `Tạo combo bán chéo "${topPair.productA}" & "${topPair.productB}"`,
      description: `Khách hàng đã mua cùng 2 món này trong ${topPair.count} hóa đơn (${topPair.percentage}% các đơn từ 2 món). Bạn nên đặt 2 món cạnh nhau trên kệ trưng bày hoặc tạo gói khuyến mãi mua kèm để gia tăng giá trị giỏ hàng.`,
      metricBadge: `${topPair.count} đơn mua chung`
    });
  }

  // Gợi ý 5: Giá trị đơn hàng trung bình (AOV)
  if (overview.hasReliableOrderIds && overview.averageOrderValue > 0) {
    suggestions.push({
      id: 'overview-aov',
      type: 'pricing',
      severity: 'info',
      title: `Gia tăng giá trị đơn hàng trung bình (hiện tại ${formatVND(overview.averageOrderValue)})`,
      description: `Để tăng thêm doanh thu mà không cần tìm thêm khách mới, hãy áp dụng chương trình "Hóa đơn trên ${formatVND(Math.round(overview.averageOrderValue * 1.3 / 10000) * 10000)} được tặng thêm quà nhỏ hoặc miễn phí giao hàng".`,
      metricBadge: `AOV: ${formatVND(overview.averageOrderValue)}`
    });
  }

  // Đảm bảo trả về từ 3 đến 5 gợi ý thực tế nhất
  return suggestions.slice(0, 5);
}
