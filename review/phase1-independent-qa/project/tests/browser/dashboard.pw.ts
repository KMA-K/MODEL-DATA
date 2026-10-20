import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function sampleDashboard(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Khám phá', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Đúng cột. Đúng góc nhìn.' })).toBeVisible();
  await expect(page.locator('#map-productCol')).toHaveValue('Tên sản phẩm');
  await page.getByRole('button', { name: 'Khám phá dữ liệu', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Tổng quan', exact: true })).toBeVisible();
}
test('sample upload, live theme, charts, full tables, export and saved personalization', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(async () => { await Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))); });
  await page.screenshot({ path: 'artifacts/welcome.png', fullPage: true });
  await sampleDashboard(page);
  await expect(page.locator('svg defs #overview-area')).toHaveCount(1);
  await expect(page.locator('.recharts-area')).toBeVisible();
  await page.getByRole('button', { name: 'Tùy chỉnh giao diện' }).click();
  const drawer = page.getByRole('dialog', { name: 'Tùy chỉnh giao diện' });
  await expect(drawer).toBeVisible();
  await drawer.getByRole('button', { name: 'Tối', exact: true }).click();
  for (const [name, key, color] of [['Lục bảo', 'emerald', '#059669'], ['San hô', 'coral', '#e11d48'], ['Đại dương', 'ocean', '#0284c7'], ['Hoàng kim', 'amber', '#d97706']] as const) {
    await drawer.getByRole('button', { name: `Màu ${name}` }).click();
    await expect(page.locator('html')).toHaveAttribute('data-accent', key);
    await expect(page.locator('#overview-area stop').first()).toHaveAttribute('stop-color', color);
  }
  await drawer.getByRole('button', { name: 'Màu Indigo' }).click();
  await drawer.getByRole('button', { name: /Gọn/ }).click();
  await drawer.getByRole('button', { name: 'Tăng cỡ chữ' }).click();
  await drawer.getByRole('checkbox', { name: /Giảm hiệu ứng động/ }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'indigo');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  const stop = page.locator('#overview-area stop').first();
  await expect(stop).toHaveAttribute('stop-color', '#6366f1');
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Tùy chỉnh giao diện' })).toBeFocused();
  await page.screenshot({ path: 'artifacts/dashboard-dark.png', fullPage: true });
  await page.getByRole('tab', { name: /Sản phẩm/ }).click();
  await expect(page.locator('.data-table tbody tr')).toHaveCount(20);
  await page.getByLabel('Tìm sản phẩm').fill('Cà phê');
  await expect(page.locator('.data-table')).toContainText('Cà phê');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Xuất CSV' }).click();
  expect((await download).suggestedFilename()).toBe('bao_cao_san_pham.csv');
  await page.getByRole('tab', { name: /Khách hàng/ }).click();
  await expect(page.locator('.data-table tbody tr')).toHaveCount(20);
  await page.getByRole('button', { name: 'Trang sau' }).click();
  await expect(page.locator('.table-pagination')).toContainText('21–40');
  await page.getByRole('button', { name: 'Báo cáo làm sạch' }).click();
  await expect(page.getByRole('dialog', { name: 'Báo cáo làm sạch' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');
  expect(await page.locator('html').evaluate(element => getComputedStyle(element).fontSize)).toBe('18px');
  expect(errors).toEqual([]);
});

test('50,000 rows stay responsive and reduced motion skips counters and confetti', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await page.goto('/');
  let csv = 'Ngày bán,Tên sản phẩm,Số lượng,Doanh thu,Giá vốn,Mã đơn hàng,Mã khách hàng\n';
  for (let index = 0; index < 50000; index++) csv += `2026-09-01,SP${index % 5},1,100,60,HD${Math.floor(index / 5)},KH${Math.floor(index / 5) % 300}\n`;
  await page.locator('input[type=file]').setInputFiles({ name: '50000.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.getByRole('heading', { name: 'Đúng cột. Đúng góc nhìn.' })).toBeVisible();
  await page.getByRole('button', { name: 'Khám phá dữ liệu', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Tổng quan', exact: true })).toBeVisible();
  await expect(page.locator('.kpi-card').filter({ hasText: 'Tổng doanh thu' })).toContainText('5 triệu đ');
  await expect(page.locator('.kpi-card').filter({ hasText: 'Tổng đơn hàng' })).toContainText('10.000');
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(await page.locator('.reveal').first().evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  await page.getByRole('button', { name: 'Tùy chỉnh giao diện' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('mobile layout, missing fields and OS theme changes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Tùy chỉnh giao diện' }).click();
  await page.getByRole('button', { name: 'Hệ thống', exact: true }).click();
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.keyboard.press('Escape');
  await page.locator('input[type=file]').setInputFiles({ name: 'minimal.csv', mimeType: 'text/csv', buffer: Buffer.from('Ngày bán,Tên sản phẩm,Số lượng,Doanh thu\n2026-09-01,Trà,2,100000\n') });
  await page.getByRole('button', { name: 'Khám phá dữ liệu', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Tổng quan', exact: true })).toBeVisible();
  await expect(page.locator('.kpi-card').filter({ hasText: 'Tổng đơn hàng' })).toContainText('Chưa đủ dữ liệu');
  await page.getByRole('tab', { name: /Khách hàng/ }).click();
  await expect(page.getByRole('heading', { name: 'Thêm một mảnh ghép: Khách hàng' })).toBeVisible();
  await page.evaluate(async () => { await Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))); });
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.screenshot({ path: 'artifacts/mobile-missing-data.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Excel upload and cancellation return to a usable page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.route('**/sample-data/du_lieu_ban_hang_mau.csv', () => {});
  await page.getByRole('button', { name: 'Khám phá', exact: true }).click();
  await expect(page.getByRole('progressbar')).toBeVisible();
  await page.getByRole('button', { name: 'Hủy xử lý' }).click();
  await expect(page.getByRole('button', { name: 'Chọn file bán hàng' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.locator('input[type=file]').setInputFiles('public/sample-data/du_lieu_ban_hang_mau.xlsx');
  await expect(page.getByRole('heading', { name: 'Đúng cột. Đúng góc nhìn.' })).toBeVisible();
  await page.getByRole('button', { name: 'Khám phá dữ liệu', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Tổng quan', exact: true })).toBeVisible();
  await expect(page.locator('.kpi-card').filter({ hasText: 'Tổng doanh thu' })).not.toContainText('Chưa đủ dữ liệu');
  await page.getByRole('button', { name: 'Phân tích file mới' }).click();
  await expect(page.getByRole('button', { name: 'Chọn file bán hàng' })).toBeVisible();
});
