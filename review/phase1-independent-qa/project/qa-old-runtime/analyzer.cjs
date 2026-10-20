"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFullAnalysis = runFullAnalysis;
exports.runFullAnalysisAsync = runFullAnalysisAsync;
// src/core/analyzer.ts
const actionSuggestions_1 = require("./actionSuggestions.cjs");
const cleaner_1 = require("./cleaner.cjs");
const customerMetrics_1 = require("./customerMetrics.cjs");
const overviewMetrics_1 = require("./overviewMetrics.cjs");
const productMetrics_1 = require("./productMetrics.cjs");
const textConclusions_1 = require("./textConclusions.cjs");
function runFullAnalysis(rawRows, mapping) {
    // 1. Làm sạch dữ liệu
    const { cleanRows, report } = (0, cleaner_1.cleanSalesData)(rawRows, mapping);
    // 2. Tính toán tổng quan
    const overview = (0, overviewMetrics_1.calculateOverviewMetrics)(cleanRows);
    // 3. Tính toán sản phẩm
    const productAnalysis = (0, productMetrics_1.calculateProductMetrics)(cleanRows);
    // 4. Tính toán khách hàng
    const customerAnalysis = (0, customerMetrics_1.calculateCustomerMetrics)(cleanRows);
    // 5. Sinh gợi ý hành động
    return finishAnalysis(overview, productAnalysis, customerAnalysis, report, mapping);
}
function finishAnalysis(overview, productAnalysis, customerAnalysis, report, mapping) {
    const actionSuggestions = (0, actionSuggestions_1.generateActionSuggestions)(overview, productAnalysis, customerAnalysis)
        .filter(action => overview.hasReliableOrderIds || action.type !== 'customer');
    // 6. Sinh câu kết luận template
    const conclusions = {
        overview: (0, textConclusions_1.generateOverviewConclusion)(overview),
        monthlyTrend: (0, textConclusions_1.generateMonthlyRevenueConclusion)(overview),
        productABC: (0, textConclusions_1.generateAbcConclusion)(productAnalysis),
        productProfit: (0, textConclusions_1.generateProfitMarginConclusion)(productAnalysis),
        customerRFM: (0, textConclusions_1.generateCustomerConclusion)(customerAnalysis),
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
async function runFullAnalysisAsync(rawRows, mapping, onProgress) {
    const stage = async (percent, label) => {
        onProgress(percent, label);
        await new Promise(resolve => setTimeout(resolve, 0));
    };
    await stage(15, 'Đang chuẩn hóa và kiểm tra dữ liệu...');
    const { cleanRows, report } = (0, cleaner_1.cleanSalesData)(rawRows, mapping);
    if (!cleanRows.length)
        throw new Error('Không có dòng hợp lệ. Hãy kiểm tra ghép cột và định dạng dữ liệu.');
    await stage(35, 'Đang tính doanh thu và lợi nhuận...');
    const overview = (0, overviewMetrics_1.calculateOverviewMetrics)(cleanRows);
    await stage(55, 'Đang tìm sản phẩm bán chạy và các cặp mua cùng...');
    const productAnalysis = (0, productMetrics_1.calculateProductMetrics)(cleanRows);
    await stage(75, 'Đang phân nhóm khách hàng RFM...');
    const customerAnalysis = (0, customerMetrics_1.calculateCustomerMetrics)(cleanRows);
    await stage(92, 'Đang tổng hợp nhận xét và gợi ý hành động...');
    const result = finishAnalysis(overview, productAnalysis, customerAnalysis, report, mapping);
    await stage(100, 'Phân tích hoàn tất!');
    return result;
}
