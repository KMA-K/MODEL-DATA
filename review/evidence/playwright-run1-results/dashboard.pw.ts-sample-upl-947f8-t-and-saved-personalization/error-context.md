# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.pw.ts >> sample upload, live theme, charts, full tables, export and saved personalization
- Location: tests\browser\dashboard.pw.ts:12:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByRole('dialog', { name: 'Tùy chỉnh giao diện' })
Expected: visible
Received: hidden
Timeout:  15000ms

Call log:
  - Expect "toBeVisible" getByRole('dialog', { name: 'Tùy chỉnh giao diện' }) with timeout 15000ms
  - waiting for getByRole('dialog', { name: 'Tùy chỉnh giao diện' })
    33 × locator resolved to <dialog open="" aria-labelledby="theme-title" class="glass-dialog theme-drawer ">…</dialog>
       - unexpected value "hidden"

```

```yaml
- banner:
  - button "Bấm vào logo để quay về trang chính":
    - paragraph: Bán Hàng Smarter.
    - paragraph: Dữ liệu nhỏ. Góc nhìn lớn.
  - text: Không gian riêng của bạn
  - button "Phân tích file mới"
- text: Dữ liệu được xử lý 100% trên thiết bị của bạn, bảo mật tuyệt đối và
- strong: KHÔNG
- text: gửi lên bất kỳ máy chủ nào.
- main:
  - paragraph: KHÔNG GIAN KINH DOANH
  - heading "Mỗi con số, một cơ hội." [level=1]
  - paragraph: Hiểu cửa hàng hôm nay. Quyết định tự tin hơn ngày mai.
  - text: 2025-10-01 — 2026-09-30 du_lieu_ban_hang_mau.csv 4.939 dòng hợp lệ 92 dòng bị loại
  - button "Báo cáo làm sạch"
  - tablist "Phân tích bán hàng":
    - tab "Tổng quan" [selected]
    - tab "Sản phẩm 50"
    - tab "Khách hàng 300"
  - tabpanel "Tổng quan":
    - text: Tổng doanh thu
    - paragraph: 365 ngày kinh doanh được ghi nhận
    - text: Lợi nhuận gộp
    - paragraph: Biên lợi nhuận 25.7% · 100% doanh thu có giá vốn
    - text: Tổng đơn hàng
    - paragraph: 10.907 sản phẩm đã bán
    - text: Giá trị đơn trung bình
    - paragraph: Doanh thu bình quân mỗi hóa đơn
    - paragraph: Điểm tin kinh doanh
    - paragraph:
      - text: Cửa hàng ghi nhận
      - strong: 2.627 đơn
      - text: với tổng doanh thu
      - strong: 734,8 triệu đ
      - text: trong 365 ngày, ghi nhận lợi nhuận gộp
      - strong: 188,7 triệu đ
      - text: trên phần dữ liệu có giá vốn (100% doanh thu; biên lãi
      - strong: 25.7%
      - text: ). Giá trị trung bình mỗi đơn đạt
      - strong: 279.712 đ
      - text: .
    - heading "Nhịp kinh doanh của cửa hàng" [level=2]
    - paragraph: Doanh thu và lợi nhuận theo tháng
    - text: 12 tháng Doanh thu Lợi nhuận gộp
    - application: 10 11 12 01 02 03 04 05 06 07 08 09 0tr 20tr 40tr 60tr 80tr
    - paragraph: Tháng cao điểm nhất là 2025-12 (68,1 triệu đ). Doanh thu tháng gần nhất (2026-09) có xu hướng ổn định 0.8% so với tháng trước.
    - heading "Những mặt hàng dẫn đầu" [level=2]
    - paragraph: Top 5 theo doanh thu
    - text: "01"
    - paragraph: Nước giặt OMO Matic cửa trên túi 3.6kg
    - strong: 81,3 triệu đ
    - text: "02"
    - paragraph: Mì Hảo Hảo tôm chua cay thùng 30 gói
    - strong: 71,9 triệu đ
    - text: "03"
    - paragraph: Nước xả vải Comfort đậm đặc túi 3.2L
    - strong: 62 triệu đ
    - text: "04"
    - paragraph: Cà phê rang xay Robusta Đắk Lắk 500g
    - strong: 57,7 triệu đ
    - text: "05"
    - paragraph: Hạt điều rang muối Bình Phước 500g
    - strong: 44,6 triệu đ
    - paragraph: MẶT HÀNG
    - paragraph: "50"
    - paragraph: KHÁCH HÀNG
    - paragraph: "300"
    - paragraph: TỪ DỮ LIỆU ĐẾN HÀNH ĐỘNG
    - heading "Cơ hội tiếp theo của bạn" [level=2]
    - text: 5 gợi ý
    - heading "Chăm sóc 65 khách hàng đang có nguy cơ rời đi" [level=3]
    - paragraph: Nhóm này từng chi tiêu tổng cộng 97,1 triệu đ nhưng đã hơn 60 ngày không mua hàng. Nên gửi tin nhắn Zalo/SMS thăm hỏi, tặng mã giảm giá tri ân hoặc giới thiệu mặt hàng họ từng yêu thích.
    - text: 65 khách cần liên hệ
    - heading "Đảm bảo nguồn hàng cho 20 sản phẩm chủ lực (Nhóm A)" [level=3]
    - paragraph: Chỉ 20 mặt hàng này mang về 80% doanh thu toàn tiệm (587,9 triệu đ), dẫn đầu là "Nước giặt OMO Matic cửa trên túi 3.6kg". Hãy luôn kiểm kê và đặt hàng nhà cung cấp sớm để tránh đứt hàng vào giờ cao điểm.
    - text: 80% doanh thu
    - heading "Thanh lý hoặc ngừng nhập 5 sản phẩm bán chậm" [level=3]
    - paragraph: Các mặt hàng như "Túi rác tự phân hủy sinh học Opec 1kg", "Khăn giấy lụa Paseo 3 lớp hộp 130 tờ", "Đường tinh luyện Biên Hòa 1kg"... có doanh thu rất thấp và sức mua đang giảm sút. Bạn nên gom làm quà tặng kèm, bán thanh lý thu hồi vốn và không nên tiếp tục nhập thêm số lượng lớn.
    - text: 5 mã hàng bán chậm
    - heading "Tạo combo bán chéo \"Mì Hảo Hảo tôm chua cay thùng 30 gói\" & \"Xúc xích tiệt trùng Vissan gói 5 cây\"" [level=3]
    - paragraph: Khách hàng đã mua cùng 2 món này trong 145 hóa đơn (8.1% các đơn từ 2 món). Bạn nên đặt 2 món cạnh nhau trên kệ trưng bày hoặc tạo gói khuyến mãi mua kèm để gia tăng giá trị giỏ hàng.
    - text: 145 đơn mua chung
    - heading "Gia tăng giá trị đơn hàng trung bình (hiện tại 279.712 đ)" [level=3]
    - paragraph: Để tăng thêm doanh thu mà không cần tìm thêm khách mới, hãy áp dụng chương trình "Hóa đơn trên 360.000 đ được tặng thêm quà nhỏ hoặc miễn phí giao hàng".
    - text: "AOV: 279.712 đ Khách VIP"
    - paragraph: Khách chi tiêu cao và còn gắn bó
    - text: Sản phẩm chủ lực
    - paragraph: Đóng góp 80% doanh thu
  - text: Bán Hàng Smarter · Những quyết định tốt bắt đầu từ dữ liệu rõ ràng.
