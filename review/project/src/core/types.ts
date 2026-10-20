// src/core/types.ts

export type StandardField = 
  | 'date'
  | 'product'
  | 'quantity'
  | 'revenue'
  | 'unitPrice'
  | 'customerId'
  | 'costPrice'
  | 'orderId'
  | 'category';

export interface ColumnMappingConfig {
  dateCol: string;          // Bắt buộc: Ngày bán
  productCol: string;       // Bắt buộc: Tên hoặc Mã sản phẩm
  quantityCol: string;      // Bắt buộc: Số lượng
  revenueCol: string;       // Bắt buộc (hoặc dùng unitPriceCol): Doanh thu / Thành tiền
  unitPriceCol?: string;    // Tùy chọn (dùng để tính doanh thu nếu không có cột doanh thu)
  customerIdCol?: string;   // Tùy chọn: Mã hoặc Tên khách hàng
  costPriceCol?: string;    // Tùy chọn: Giá vốn
  orderIdCol?: string;      // Tùy chọn: Mã hóa đơn / đơn hàng
  categoryCol?: string;     // Tùy chọn: Nhóm / Danh mục sản phẩm
}

export interface CleanRow {
  rowIndex: number;         // Dòng gốc trong file (1-based)
  orderId: string;          // Mã đơn (hoặc tự tạo nếu thiếu)
  date: string;             // Định dạng YYYY-MM-DD
  monthStr: string;         // Định dạng YYYY-MM để nhóm theo tháng
  timestamp: number;        // Epoch millis để sắp xếp nhanh
  productId: string;        // Tên hoặc mã định danh sản phẩm
  productName: string;      // Tên hiển thị sản phẩm
  category: string;         // Danh mục hàng hóa (mặc định 'Chung' nếu thiếu)
  quantity: number;         // Số lượng bán (> 0)
  unitPrice: number;        // Đơn giá bán
  revenue: number;          // Doanh thu thực tế (quantity * unitPrice hoặc cột doanh thu)
  costPrice: number | null; // Giá vốn đơn vị (null nếu không có)
  totalCost: number | null; // Tổng giá vốn (quantity * costPrice, null nếu thiếu)
  profit: number | null;    // Lợi nhuận gộp (revenue - totalCost, null nếu thiếu)
  customerId: string | null;// Mã khách hàng (null nếu không có)
}

export interface DropReasonCount {
  reason: string;
  description: string;
  count: number;
  sampleRows: number[];     // Danh sách số dòng đại diện bị loại (1-based)
}

export interface CleaningReport {
  totalRows: number;
  validRows: number;
  droppedTotal: number;
  reasons: DropReasonCount[];
}

export interface ParseResult {
  headers: string[];
  previewRows: Record<string, any>[]; // 10 dòng đầu
  allRows: Record<string, any>[];
  totalRows: number;
  fileName: string;
  fileSizeBytes: number;
}

// Chỉ số Tổng quan (Overview)
export interface OverviewMetrics {
  hasReliableOrderIds: boolean;
  costCoverage: number;
  totalRevenue: number;
  totalQuantity: number;
  totalOrders: number;
  averageOrderValue: number; // AOV
  totalProfit: number | null; // Lợi nhuận gộp (null nếu không có giá vốn)
  profitMargin: number | null; // Tỷ suất LN gộp % (null nếu không có giá vốn)
  uniqueProducts: number;
  uniqueCustomers: number | null;
  dateRange: { start: string; end: string; days: number };
  monthlyRevenue: { month: string; revenue: number; orders: number; profit: number | null }[];
}

// Phân loại ABC Sản phẩm
export type ABCGroup = 'A' | 'B' | 'C';
export type TrendDirection = 'Tăng trưởng' | 'Ổn định' | 'Giảm sút' | 'Mới xuất hiện';

export interface ProductMetricsItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  revenue: number;
  revenueShare: number;        // Tỷ trọng % doanh thu
  cumulativeShare: number;     // Tích lũy % cho phân loại ABC
  abcGroup: ABCGroup;          // A (80%), B (15%), C (5%)
  costPrice: number | null;
  profit: number | null;       // Lợi nhuận gộp (null nếu thiếu)
  profitMargin: number | null; // Biên lợi nhuận % (null nếu thiếu)
  ordersCount: number;         // Số lần xuất hiện trong đơn
  trend: TrendDirection;       // Xu hướng tháng gần nhất
  monthlyTrendData: { month: string; quantity: number; revenue: number }[];
  recommendation: 'Đáng đầu tư' | 'Duy trì ổn định' | 'Cân nhắc loại bỏ';
  reasonText: string;
}

export interface CoOccurrenceItem {
  productA: string;
  productB: string;
  count: number;               // Số đơn hàng cùng mua A và B
  percentage: number;          // % đơn hàng chứa cặp này
}

export interface ProductAnalysisResult {
  products: ProductMetricsItem[];
  abcSummary: {
    groupA: { count: number; revenue: number; percentage: number };
    groupB: { count: number; revenue: number; percentage: number };
    groupC: { count: number; revenue: number; percentage: number };
  };
  topProfitable: ProductMetricsItem[];
  topRevenue: ProductMetricsItem[];
  slowMoving: ProductMetricsItem[]; // Sản phẩm cần cân nhắc bỏ
  coOccurrences: CoOccurrenceItem[]; // Cặp sản phẩm hay mua cùng (nếu có orderId)
  hasCostPrice: boolean;
  hasOrderId: boolean;
}

// Khách hàng & RFM
export type RFMSegment = 
  | 'VIP' 
  | 'Trung thành' 
  | 'Mới' 
  | 'Có nguy cơ rời đi' 
  | 'Đã ngừng mua' 
  | 'Bình thường';

export interface CustomerMetricsItem {
  customerId: string;
  customerName?: string;
  ordersCount: number;         // Frequency
  totalSpend: number;          // Monetary
  averageOrderValue: number;
  lastOrderDate: string;       // Recency
  daysSinceLastOrder: number;
  firstOrderDate: string;
  rfmScore: { r: number; f: number; m: number; total: number };
  segment: RFMSegment;
  actionAdvice: string;
}

export interface CustomerAnalysisResult {
  customers: CustomerMetricsItem[];
  hasCustomerData: boolean;
  totalCustomers: number;
  segmentsSummary: {
    segment: RFMSegment;
    count: number;
    percentage: number;
    totalRevenue: number;
    revenuePercentage: number;
  }[];
  topCustomers: CustomerMetricsItem[];
  vipCustomers: CustomerMetricsItem[];
  atRiskCustomers: CustomerMetricsItem[];
  churnedCustomers: CustomerMetricsItem[];
  newCustomers: CustomerMetricsItem[];
}

// Toàn bộ dữ liệu sau khi phân tích
export interface FullAnalysisData {
  cleaningReport: CleaningReport;
  overview: OverviewMetrics;
  productAnalysis: ProductAnalysisResult;
  customerAnalysis: CustomerAnalysisResult;
  actionSuggestions: ActionSuggestion[];
  conclusions: {
    overview: string;
    monthlyTrend: string;
    productABC: string;
    productProfit: string;
    customerRFM: string;
    crossSelling: string;
  };
  columnMapping: ColumnMappingConfig;
}

export interface ActionSuggestion {
  id: string;
  type: 'product' | 'customer' | 'inventory' | 'pricing';
  severity: 'high' | 'medium' | 'info';
  title: string;
  description: string;
  metricBadge?: string;
}
