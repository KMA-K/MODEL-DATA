"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOverviewMetrics = calculateOverviewMetrics;
function calculateOverviewMetrics(cleanRows) {
    if (cleanRows.length === 0) {
        return {
            hasReliableOrderIds: false,
            costCoverage: 0,
            totalRevenue: 0,
            totalQuantity: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            totalProfit: null,
            profitMargin: null,
            uniqueProducts: 0,
            uniqueCustomers: null,
            dateRange: { start: '', end: '', days: 0 },
            monthlyRevenue: []
        };
    }
    let totalRevenue = 0;
    let totalQuantity = 0;
    let totalProfitSum = 0;
    let hasAnyCost = false;
    let coveredRevenue = 0;
    const hasReliableOrderIds = cleanRows.every(row => row.orderId && !row.orderId.startsWith('AUTO-'));
    const orderSet = new Set();
    const productSet = new Set();
    const customerSet = new Set();
    let hasCustomer = false;
    let minTimestamp = Infinity;
    let maxTimestamp = -Infinity;
    let minDate = '';
    let maxDate = '';
    // Nhóm theo tháng
    const monthlyMap = new Map();
    for (const row of cleanRows) {
        totalRevenue += row.revenue;
        totalQuantity += row.quantity;
        orderSet.add(row.orderId);
        productSet.add(row.productId);
        if (row.customerId) {
            customerSet.add(row.customerId);
            hasCustomer = true;
        }
        if (row.profit !== null) {
            hasAnyCost = true;
            coveredRevenue += row.revenue;
            totalProfitSum = (totalProfitSum ?? 0) + row.profit;
        }
        if (row.timestamp < minTimestamp) {
            minTimestamp = row.timestamp;
            minDate = row.date;
        }
        if (row.timestamp > maxTimestamp) {
            maxTimestamp = row.timestamp;
            maxDate = row.date;
        }
        // Nhóm theo tháng
        let monthEntry = monthlyMap.get(row.monthStr);
        if (!monthEntry) {
            monthEntry = { revenue: 0, orderSet: new Set(), profitSum: row.profit !== null ? 0 : null };
            monthlyMap.set(row.monthStr, monthEntry);
        }
        monthEntry.revenue += row.revenue;
        monthEntry.orderSet.add(row.orderId);
        if (row.profit !== null) {
            monthEntry.profitSum = (monthEntry.profitSum ?? 0) + row.profit;
        }
    }
    const totalOrders = orderSet.size > 0 ? orderSet.size : cleanRows.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalProfit = hasAnyCost ? (totalProfitSum ?? 0) : null;
    const profitMargin = (hasAnyCost && coveredRevenue > 0 && totalProfit !== null)
        ? (totalProfit / coveredRevenue) * 100
        : null;
    const days = minTimestamp !== Infinity && maxTimestamp !== -Infinity
        ? Math.max(1, Math.round((maxTimestamp - minTimestamp) / (1000 * 60 * 60 * 24)) + 1)
        : 0;
    // Sắp xếp các tháng theo thứ tự thời gian
    const sortedMonths = Array.from(monthlyMap.keys()).sort();
    const monthlyRevenue = sortedMonths.map(m => {
        const entry = monthlyMap.get(m);
        return {
            month: m,
            revenue: Math.round(entry.revenue),
            orders: entry.orderSet.size,
            profit: entry.profitSum !== null ? Math.round(entry.profitSum) : null
        };
    });
    return {
        hasReliableOrderIds,
        costCoverage: totalRevenue ? Math.round(coveredRevenue / totalRevenue * 100) : 0,
        totalRevenue: Math.round(totalRevenue),
        totalQuantity,
        totalOrders,
        averageOrderValue: Math.round(averageOrderValue),
        totalProfit: totalProfit !== null ? Math.round(totalProfit) : null,
        profitMargin: profitMargin !== null ? parseFloat(profitMargin.toFixed(1)) : null,
        uniqueProducts: productSet.size,
        uniqueCustomers: hasCustomer ? customerSet.size : null,
        dateRange: {
            start: minDate,
            end: maxDate,
            days
        },
        monthlyRevenue
    };
}