- button "Tùy chỉnh giao diện" [expanded]
- dialog "Tùy chỉnh giao diện":
  - paragraph: THEO CÁCH CỦA BẠN
  - heading "Tùy chỉnh giao diện" [level=2]
  - paragraph: Một không gian làm việc thật dễ chịu.
  - group "Chế độ hiển thị":
    - text: Chế độ hiển thị
    - button "Sáng"
    - button "Tối"
    - button "Hệ thống" [pressed]
  - group "Màu chủ đạo Lục bảo":
    - text: Màu chủ đạo Lục bảo
    - button "Màu Lục bảo" [pressed]
    - button "Màu Indigo"
    - button "Màu San hô"
    - button "Màu Đại dương"
    - button "Màu Hoàng kim"
  - group "Mật độ hiển thị":
    - text: Mật độ hiển thị
    - button "Thoáng Thêm khoảng thở" [pressed]:
      - strong: Thoáng
      - text: Thêm khoảng thở
    - button "Gọn Nhiều dữ liệu hơn":
      - strong: Gọn
      - text: Nhiều dữ liệu hơn
  - group "Cỡ chữ":
    - text: Cỡ chữ
    - button "Giảm cỡ chữ" [disabled]
    - text: Aa Tiêu chuẩn
    - button "Tăng cỡ chữ"
  - group "Chuyển động":
    - text: Chuyển động
    - strong: Giảm hiệu ứng động
    - text: Hiển thị ngay, nhẹ máy hơn
    - checkbox "Giảm hiệu ứng độngHiển thị ngay, nhẹ máy hơn"
  - text: Các thay đổi được áp dụng ngay và tự động lưu.
  - button "Khôi phục mặc định"
  - button "Đóng cửa sổ": ×
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
> 23  |   await expect(drawer).toBeVisible();
      |                        ^ Error: expect(locator).toBeVisible() failed
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