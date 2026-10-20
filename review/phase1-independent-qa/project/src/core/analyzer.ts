// src/core/analyzer.ts
import { generateActionSuggestions } from './actionSuggestions';
import { cleanSalesData } from './cleaner';
import { calculateCustomerMetrics } from './customerMetrics';
import { calculateOverviewMetrics } from './overviewMetrics';
import { calculateProductMetrics } from './productMetrics';
import { 
  generateAbcConclusion, 
  generateCustomerConclusion, 
  generateMonthlyRevenueConclusion, 
  generateOverviewConclusion, 
  generateProfitMarginConclusion 
} from './textConclusions';
import { ColumnMappingConfig, FullAnalysisData, OverviewMetrics, ProductAnalysisResult, CustomerAnalysisResult, CleaningReport } from './types';

export function runFullAnalysis(
  rawRows: Record<string, any>[],
  mapping: ColumnMappingConfig
): FullAnalysisData {
  // 1. Làm sạch dữ liệu
  const { cleanRows, report } = cleanSalesData(rawRows, mapping);

  // 2. Tính toán tổng quan
  const overview = calculateOverviewMetrics(cleanRows);

  // 3. Tính toán sản phẩm
  const productAnalysis = calculateProductMetrics(cleanRows);

  // 4. Tính toán khách hàng (truyền totalStoreRevenue để tính tỷ trọng chính xác)
  const customerAnalysis = calculateCustomerMetrics(cleanRows, overview.totalRevenue);

  // 5. Sinh gợi ý hành động
  return finishAnalysis(overview, productAnalysis, customerAnalysis, report, mapping);
}

function finishAnalysis(overview: OverviewMetrics, productAnalysis: ProductAnalysisResult, customerAnalysis: CustomerAnalysisResult, report: CleaningReport, mapping: ColumnMappingConfig): FullAnalysisData {
  const actionSuggestions = generateActionSuggestions(overview, productAnalysis, customerAnalysis)
    .filter(action => overview.hasReliableOrderIds || action.type !== 'customer');

  // 6. Sinh câu kết luận template
  const conclusions = {
    overview: generateOverviewConclusion(overview),
    monthlyTrend: generateMonthlyRevenueConclusion(overview),
    productABC: generateAbcConclusion(productAnalysis),
    productProfit: generateProfitMarginConclusion(productAnalysis),
    customerRFM: generateCustomerConclusion(customerAnalysis, overview.hasReliableOrderIds),
    crossSelling: productAnalysis.hasOrderId 
      ? (productAnalysis.coOccurrences[0] 
          ? `Cặp đôi mua cùng nhiều nhất là "${productAnalysis.coOccurrences[0].productA}" & "${productAnalysis.coOccurrences[0].productB}" (${productAnalysis.coOccurrences[0].count} đơn).` 
          : 'Chưa có cặp sản phẩm mua cùng nổi bật.')
      : 'Cần thêm cột Mã đơn hàng để phân tích các mặt hàng thường được mua kèm.'
  };

  return {
    cleaningReport: report,
    overview,
    productAnalysis,
    customerAnalysis,
    actionSuggestions,
    conclusions,
    columnMapping: mapping
  };
}

/** Yield between actual stages so worker progress reaches the UI. */
export async function runFullAnalysisAsync(
  rawRows: Record<string, any>[], mapping: ColumnMappingConfig,
  onProgress: (percent: number, label: string) => void,
): Promise<FullAnalysisData> {
  const stage = async (percent: number, label: string) => {
    onProgress(percent, label);
    await new Promise(resolve => setTimeout(resolve, 0));
  };
  await stage(15, 'Đang chuẩn hóa và kiểm tra dữ liệu...');
  const { cleanRows, report } = cleanSalesData(rawRows, mapping);
  if (!cleanRows.length) throw new Error('Không có dòng hợp lệ. Hãy kiểm tra ghép cột và định dạng dữ liệu.');
  await stage(35, 'Đang tính doanh thu và lợi nhuận...');
  const overview = calculateOverviewMetrics(cleanRows);
  await stage(55, 'Đang tìm sản phẩm bán chạy và các cặp mua cùng...');
  const productAnalysis = calculateProductMetrics(cleanRows);
  await stage(75, 'Đang phân nhóm khách hàng RFM...');
  const customerAnalysis = calculateCustomerMetrics(cleanRows, overview.totalRevenue);
  await stage(92, 'Đang tổng hợp nhận xét và gợi ý hành động...');
  const result = finishAnalysis(overview, productAnalysis, customerAnalysis, report, mapping);
  await stage(100, 'Phân tích hoàn tất!');
  return result;
}
