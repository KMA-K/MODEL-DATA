# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.pw.ts >> mobile layout, missing fields and OS theme changes
- Location: tests\browser\dashboard.pw.ts:81:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - button "Bấm vào logo để quay về trang chính" [ref=e4] [cursor=pointer]:
        - generic [ref=e10]:
          - paragraph [ref=e11]: Bán Hàng Smarter.
          - paragraph [ref=e12]: Dữ liệu nhỏ. Góc nhìn lớn.
      - generic [ref=e13]:
        - generic [ref=e14]: Không gian riêng của bạn
        - button "Phân tích file mới" [ref=e16] [cursor=pointer]
    - generic [ref=e25]:
      - text: Dữ liệu được xử lý 100% trên thiết bị của bạn, bảo mật tuyệt đối và
      - strong [ref=e26]: KHÔNG
      - text: gửi lên bất kỳ máy chủ nào.
    - main [ref=e27]:
      - generic [ref=e28]:
        - generic [ref=e29]:
          - generic [ref=e30]:
            - paragraph [ref=e31]: KHÔNG GIAN KINH DOANH
            - heading "Mỗi con số, một cơ hội." [level=1] [ref=e32]
            - paragraph [ref=e33]: Hiểu cửa hàng hôm nay. Quyết định tự tin hơn ngày mai.
          - generic [ref=e34]: 2026-09-01 — 2026-09-01
        - generic [ref=e37]:
          - generic [ref=e38]:
            - generic [ref=e42]: minimal.csv
            - generic [ref=e43]: 1 dòng hợp lệ
          - button "Báo cáo làm sạch" [ref=e47] [cursor=pointer]
        - tablist "Phân tích bán hàng" [ref=e50]:
          - tab "Tổng quan" [ref=e51] [cursor=pointer]
          - tab "Sản phẩm 1" [ref=e54] [cursor=pointer]:
            - text: Sản phẩm
            - generic [ref=e59]: "1"
          - tab "Khách hàng 0" [active] [selected] [ref=e60] [cursor=pointer]:
            - text: Khách hàng
            - generic [ref=e66]: "0"
        - tabpanel "Khách hàng 0" [ref=e67]:
          - generic [ref=e73]:
            - 'heading "Thêm một mảnh ghép: Khách hàng" [level=3] [ref=e74]'
            - paragraph [ref=e75]: Bổ sung cột Mã khách hàng để tìm khách VIP, người mới ghé và những khách lâu chưa quay lại. Bạn vẫn có thể xem doanh thu và sản phẩm ở các tab bên cạnh.
      - generic [ref=e76]: Bán Hàng Smarter · Những quyết định tốt bắt đầu từ dữ liệu rõ ràng.
    - button "Tùy chỉnh giao diện" [ref=e77] [cursor=pointer]
  - generic [aria-hidden] [ref=e85]: 0tr
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import type { Page } from '@playwright/test';
  3   | 
  4   | async function sampleDashboard(page: Page) {
  5   |   await page.goto('/');
  6   |   await page.getByRole('button', { name: 'Khám phá', exact: true }).click();
  7   |   await expect(page.getByRole('heading', { name: 'Đúng cột. Đúng góc nhìn.' })).toBeVisible();
  8   |   await expect(page.locator('#map-productCol')).toHaveValue('Tên sản phẩm');
  9   |   await page.getByRole('button', { name: 'Khám phá dữ liệu', exact: true }).click();
  10  |   await expect(page.getByRole('tab', { name: 'Tổng quan', exact: true })).toBeVisible();
  11  | }
  12  | test('sample upload, live theme, charts, full tables, export and saved personalization', async ({ page }) => {
  13  |   const errors: string[] = [];
  14  |   page.on('pageerror', error => errors.push(error.message));
  15  |   await page.goto('/');
  16  |   await page.evaluate(async () => { await Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))); });
  17  |   await page.screenshot({ path: 'artifacts/welcome.png', fullPage: true });
  18  |   await sampleDashboard(page);
  19  |   await expect(page.locator('svg defs #overview-area')).toHaveCount(1);
  20  |   await expect(page.locator('.recharts-area')).toBeVisible();
  21  |   await page.getByRole('button', { name: 'Tùy chỉnh giao diện' }).click();
  22  |   const drawer = page.getByRole('dialog', { name: 'Tùy chỉnh giao diện' });
  23  |   await expect(drawer).toBeVisible();
  24  |   await drawer.getByRole('button', { name: 'Tối', exact: true }).click();
  25  |   for (const [name, key, color] of [['Lục bảo', 'emerald', '#059669'], ['San hô', 'coral', '#e11d48'], ['Đại dương', 'ocean', '#0284c7'], ['Hoàng kim', 'amber', '#d97706']] as const) {
  26  |     await drawer.getByRole('button', { name: `Màu ${name}` }).click();
  27  |     await expect(page.locator('html')).toHaveAttribute('data-accent', key);
  28  |     await expect(page.locator('#overview-area stop').first()).toHaveAttribute('stop-color', color);
  29  |   }
  30  |   await drawer.getByRole('button', { name: 'Màu Indigo' }).click();
  31  |   await drawer.getByRole('button', { name: /Gọn/ }).click();
  32  |   await drawer.getByRole('button', { name: 'Tăng cỡ chữ' }).click();
  33  |   await drawer.getByRole('checkbox', { name: /Giảm hiệu ứng động/ }).check();
  34  |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  35  |   await expect(page.locator('html')).toHaveAttribute('data-accent', 'indigo');
  36  |   await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  37  |   const stop = page.locator('#overview-area stop').first();
  38  |   await expect(stop).toHaveAttribute('stop-color', '#6366f1');
  39  |   await page.keyboard.press('Escape');
  40  |   await expect(drawer).not.toBeVisible();
  41  |   await expect(page.getByRole('button', { name: 'Tùy chỉnh giao diện' })).toBeFocused();
  42  |   await page.screenshot({ path: 'artifacts/dashboard-dark.png', fullPage: true });
  43  |   await page.getByRole('tab', { name: /Sản phẩm/ }).click();
  44  |   await expect(page.locator('.data-table tbody tr')).toHaveCount(20);
  45  |   await page.getByLabel('Tìm sản phẩm').fill('Cà phê');
  46  |   await expect(page.locator('.data-table')).toContainText('Cà phê');
  47  |   const download = page.waitForEvent('download');
  48  |   await page.getByRole('button', { name: 'Xuất CSV' }).click();
  49  |   expect((await download).suggestedFilename()).toBe('bao_cao_san_pham.csv');
  50  |   await page.getByRole('tab', { name: /Khách hàng/ }).click();
  51  |   await expect(page.locator('.data-table tbody tr')).toHaveCount(20);
  52  |   await page.getByRole('button', { name: 'Trang sau' }).click();
  53  |   await expect(page.locator('.table-pagination')).toContainText('21–40');
  54  |   await page.getByRole('button', { name: 'Báo cáo làm sạch' }).click();
  55  |   await expect(page.getByRole('dialog', { name: 'Báo cáo làm sạch' })).toBeVisible();
  56  |   await page.keyboard.press('Escape');
  57  |   await page.reload();
  58  |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  59  |   await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');
  60  |   expect(await page.locator('html').evaluate(element => getComputedStyle(element).fontSize)).toBe('18px');
  61  |   expect(errors).toEqual([]);
  62  | });
  63  | 
  64  | test('50,000 rows stay responsive and reduced motion skips counters and confetti', async ({ page }) => {
  65  |   await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  66  |   await page.goto('/');
  67  |   let csv = 'Ngày bán,Tên sản phẩm,Số lượng,Doanh thu,Giá vốn,Mã đơn hàng,Mã khách hàng\n';
  68  |   for (let index = 0; index < 50000; index++) csv += `2026-09-01,SP${index % 5},1,100,60,HD${Math.floor(index / 5)},KH${Math.floor(index / 5) % 300}\n`;
  69  |   await page.locator('input[type=file]').setInputFiles({ name: '50000.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  70  |   await expect(page.getByRole('heading', { name: 'Đúng cột. Đúng góc nhìn.' })).toBeVisible();
  71  |   await page.getByRole('button', { name: 'Khám phá dữ liệu', exact: true }).click();
  72  |   await expect(page.getByRole('tab', { name: 'Tổng quan', exact: true })).toBeVisible();
  73  |   await expect(page.locator('.kpi-card').filter({ hasText: 'Tổng doanh thu' })).toContainText('5 triệu đ');
  74  |   await expect(page.locator('.kpi-card').filter({ hasText: 'Tổng đơn hàng' })).toContainText('10.000');
  75  |   await expect(page.locator('canvas')).toHaveCount(0);
  76  |   expect(await page.locator('.reveal').first().evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  77  |   await page.getByRole('button', { name: 'Tùy chỉnh giao diện' }).click();
  78  |   await expect(page.getByRole('dialog')).toBeVisible();
  79  | });
  80  | 
  81  | test('mobile layout, missing fields and OS theme changes', async ({ page }) => {
  82  |   await page.setViewportSize({ width: 390, height: 844 });
  83  |   await page.emulateMedia({ colorScheme: 'light' });
  84  |   await page.goto('/');
  85  |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  86  |   await page.getByRole('button', { name: 'Tùy chỉnh giao diện' }).click();
  87  |   await page.getByRole('button', { name: 'Hệ thống', exact: true }).click();
  88  |   await page.emulateMedia({ colorScheme: 'dark' });
  89  |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  90  |   await page.keyboard.press('Escape');
  91  |   await page.locator('input[type=file]').setInputFiles({ name: 'minimal.csv', mimeType: 'text/csv', buffer: Buffer.from('Ngày bán,Tên sản phẩm,Số lượng,Doanh thu\n2026-09-01,Trà,2,100000\n') });
  92  |   await page.getByRole('button', { name: 'Khám phá dữ liệu', exact: true }).click();
  93  |   await expect(page.getByRole('tab', { name: 'Tổng quan', exact: true })).toBeVisible();
  94  |   await expect(page.locator('.kpi-card').filter({ hasText: 'Tổng đơn hàng' })).toContainText('Chưa đủ dữ liệu');
  95  |   await page.getByRole('tab', { name: /Khách hàng/ }).click();
  96  |   await expect(page.getByRole('heading', { name: 'Thêm một mảnh ghép: Khách hàng' })).toBeVisible();
  97  |   await page.evaluate(async () => { await Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))); });
  98  |   await expect(page.locator('canvas')).toHaveCount(0);
  99  |   await page.screenshot({ path: 'artifacts/mobile-missing-data.png', fullPage: true });
> 100 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      |                                                                                         ^ Error: expect(received).toBe(expected) // Object.is equality
  101 | });
  102 | 
  103 | test('Excel upload and cancellation return to a usable page', async ({ page }) => {
  104 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  105 |   await page.goto('/');
  106 |   await page.route('**/sample-data/du_lieu_ban_hang_mau.csv', () => {});
  107 |   await page.getByRole('button', { name: 'Khám phá', exact: true }).click();
  108 |   await expect(page.getByRole('progressbar')).toBeVisible();
  109 |   await page.getByRole('button', { name: 'Hủy xử lý' }).click();
  110 |   await expect(page.getByRole('button', { name: 'Chọn file bán hàng' })).toBeVisible();
  111 |   await expect(page.getByRole('alert')).toHaveCount(0);
  112 |   await page.locator('input[type=file]').setInputFiles('public/sample-data/du_lieu_ban_hang_mau.xlsx');
  113 |   await expect(page.getByRole('heading', { name: 'Đúng cột. Đúng góc nhìn.' })).toBeVisible();
  114 |   await page.getByRole('button', { name: 'Khám phá dữ liệu', exact: true }).click();
  115 |   await expect(page.getByRole('tab', { name: 'Tổng quan', exact: true })).toBeVisible();
  116 |   await expect(page.locator('.kpi-card').filter({ hasText: 'Tổng doanh thu' })).not.toContainText('Chưa đủ dữ liệu');
  117 |   await page.getByRole('button', { name: 'Phân tích file mới' }).click();
  118 |   await expect(page.getByRole('button', { name: 'Chọn file bán hàng' })).toBeVisible();
  119 | });
  120 | 
```