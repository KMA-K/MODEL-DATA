import { test, expect } from '@playwright/test';
import path from 'node:path';

const FIXTURES_DIR = path.resolve(process.cwd(), 'review/data');

test.describe('Phase 1 UI Integrity & Reliability Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('UI-06: Người dùng thấy cảnh báo nghi trùng và giữ đúng 200.000đ doanh thu', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type=file]').setInputFiles(path.join(FIXTURES_DIR, 'duplicate-real-order.csv'));
    await expect(page.getByRole('heading', { name: 'Đúng cột. Đúng góc nhìn.' })).toBeVisible();
    await page.getByRole('button', { name: 'Khám phá dữ liệu', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Tổng quan', exact: true })).toBeVisible();

    // Doanh thu phải giữ nguyên 200.000 đ
    const revenueCard = page.locator('.kpi-card').filter({ hasText: 'Tổng doanh thu' });
    await expect(revenueCard).toContainText('200.000 đ');

    // Bấm xem Báo cáo làm sạch
    await page.getByRole('button', { name: 'Báo cáo làm sạch' }).click();
    const dialog = page.getByRole('dialog', { name: 'Báo cáo làm sạch' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Dòng nghi ngờ trùng lặp');
    await expect(dialog).toContainText('Hệ thống giữ lại toàn bộ theo mặc định để tránh mất doanh thu thật');
  });

  test('UI-05 & UI-14: Khi thiếu mã đơn, KPI Khách VIP và Tổng đơn báo Chưa đủ dữ liệu trên UI', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type=file]').setInputFiles(path.join(FIXTURES_DIR, 'order-none.csv'));
    await expect(page.getByRole('heading', { name: 'Đúng cột. Đúng góc nhìn.' })).toBeVisible();
    await page.getByRole('button', { name: 'Khám phá dữ liệu', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Tổng quan', exact: true })).toBeVisible();

    // KPI Tổng đơn hàng báo Chưa đủ dữ liệu
    const ordersCard = page.locator('.kpi-card').filter({ hasText: 'Tổng đơn hàng' });
    await expect(ordersCard).toContainText('Chưa đủ dữ liệu');

    // KPI Khách VIP báo Chưa đủ dữ liệu
    const vipCard = page.locator('.kpi-card').filter({ hasText: 'Khách VIP' });
    await expect(vipCard).toContainText('Chưa đủ dữ liệu');
    await expect(vipCard).toContainText('Cần mã hóa đơn để phân loại VIP');

    // Tab Khách hàng hiển thị thông báo yêu cầu mã đơn
    await page.getByRole('tab', { name: /Khách hàng/ }).click();
    await expect(page.locator('.missing-column-notice h3')).toContainText('Cần mã hóa đơn để phân nhóm khách chính xác');
  });

  test('UI-10: Cửa hàng đang lỗ hiển thị rõ thực trạng lỗ, không đòi nhập giá vốn', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type=file]').setInputFiles(path.join(FIXTURES_DIR, 'negative-profit.csv'));
    await expect(page.getByRole('heading', { name: 'Đúng cột. Đúng góc nhìn.' })).toBeVisible();
    await page.getByRole('button', { name: 'Khám phá dữ liệu', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Tổng quan', exact: true })).toBeVisible();

    // KPI Lợi nhuận gộp ghi nhận -40.000 đ
    const profitCard = page.locator('.kpi-card').filter({ hasText: 'Lợi nhuận gộp' });
    await expect(profitCard).toContainText('-40.000 đ');

    // Tab Sản phẩm
    await page.getByRole('tab', { name: /Sản phẩm/ }).click();
    const insightSection = page.locator('.dashboard-stack');
    await expect(insightSection).not.toContainText('Cần nhập cột Giá vốn để xem xếp hạng biên lợi nhuận');
    await expect(insightSection).toContainText('lợi nhuận âm');
  });

  test('UI-17 & UI-18: Khách hàng một phần và toàn bộ chỉ mua 1 lần hiển thị chuẩn xác', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type=file]').setInputFiles(path.join(FIXTURES_DIR, 'same-day-customers.csv'));
    await expect(page.getByRole('heading', { name: 'Đúng cột. Đúng góc nhìn.' })).toBeVisible();
    await page.getByRole('button', { name: 'Khám phá dữ liệu', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Tổng quan', exact: true })).toBeVisible();

    // Mở Tab Khách hàng
    await page.getByRole('tab', { name: /Khách hàng/ }).click();
    // Nhận xét không được khẳng định quay lại tích cực khi tất cả F=1
    await expect(page.locator('.insight')).not.toContainText('tỷ lệ khách quay lại mua sắm rất tích cực');
    await expect(page.locator('.insight')).toContainText('chưa có lượt mua lặp lại');
  });
});
