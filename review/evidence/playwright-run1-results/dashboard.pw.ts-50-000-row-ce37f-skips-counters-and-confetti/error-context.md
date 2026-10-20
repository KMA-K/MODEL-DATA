# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.pw.ts >> 50,000 rows stay responsive and reduced motion skips counters and confetti
- Location: tests\browser\dashboard.pw.ts:64:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "none"
Received: "appleSpringReveal"
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
            - generic [ref=e42]: 50000.csv
            - generic [ref=e43]: 50.000 dòng hợp lệ
          - button "Báo cáo làm sạch" [ref=e47] [cursor=pointer]
        - tablist "Phân tích bán hàng" [ref=e50]:
          - tab "Tổng quan" [selected] [ref=e51] [cursor=pointer]
          - tab "Sản phẩm 5" [ref=e54] [cursor=pointer]:
            - text: Sản phẩm
            - generic [ref=e59]: "5"
          - tab "Khách hàng 300" [ref=e60] [cursor=pointer]:
            - text: Khách hàng
            - generic [ref=e66]: "300"
        - tabpanel "Tổng quan" [ref=e67]:
          - generic [ref=e68]:
            - generic [ref=e69]:
              - generic [ref=e70]:
                - generic [ref=e71]: Tổng doanh thu
                - generic "5 triệu đ" [ref=e78]
                - paragraph [ref=e79]: 1 ngày kinh doanh được ghi nhận
              - generic [ref=e80]:
                - generic [ref=e81]: Lợi nhuận gộp
                - generic "2 triệu đ" [ref=e88]
                - paragraph [ref=e89]: Biên lợi nhuận 40% · 100% doanh thu có giá vốn
              - generic [ref=e90]:
                - generic [ref=e91]: Tổng đơn hàng
                - generic "10.000" [ref=e98]
                - paragraph [ref=e99]: 50.000 sản phẩm đã bán
              - generic [ref=e100]:
                - generic [ref=e101]: Giá trị đơn trung bình
                - generic "500 đ" [ref=e108]
                - paragraph [ref=e109]: Doanh thu bình quân mỗi hóa đơn
            - generic [ref=e115]:
              - paragraph [ref=e116]: Điểm tin kinh doanh
              - paragraph [ref=e117]:
                - text: Cửa hàng ghi nhận
                - strong [ref=e118]: 10.000 đơn
                - text: với tổng doanh thu
                - strong [ref=e119]: 5 triệu đ
                - text: trong 1 ngày, ghi nhận lợi nhuận gộp
                - strong [ref=e120]: 2 triệu đ
                - text: trên phần dữ liệu có giá vốn (100% doanh thu; biên lãi
                - strong [ref=e121]: 40%
                - text: ). Giá trị trung bình mỗi đơn đạt
                - strong [ref=e122]: 500 đ
                - text: .
            - generic [ref=e123]:
              - generic [ref=e124]:
                - generic [ref=e125]:
                  - generic [ref=e126]:
                    - heading "Nhịp kinh doanh của cửa hàng" [level=2] [ref=e127]
                    - paragraph [ref=e128]: Doanh thu và lợi nhuận theo tháng
                  - generic [ref=e129]: 1 tháng
                - generic [ref=e130]:
                  - generic [ref=e131]: Doanh thu
                  - generic [ref=e133]: Lợi nhuận gộp
                - application [ref=e138]:
                  - generic [ref=e152]:
                    - generic [ref=e153]: "09"
                    - generic [ref=e156]:
                      - generic [ref=e157]: 0tr
                      - generic [ref=e159]: 2tr
                      - generic [ref=e161]: 3tr
                      - generic [ref=e163]: 5tr
                      - generic [ref=e165]: 6tr
                - paragraph [ref=e167]: Dữ liệu phát sinh trong 1 tháng duy nhất.
              - generic [ref=e168]:
                - generic [ref=e170]:
                  - heading "Những mặt hàng dẫn đầu" [level=2] [ref=e171]
                  - paragraph [ref=e172]: Top 5 theo doanh thu
                - generic [ref=e177]:
                  - generic [ref=e178]:
                    - generic [ref=e179]: "01"
                    - paragraph [ref=e181]: SP0
                    - strong [ref=e184]: 1 triệu đ
                  - generic [ref=e185]:
                    - generic [ref=e186]: "02"
                    - paragraph [ref=e188]: SP1
                    - strong [ref=e191]: 1 triệu đ
                  - generic [ref=e192]:
                    - generic [ref=e193]: "03"
                    - paragraph [ref=e195]: SP2
                    - strong [ref=e198]: 1 triệu đ
                  - generic [ref=e199]:
                    - generic [ref=e200]: "04"
                    - paragraph [ref=e202]: SP3
                    - strong [ref=e205]: 1 triệu đ
                  - generic [ref=e206]:
                    - generic [ref=e207]: "05"
                    - paragraph [ref=e209]: SP4
                    - strong [ref=e212]: 1 triệu đ
                - generic [ref=e213]:
                  - generic [ref=e214]:
                    - paragraph [ref=e215]: MẶT HÀNG
                    - paragraph [ref=e216]: "5"
                  - generic [ref=e217]:
                    - paragraph [ref=e218]: KHÁCH HÀNG
                    - paragraph [ref=e219]: "300"
            - generic [ref=e220]:
              - generic [ref=e221]:
                - generic [ref=e222]:
                  - paragraph [ref=e223]: TỪ DỮ LIỆU ĐẾN HÀNH ĐỘNG
                  - heading "Cơ hội tiếp theo của bạn" [level=2] [ref=e224]
                - generic [ref=e225]: 3 gợi ý
              - generic [ref=e226]:
                - generic [ref=e227]:
                  - heading "Đảm bảo nguồn hàng cho 4 sản phẩm chủ lực (Nhóm A)" [level=3] [ref=e233]
                  - paragraph [ref=e234]: Chỉ 4 mặt hàng này mang về 80% doanh thu toàn tiệm (4 triệu đ), dẫn đầu là "SP0". Hãy luôn kiểm kê và đặt hàng nhà cung cấp sớm để tránh đứt hàng vào giờ cao điểm.
                  - generic [ref=e235]: 80% doanh thu
                - generic [ref=e236]:
                  - heading "Tạo combo bán chéo \"SP0\" & \"SP1\"" [level=3] [ref=e240]
                  - paragraph [ref=e241]: Khách hàng đã mua cùng 2 món này trong 10000 hóa đơn (100% các đơn từ 2 món). Bạn nên đặt 2 món cạnh nhau trên kệ trưng bày hoặc tạo gói khuyến mãi mua kèm để gia tăng giá trị giỏ hàng.
                  - generic [ref=e242]: 10000 đơn mua chung
                - generic [ref=e243]:
                  - heading "Gia tăng giá trị đơn hàng trung bình (hiện tại 500 đ)" [level=3] [ref=e247]
                  - paragraph [ref=e248]: Để tăng thêm doanh thu mà không cần tìm thêm khách mới, hãy áp dụng chương trình "Hóa đơn trên 0 đ được tặng thêm quà nhỏ hoặc miễn phí giao hàng".
                  - generic [ref=e249]: "AOV: 500 đ"
            - generic [ref=e250]:
              - generic [ref=e251]:
                - generic [ref=e252]: Khách VIP
                - generic "100" [ref=e258]
                - paragraph [ref=e259]: Khách chi tiêu cao và còn gắn bó
              - generic [ref=e260]:
                - generic [ref=e261]: Sản phẩm chủ lực
                - generic "4" [ref=e269]
                - paragraph [ref=e270]: Đóng góp 80% doanh thu
      - generic [ref=e271]: Bán Hàng Smarter · Những quyết định tốt bắt đầu từ dữ liệu rõ ràng.
    - button "Tùy chỉnh giao diện" [ref=e272] [cursor=pointer]
  - generic [aria-hidden] [ref=e280]: 0tr
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
> 76  |   expect(await page.locator('.reveal').first().evaluate(element => getComputedStyle(element).animationName)).toBe('none');
      |                                                                                                              ^ Error: expect(received).toBe(expected) // Object.is equality
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
  100 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
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