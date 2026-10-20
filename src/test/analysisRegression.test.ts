import { describe, expect, it } from 'vitest';
import { runFullAnalysis, runFullAnalysisAsync } from '../core/analyzer';
import { parseFlexibleDate, parseFlexibleNumber } from '../core/cleaner';
import { guessColumnMapping } from '../core/parser';
import type { ColumnMappingConfig } from '../core/types';

const mapping: ColumnMappingConfig = { dateCol: 'date', productCol: 'product', quantityCol: 'quantity', revenueCol: 'revenue', orderIdCol: 'order', costPriceCol: 'cost', customerIdCol: 'customer' };
const first = { date: '2026-09-01', product: 'Trà', quantity: 1, revenue: 100, order: 'HD1', cost: 60, customer: 'KH1' };
describe('Dashboard data correctness', () => {
  it('keeps product and overview profit consistent when some cost is missing', () => {
    const result = runFullAnalysis([first, { ...first, order: 'HD2', cost: '' }], mapping);
    expect(result.overview.totalProfit).toBe(40);
    expect(result.productAnalysis.products[0].profit).toBe(40);
    expect(result.overview.profitMargin).toBe(40);
    expect(result.productAnalysis.products[0].profitMargin).toBe(40);
    expect(result.overview.costCoverage).toBe(50);
  });
  it('marks row-generated orders as unavailable for AOV reporting', () => {
    const result = runFullAnalysis([first], { ...mapping, orderIdCol: '' });
    expect(result.overview.hasReliableOrderIds).toBe(false);
    expect(result.actionSuggestions.some(item => item.id === 'overview-aov')).toBe(false);
  });
  it('rejects impossible calendar dates and partially numeric strings', () => {
    expect(parseFlexibleDate('31/02/2026')).toBeNull();
    expect(parseFlexibleDate('2026-02-29')).toBeNull();
    expect(parseFlexibleDate('2024-02-29')?.dateStr).toBe('2024-02-29');
    expect(parseFlexibleNumber('123abc')).toBe(0);
    expect(parseFlexibleNumber(Infinity)).toBe(0);
  });
  it('prefers a product display name to SKU regardless of header order', () => {
    expect(guessColumnMapping(['Mã sản phẩm', 'Tên sản phẩm']).productCol).toBe('Tên sản phẩm');
  });
  it('worker pipeline matches synchronous analysis and exposes customers beyond the top 15', async () => {
    const rows = Array.from({ length: 25 }, (_, index) => ({ ...first, customer: `KH${index}`, order: `HD${index}` }));
    const result = await runFullAnalysisAsync(rows, mapping, () => {});
    expect(result).toEqual(runFullAnalysis(rows, mapping));
    expect(result.customerAnalysis.customers).toHaveLength(25);
    expect(result.customerAnalysis.topCustomers).toHaveLength(15);
  });
  it('shares conclusions across worker and sync paths when products are bought together', async () => {
    const rows = [first, { ...first, product: 'Banh', revenue: 200 }];
    expect(await runFullAnalysisAsync(rows, mapping, () => {})).toEqual(runFullAnalysis(rows, mapping));
  });
});
