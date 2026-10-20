# Báo cáo QA độc lập — Bán Hàng Smarter

Ngày thực hiện: **14/10/2026**. Đã dùng **Microsoft Edge 155.0.4283.45 thật, headless qua Playwright**, chụp và xem ảnh. Môi trường Windows, Node 24.14.0, npm 11.9.0, múi giờ Asia/Ho_Chi_Minh. Kiểm thử ở 375×1000,768×1000,1366×1000; test dự án còn có 390×844 và 1440×1000. Không sửa mã nguồn.

## Kết luận và ưu tiên

Ghi nhận **18 mục**: 3 nghiêm trọng, 11 quan trọng, 3 nhỏ, 1 gợi ý. Chưa nên bàn giao rộng rãi cho người dùng không rành kỹ thuật: còn rủi ro số liệu, nhận xét gây hiểu nhầm, lỗi mobile và dependency bị audit cảnh báo.

Ưu tiên ba nhóm: (1) kiểm tính nhất quán và chính sách trùng của hóa đơn/dòng hàng (UI-06/UI-14); (2) sửa tỷ trọng doanh thu khách và điều kiện độ tin cậy RFM/nhận xét (UI-05/UI-17/UI-18); (3) xử lý dependency xlsx high trước khi nhận Excel từ người dùng thực (UI-12). Song song hoàn thiện CSS/mobile.

**Phân biệt lỗi và rủi ro thiết kế:** UI-06 tuân theo chữ ký đã quy định nhưng có thể loại dòng bán thật; UI-14 tái dùng mã là dữ liệu không nhất quán nhưng app vẫn gọi mã tin cậy. UI-09 là gợi ý chống nhập nhầm, phép nhân vốn đơn vị hiện đúng. Không kết luận khai thác bảo mật đã xảy ra.

## Bảo toàn dự án và phương pháp

Mọi dữ liệu thử, script, ảnh, log và kết quả nằm trong `review/`. Cài đặt/build/lint/test chạy trên snapshot `review/project` để không ghi vào src/public/config/README, node_modules/dist/artifacts/test-results gốc. Đối chiếu SHA-256 trước/sau: **85 file gốc không thay đổi, không mất và không thêm file bên ngoài review**; node_modules gốc được loại khỏi danh sách hash và không chạy lệnh cài đặt trên đó. [evidence/integrity-result.json](evidence/integrity-result.json).

Oracle JS tự viết (`oracle.cjs`) không import code dự án; dùng parser CSV riêng, tính tổng theo dòng và nhóm bằng cách độc lập. Oracle nhỏ chứa 28 dòng, 6 sản phẩm, 6 khách, 18 hóa đơn; đủ sáu phân khúc và ABC 80/95. Trong các phép so sánh, dữ liệu UI/CSV xuất và tooltip là bằng chứng chính; message Worker đọc trên trình duyệt bổ sung trường không hiển thị. Không coi trường chỉ thấy trong Worker là đã hiển thị trên UI.

Browser được gắn listener QA để ghi progress/result và đếm Worker/object URL; không sửa file hoặc phép tính ứng dụng. Các ảnh chờ lazy-load/animation hữu hạn hoàn tất. Đã xem ảnh gốc các màn hình chính, ảnh lỗi và 10 contact sheet đại diện toàn bộ 55 file. Dữ liệu/console hai lượt được so sánh để xác nhận tái tạo, không mặc định pass vì không crash.

## Bước 0 — Lệnh và kết quả

| Lệnh | Kết quả thực tế | Bằng chứng |
| --- | --- | --- |
| npm ci | Lần sandbox lỗi EACCES/Exit handler never called; chạy lại được cấp quyền thành công, thêm 116 package; không phải lỗi build ứng dụng. | [logs/ci.log](logs/ci.log); [logs/ci-escalated.log](logs/ci-escalated.log) |
| npm run build | Đạt, exit 0; tsc và Vite 8.3.4 tạo bản build. | [logs/build.log](logs/build.log) |
| npm run lint | Đạt, exit 0; không có lỗi/cảnh báo lint được in. | [logs/lint.log](logs/lint.log) |
| npm run test | 7 file, 21 test đạt, 0 trượt. | [logs/unit.log](logs/unit.log) |
| npm run test:ui | 3 trượt, 1 đạt. Lần chạy lại có font mạng kết thúc 37,5 giây/exit 1; nguyên nhân vẫn như lần sandbox. | [logs/playwright-network.log](logs/playwright-network.log) |
| npm audit --json | 1 dependency high (xlsx), 2 advisory, fixAvailable=false; exit1 là cảnh báo audit. | [logs/audit-escalated.log](logs/audit-escalated.log) |

| Kịch bản Playwright gốc | Đạt/trượt | Điểm dừng và nguyên nhân |
| --- | --- | --- |
| sample upload/theme/charts/tables/export | Trượt | dashboard.pw.ts:23: dialog cha 0×0, locator hidden dù inner nhìn thấy; UI-02. Các bước phía sau không chạy trong test này, được kiểm riêng qua ui.cjs. |
| 50.000 rows/reduced motion | Trượt | dashboard.pw.ts:76: expected none, received appleSpringReveal; duration 0,01ms/canvas 0. UI-03; KPI 5 triệu / 10.000 đơn đã qua. |
| mobile/missing fields/OS theme | Trượt | dashboard.pw.ts:100: scrollWidth>innerWidth. Theme hệ thống và thiếu dữ liệu đã qua; UI-16. |
| Excel upload/cancellation | Đạt | Toàn kịch bản hoàn tất. |

Audit được đối chiếu với [GitHub advisory prototype pollution](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6), [GitHub advisory ReDoS](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9) và [kênh cài đặt chính thức SheetJS](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/). Audit không có nghĩa file thử đã khai thác được lỗ hổng.

## Phát hiện đã tái tạo

### UI-01 · Quan trọng · Banner riêng tư che khuất thanh điều hướng

- **Thấy ở đâu:** Đầu trang của cả ba dashboard
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Nhập oracle-28.csv.
  2. Mở ba tab.
  3. Lặp lại bằng file mẫu; đã thực hiện hai lượt.
- **Thực tế:** Banner đen phủ lên phần dưới logo và nút Phân tích file mới ngay đầu trang.
- **Mong đợi:** Logo và nút điều hướng hiển thị trọn vẹn, không bị banner khác che.
- **Bằng chứng:** [screenshots/oracle-28-overview.png](screenshots/oracle-28-overview.png); [screenshots/ui-welcome-375-1.png](screenshots/ui-welcome-375-1.png); [evidence/ui-geometry-overview-375-1.json](evidence/ui-geometry-overview-375-1.json); [evidence/extra-results.json](evidence/extra-results.json).
- **Nguyên nhân trong code:** src/index.css:196 và src/index.css:252; src/App.tsx:82: header sticky top41 nằm trước banner sticky top0 z100, gây chồng khi chưa cuộn. Chắc chắn. Triệu chứng là che hình; không kết luận nút luôn không bấm được: thao tác click giữa nút trong extra đã thành công sau auto-scroll.
- **Phạm vi ảnh hưởng:** Upload, mapping và mọi dashboard, cả desktop/mobile.
- **Hướng sửa gợi ý:** Bố trí banner/header theo cùng thứ tự và tính offset sticky theo chiều cao thực tế.

### UI-02 · Nhỏ · Drawer nhìn thấy được nhưng khung dialog 0×0 làm test báo hidden

- **Thấy ở đâu:** Tùy chỉnh giao diện và test Playwright đầu tiên
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Nhập oracle-28.csv.
  2. Mở tùy chỉnh.
  3. Chụp ảnh và đo cả dialog/inner; thực hiện hai lần và ở ba kích thước.
- **Thực tế:** Panel 440×761,5px nhìn thấy và bấm được; dialog cha 0×0, locator role dialog isVisible=false. Test đầu trượt ở toBeVisible.
- **Mong đợi:** Khung dialog có kích thước phù hợp hoặc assertion kiểm nội dung thực tế. Không kết luận drawer không mở vì thực tế thao tác đổi theme được.
- **Bằng chứng:** [screenshots/theme-drawer-boundary-1.png](screenshots/theme-drawer-boundary-1.png); [screenshots/theme-drawer-boundary-2.png](screenshots/theme-drawer-boundary-2.png); [evidence/verify-results.json](evidence/verify-results.json); [logs/playwright-network.log](logs/playwright-network.log).
- **Nguyên nhân trong code:** src/index.css:1202 đặt inner fixed nên cha không có kích thước; tests/browser/dashboard.pw.ts:23 kiểm cha. Chắc chắn. Panel nhìn thấy được và đổi theme được; đây là cấu trúc CSS/độ tin cậy test, không phải drawer không mở.
- **Phạm vi ảnh hưởng:** Theme drawer và độ tin cậy của test visibility.
- **Hướng sửa gợi ý:** Bố trí fixed trên dialog hoặc quy định kích thước cha; assertion cần phản ánh nội dung người dùng nhìn thấy.

### UI-03 · Nhỏ · Test reduced motion đòi animationName none trái với CSS đang triển khai

- **Thấy ở đâu:** Test 50.000 dòng
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Bật prefers-reduced-motion.
  2. Nhập oracle/50k.
  3. Đo style; hai lần trong verify và test gốc.
- **Thực tế:** animationName=appleSpringReveal, duration=0,01ms, canvas=0; test yêu cầu none nên trượt.
- **Mong đợi:** Test và hành vi reduced motion thống nhất; thời lượng cực ngắn không đồng nghĩa animationName=none.
- **Bằng chứng:** [screenshots/h2-reduced-motion-1.png](screenshots/h2-reduced-motion-1.png); [evidence/verify-results.json](evidence/verify-results.json); [logs/playwright-network.log](logs/playwright-network.log).
- **Nguyên nhân trong code:** src/index.css:126 chỉ đổi duration/iteration; tests/browser/dashboard.pw.ts:76 yêu cầu tắt tên animation. Chắc chắn. Chưa có bằng chứng animation chuyển động dài khi đã giảm.
- **Phạm vi ảnh hưởng:** Test giảm chuyển động; delay Reveal vẫn chưa reset.
- **Hướng sửa gợi ý:** Chốt tiêu chí reduced motion, kiểm duration/delay phù hợp hoặc thực sự tắt animation theo yêu cầu.

### UI-04 · Quan trọng · Class CSS thiếu, mật độ không đổi, cỡ chữ chỉ tác động một phần

- **Thấy ở đâu:** Bảng, tooltip và tùy chỉnh giao diện
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Mở bảng oracle.
  2. Đo computed styles và chụp.
  3. Đổi Thoáng/Gọn, 16/18/20; đã làm hai lần trên ba kích thước.
- **Thực tế:** block không tồn tại nên danh mục/date cùng dòng; inline-flex/whitespace-nowrap không tác dụng; tooltip là chữ chồng không có nền riêng. Mật độ đổi data-density nhưng padding/size không đổi. Root lên 20px trong khi KPI 28px desktop/24px mobile, h1 28px, bảng 13,5px giữ nguyên.
- **Mong đợi:** Class layout phải có CSS; mật độ đổi bố cục và cỡ chữ tăng được các thông tin quan trọng.
- **Bằng chứng:** [screenshots/oracle-28-products.png](screenshots/oracle-28-products.png); [screenshots/oracle-28-customers.png](screenshots/oracle-28-customers.png); [screenshots/tooltip-overview-1.png](screenshots/tooltip-overview-1.png); [screenshots/h3-font20-products-1.png](screenshots/h3-font20-products-1.png); [evidence/verify-results.json](evidence/verify-results.json); [evidence/ui-actions.json](evidence/ui-actions.json).
- **Nguyên nhân trong code:** src/index.css:3 chỉ import font; utilities tự định nghĩa thiếu các class đã đo. src/theme/ThemeProvider.tsx:32 chỉ đặt thuộc tính không có CSS tương ứng. src/index.css:753 và các rule font px cố định giữ cỡ chữ. Chắc chắn.
- **Phạm vi ảnh hưởng:** Danh mục/date phụ, icon xu hướng, ô lời khuyên, KPI thiếu dữ liệu, tooltip và cá nhân hóa.
- **Hướng sửa gợi ý:** Hoàn thiện CSS đang dùng hoặc sinh utilities đồng bộ; dùng biến density và đơn vị font phù hợp.

### UI-05 · Quan trọng · VIP hiển thị dù mã hóa đơn chưa đủ tin cậy

- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Mở app.
  2. Nhập data/order-none.csv (hoặc .xlsx theo manifest).
  3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-order-none-1.json và -2.json.
- **Thực tế:** VIP = 1 trong khi tổng đơn/AOV báo thiếu; cờ mã đơn false. Tab khách yêu cầu mã đơn (ảnh bổ sung ở kiểm tra giả thuyết).
- **Mong đợi:** Ẩn hoặc ghi rõ chưa đủ dữ liệu cho mọi nội dung RFM.
- **Bằng chứng:** [screenshots/h1-vip-1.png](screenshots/h1-vip-1.png); [screenshots/h1-hidden-customers-1.png](screenshots/h1-hidden-customers-1.png); [screenshots/h1-vip-2.png](screenshots/h1-vip-2.png); [evidence/matrix-order-none-1.json](evidence/matrix-order-none-1.json); [evidence/verify-results.json](evidence/verify-results.json).
- **Nguyên nhân trong code:** src/components/dashboard/OverviewTab.tsx:23 chỉ xét có khách; src/components/dashboard/CustomerTab.tsx:25 chặn RFM. Chắc chắn.
- **Phạm vi ảnh hưởng:** Thiếu toàn bộ hoặc một phần mã đơn.
- **Hướng sửa gợi ý:** Dùng cùng điều kiện tin cậy cho KPI/RFM/gợi ý.

### UI-06 · Nghiêm trọng · Chữ ký trùng không phân biệt dòng bán hợp lệ và bản sao

- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Mở app.
  2. Nhập data/duplicate-real-order.csv (hoặc .xlsx theo manifest).
  3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-duplicate-real-order-1.json và -2.json.
- **Thực tế:** Hai dòng bán hợp lệ giống nhau tổng 200.000đ còn 100.000đ; report loại #2. Bản sao thiếu mã trong duplicate-no-order.csv lại giữ 200.000đ, không loại.
- **Mong đợi:** Cần phân biệt bản sao với dòng hàng riêng hoặc cho người dùng duyệt chính sách loại trùng. Đây là rủi ro của quy tắc nghiệp vụ, không phải hàm vi phạm quy tắc chữ ký đã nêu.
- **Bằng chứng:** [data/duplicate-real-order.csv](data/duplicate-real-order.csv); [data/duplicate-no-order.csv](data/duplicate-no-order.csv); [screenshots/matrix-duplicate-real-order-1-report.png](screenshots/matrix-duplicate-real-order-1-report.png); [screenshots/matrix-duplicate-no-order-1-result.png](screenshots/matrix-duplicate-no-order-1-result.png); [evidence/matrix-results.json](evidence/matrix-results.json).
- **Nguyên nhân trong code:** src/core/cleaner.ts:293 tạo AUTO có STT; src/core/cleaner.ts:301 dùng mã đó trong chữ ký. Chắc chắn. Hàm tuân theo chữ ký quy định; vấn đề là chính sách không phân biệt hai dòng hàng thật với bản sao. Đây là rủi ro nghiệp vụ đã tái tạo, không phải lỗi so sánh byte.
- **Phạm vi ảnh hưởng:** Doanh thu/số lượng/lãi và RFM sau làm sạch.
- **Hướng sửa gợi ý:** Có mã dòng hàng, chọn giữ/loại hoặc báo cáo các ứng viên trước khi quyết định; khi thiếu mã đơn đừng quảng bá bắt mọi bản sao.

### UI-07 · Quan trọng · Loại dòng có doanh thu sai nhưng báo cáo không chỉ ra lỗi định dạng

- **Thấy ở đâu:** Báo cáo làm sạch
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Nhập bad-revenue-valid-price.csv có 123abc và đơn giá hợp lệ.
  2. Phân tích.
  3. Đọc report; làm hai lần.
- **Thực tế:** Dòng bị loại; lý do chỉ ghi Doanh thu hoặc đơn giá nhỏ hơn hoặc bằng 0, dù 123abc là lỗi định dạng và đơn giá dương.
- **Mong đợi:** Nêu không phải số và chỉ rõ trường lỗi; chính sách fallback cần được giải thích trước khi loại.
- **Bằng chứng:** [screenshots/matrix-bad-revenue-valid-price-1-report.png](screenshots/matrix-bad-revenue-valid-price-1-report.png); [data/bad-revenue-valid-price.csv](data/bad-revenue-valid-price.csv); [evidence/matrix-bad-revenue-valid-price-1.json](evidence/matrix-bad-revenue-valid-price-1.json); [evidence/matrix-bad-revenue-valid-price-2.json](evidence/matrix-bad-revenue-valid-price-2.json).
- **Nguyên nhân trong code:** src/core/cleaner.ts:69 đưa chuỗi sai về 0; src/core/cleaner.ts:275 ưu tiên doanh thu có giá trị; src/core/cleaner.ts:209 mô tả không phải số thành ≤0. Chắc chắn. Việc không fallback là chính sách hiện tại; lỗi chắc chắn là giải thích nguyên nhân thiếu chính xác.
- **Phạm vi ảnh hưởng:** Chuỗi tiền sai, file có cả đơn giá/doanh thu.
- **Hướng sửa gợi ý:** Phân biệt parse lỗi với số 0 và mô tả đúng; cân nhắc fallback có xác nhận.

### UI-08 · Quan trọng · Excel khác sheet hoặc lệch header không có đường xử lý rõ

- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Mở app.
  2. Nhập data/excel-data-second.csv (hoặc .xlsx theo manifest).
  3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-excel-data-second-1.json và -2.json.
- **Thực tế:** Excel có dữ liệu hợp lệ ở sheet 2 báo Trang tính Excel không chứa dòng dữ liệu nào. Header ở dòng 3/merge dẫn tới cột BÁO CÁO và __EMPTY, nút bị khóa.
- **Mong đợi:** Cho chọn sheet/header hoặc chỉ rõ cách chuyển sheet/dọn dòng trang trí trong thông báo.
- **Bằng chứng:** [screenshots/matrix-excel-data-second-1-input.png](screenshots/matrix-excel-data-second-1-input.png); [screenshots/matrix-excel-header-row3-1-input.png](screenshots/matrix-excel-header-row3-1-input.png); [data/excel-data-second.xlsx](data/excel-data-second.xlsx); [data/excel-header-row3.xlsx](data/excel-header-row3.xlsx); [evidence/matrix-results.json](evidence/matrix-results.json).
- **Nguyên nhân trong code:** src/core/parser.ts:49 chỉ sheet0; src/core/parser.ts:55 không chọn header/range. Chắc chắn. File được từ chối/khóa mapping, không bị báo thành công rồi mất sheet2 âm thầm.
- **Phạm vi ảnh hưởng:** File Excel xuất từ phần mềm có sheet giới thiệu hoặc tiêu đề trang trí.
- **Hướng sửa gợi ý:** Bổ sung sheet/header selector hoặc hướng dẫn giới hạn ngay khi nhập.

### UI-09 · Gợi ý · Giá vốn tổng dòng có thể bị hiểu là vốn đơn vị mà không cảnh báo

- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Mở app.
  2. Nhập data/total-cost-as-unit.csv (hoặc .xlsx theo manifest).
  3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-total-cost-as-unit-1.json và -2.json.
- **Thực tế:** Số lượng 2, doanh thu 100.000đ, người nhập tổng vốn 60.000đ → app nhân đôi thành 120.000đ, lãi -20.000đ; không cảnh báo. Với vốn đơn vị 70.000đ, lãi -40.000đ cũng không cảnh báo bất thường.
- **Mong đợi:** Công thức đơn vị hiện tính đúng; nên xác nhận loại giá vốn hoặc cảnh báo để người không rành kỹ thuật phát hiện nhập nhầm.
- **Bằng chứng:** [screenshots/matrix-total-cost-as-unit-1-result.png](screenshots/matrix-total-cost-as-unit-1-result.png); [data/total-cost-as-unit.csv](data/total-cost-as-unit.csv); [evidence/matrix-results.json](evidence/matrix-results.json).
- **Nguyên nhân trong code:** src/core/cleaner.ts:317; src/components/upload/ColumnMapper.tsx:13: phép tính đơn vị đúng và nhãn có ghi rõ. Chắc chắn về hành vi; đây là gợi ý giảm nhập nhầm, không phải lỗi công thức.
- **Phạm vi ảnh hưởng:** File dùng tổng vốn dòng, file lỗ hàng loạt.
- **Hướng sửa gợi ý:** Cho chọn vốn đơn vị/tổng dòng hoặc cảnh báo tỷ lệ dòng lỗ bất thường, không tự sửa số.

### UI-10 · Quan trọng · Có giá vốn và đang lỗ nhưng nhận xét lại yêu cầu nhập giá vốn

- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Mở app.
  2. Nhập data/negative-profit.csv (hoặc .xlsx theo manifest).
  3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-negative-profit-1.json và -2.json.
- **Thực tế:** Lợi nhuận -40.000đ, coverage 100%, biên -40%, nhưng productProfit nói Cần nhập cột Giá vốn; top lợi nhuận rỗng.
- **Mong đợi:** Phân biệt không có giá vốn với không có sản phẩm lãi dương; nói rõ sản phẩm đang lỗ.
- **Bằng chứng:** [screenshots/negative-profit-products-1.png](screenshots/negative-profit-products-1.png); [screenshots/negative-profit-products-2.png](screenshots/negative-profit-products-2.png); [evidence/matrix-negative-profit-1.json](evidence/matrix-negative-profit-1.json); [evidence/matrix-negative-profit-2.json](evidence/matrix-negative-profit-2.json).
- **Nguyên nhân trong code:** src/core/productMetrics.ts:255 chỉ giữ lãi dương; src/core/textConclusions.ts:93 coi danh sách rỗng như thiếu vốn. Chắc chắn.
- **Phạm vi ảnh hưởng:** Toàn sản phẩm lỗ hoặc hòa vốn.
- **Hướng sửa gợi ý:** Tách điều kiện thiếu vốn và danh sách không có lãi dương.

### UI-11 · Nhỏ · Nhãn dữ liệu mẫu lệch số bản ghi thực

- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Mở app.
  2. Nhập data/oracle-28.csv (hoặc .xlsx theo manifest).
  3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-oracle-28-1.json và -2.json.
- **Thực tế:** Trang đầu ghi mẫu 5.030 dòng; file mẫu tải và parse thực tế có 5.031 bản ghi.
- **Mong đợi:** Nhãn cùng số thực tế hoặc dùng mô tả xấp xỉ rõ ràng.
- **Bằng chứng:** [screenshots/ui-welcome-375-1.png](screenshots/ui-welcome-375-1.png); [evidence/sample-expected.json](evidence/sample-expected.json); [evidence/step1-sample.json](evidence/step1-sample.json).
- **Nguyên nhân trong code:** src/components/upload/FileUploadZone.tsx:17 hardcode; số bản ghi độc lập=5031. DECISIONS.md:25 cũng ghi số cũ. README hiện ghi5031 đúng, không dùng README làm oracle.
- **Phạm vi ảnh hưởng:** Trang đầu và mô tả mẫu.
- **Hướng sửa gợi ý:** Sinh metadata mẫu hoặc tránh hardcode số chính xác.

### UI-12 · Quan trọng · Dependency xlsx bị npm audit cảnh báo mức high

- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Chạy npm ci trên snapshot để đọc kết quả audit tự động.
  2. Chạy npm audit --json và đối chiếu phiên bản xlsx trong lockfile.
  3. Hai quan sát đều cảnh báo high; đã kiểm advisory, không chạy exploit.
- **Thực tế:** npm ci và npm audit trên snapshot đều ghi 1 dependency high; xlsx 0.18.5 bị hai advisory prototype pollution/ReDoS; fixAvailable=false. Không chạy khai thác nên không kết luận app đã bị xâm nhập.
- **Mong đợi:** Dùng bản phát hành đã vá và kiểm tra lại các file Excel trước khi đưa cho người dùng.
- **Bằng chứng:** [logs/audit-escalated.log](logs/audit-escalated.log); [logs/ci-escalated.log](logs/ci-escalated.log).
- **Nguyên nhân trong code:** package.json:26 khai báo xlsx 0.18.5; src/core/parser.ts:3 xử lý workbook người dùng. Audit xác nhận dependency high; chưa tái tạo khai thác nên không kết luận đã rò rỉ/xâm nhập.
- **Phạm vi ảnh hưởng:** Luồng nhập Excel.
- **Hướng sửa gợi ý:** Đánh giá bản chính thức có vá theo SheetJS và rerun regression; không giả định npm audit fix tự giải quyết.

### UI-13 · Quan trọng · Trục tiền biểu đồ lặp nhãn 0tr với dữ liệu dưới một triệu

- **Thấy ở đâu:** Biểu đồ tháng và Top sản phẩm
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Nhập oracle-28.csv.
  2. Xem Tổng quan/Sản phẩm.
  3. Lặp lại toàn pipeline lần hai; đã thực hiện.
- **Thực tế:** Các tick 0/100000/200000/300000/400000 cùng hiện 0tr; biểu đồ sản phẩm nhiều tick 0tr và tick 500000 hiện 1tr.
- **Mong đợi:** Phân biệt giá trị bằng nghìn đồng hoặc triệu có số thập phân phù hợp.
- **Bằng chứng:** [screenshots/oracle-28-overview.png](screenshots/oracle-28-overview.png); [screenshots/oracle-28-products.png](screenshots/oracle-28-products.png); [evidence/step1-oracle-28.json](evidence/step1-oracle-28.json).
- **Nguyên nhân trong code:** src/components/dashboard/OverviewTab.tsx:19; src/components/dashboard/ProductTab.tsx:26: làm tròn triệu nguyên làm nhiều tick thành0tr. Chắc chắn.
- **Phạm vi ảnh hưởng:** Cửa hàng nhỏ, kỳ ngắn, biểu đồ có giá trị dưới 1 triệu hoặc bước tick nhỏ.
- **Hướng sửa gợi ý:** Chọn đơn vị theo miền dữ liệu và giữ độ chính xác đủ phân biệt tick.

### UI-14 · Nghiêm trọng · Mã hóa đơn tái dùng qua ngày/khách bị gộp và không cảnh báo

- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Mở app.
  2. Nhập data/order-reused-days.csv (hoặc .xlsx theo manifest).
  3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-order-reused-days-1.json và -2.json.
- **Thực tế:** Hai hóa đơn HD1 ở 01/09 và 30/09 của hai khách bị gộp: doanh thu 120.000đ, tổng đơn 1, AOV 120.000đ; đáp án theo hai giao dịch là 2 đơn/AOV 60.000đ. Dữ liệu vẫn được đánh dấu mã đơn tin cậy.
- **Mong đợi:** Phát hiện mã đơn không nhất quán và yêu cầu xác minh, tránh báo số đơn tin cậy.
- **Bằng chứng:** [data/order-reused-days.csv](data/order-reused-days.csv); [screenshots/matrix-order-reused-days-1-result.png](screenshots/matrix-order-reused-days-1-result.png); [evidence/matrix-order-reused-days-1.json](evidence/matrix-order-reused-days-1.json); [evidence/matrix-order-reused-days-2.json](evidence/matrix-order-reused-days-2.json).
- **Nguyên nhân trong code:** src/core/overviewMetrics.ts:45 gom theo mã toàn file; src/core/overviewMetrics.ts:27 chỉ xét rỗng/AUTO; src/core/productMetrics.ts:67 cũng gộp giỏ. Chắc chắn. Tái dùng mã không bảo đảm là một hóa đơn, cần kiểm tính nhất quán thay vì coi chắc chắn tin cậy.
- **Phạm vi ảnh hưởng:** Số đơn/AOV, cặp mua cùng giả, tần suất/nhóm khách.
- **Hướng sửa gợi ý:** Kiểm tính nhất quán ngày/khách cho mỗi mã đơn trước khi quyết định khóa nhóm.

### UI-15 · Quan trọng · Toàn bộ dòng sai thì mất báo cáo lý do và số thứ tự

- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Mở app.
  2. Nhập data/date-invalid.csv (hoặc .xlsx theo manifest).
  3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-date-invalid-1.json và -2.json.
- **Thực tế:** CSV chứa 31/02/2026 chỉ báo Không có dòng hợp lệ. Hãy kiểm tra ghép cột và định dạng dữ liệu; không cho xem lý do/ngày/#1. Cùng hành vi khi số sai hoặc serial CSV.
- **Mong đợi:** Trả báo cáo làm sạch ngay cả khi validRows=0 để người dùng biết ô nào cần sửa.
- **Bằng chứng:** [screenshots/zero-valid-error-1.png](screenshots/zero-valid-error-1.png); [screenshots/zero-valid-error-2.png](screenshots/zero-valid-error-2.png); [evidence/last-checks.json](evidence/last-checks.json); [evidence/matrix-results.json](evidence/matrix-results.json).
- **Nguyên nhân trong code:** src/core/analyzer.ts:76 ném lỗi trước khi trả report; src/App.tsx:98 modal chỉ trong dashboard. Chắc chắn.
- **Phạm vi ảnh hưởng:** File toàn lỗi hoặc ghép sai cột.
- **Hướng sửa gợi ý:** Giữ report trong lỗi có cấu trúc và hiển thị ở màn hình mapping.

### UI-16 · Quan trọng · Tab khách tràn màn hình mobile và kéo lệch cả trang

- **Thấy ở đâu:** Dashboard 375px → mở Khách hàng
- **Môi trường:** Edge 155, 375×1000; oracle-28.csv; hai lần, cả sáng/tối
- **Cách tái tạo:**
  1. Nhập oracle ở 375px.
  2. Bấm Khách hàng.
  3. Quan sát và đo scrollX; đã thực hiện hai lượt.
- **Thực tế:** scrollWidth=501–502px với viewport375; click tab gây scrollX126, headingLeft=-110px. Logo, heading và KPI bên trái bị cắt.
- **Mong đợi:** Tab vừa viewport hoặc cuộn trong tablist riêng; không kéo lệch toàn dashboard.
- **Bằng chứng:** [screenshots/mobile-tabs-viewport-1.png](screenshots/mobile-tabs-viewport-1.png); [screenshots/mobile-customers-shift-1.png](screenshots/mobile-customers-shift-1.png); [screenshots/mobile-customers-shift-2.png](screenshots/mobile-customers-shift-2.png); [evidence/extra-results.json](evidence/extra-results.json); [logs/playwright-network.log](logs/playwright-network.log).
- **Nguyên nhân trong code:** src/index.css:624 và src/index.css:638 cùng padding20 và min-width nội dung; không có breakpoint tablist. Chắc chắn. Bảng cuộn trong table-container không phải nguyên nhân chính.
- **Phạm vi ảnh hưởng:** Dashboard mobile, số đếm tab làm tăng bề rộng; bảng có cuộn riêng là đúng và không phải nguyên nhân chính.
- **Hướng sửa gợi ý:** Giảm padding/min-width, dùng layout mobile và cuộn tablist thay vì cuộn document.

### UI-17 · Nghiêm trọng · Nhận xét VIP báo 100% doanh thu dù chỉ chiếm 10% doanh thu cửa hàng

- **Thấy ở đâu:** Tab Khách hàng → nhận xét RFM
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Nhập customer-partial.csv: khách KH1 chi 100.000đ, dòng không mã khách 900.000đ.
  2. So Tổng quan với nhận xét khách.
  3. Đã làm hai lần.
- **Thực tế:** Tổng quan 1 triệu; nhận xét 1 khách VIP đóng góp 100% doanh thu (100.000đ). Tỷ lệ toàn cửa hàng thực tế 10%.
- **Mong đợi:** Dùng doanh thu toàn cửa hàng hoặc ghi rõ 100% doanh thu đã nhận diện khách, kèm coverage 10%.
- **Bằng chứng:** [data/customer-partial.csv](data/customer-partial.csv); [screenshots/customer-partial-overview-1.png](screenshots/customer-partial-overview-1.png); [screenshots/customer-partial-customers-1.png](screenshots/customer-partial-customers-1.png); [screenshots/customer-partial-customers-2.png](screenshots/customer-partial-customers-2.png); [evidence/extra-results.json](evidence/extra-results.json).
- **Nguyên nhân trong code:** src/core/customerMetrics.ts:172 mẫu số chỉ khách có ID; src/core/customerMetrics.ts:184; src/core/textConclusions.ts:113 gọi là doanh thu không nêu tập con. Chắc chắn về sai ngữ cảnh mẫu số.
- **Phạm vi ảnh hưởng:** File chỉ có mã khách ở một phần giao dịch.
- **Hướng sửa gợi ý:** Thống nhất mẫu số với tổng quan hoặc ghi rõ tập con và độ phủ mã khách.

### UI-18 · Quan trọng · Nhận xét khẳng định khách quay lại tích cực dù tất cả mới mua một lần

- **Thấy ở đâu:** Nhận xét RFM trong tab Khách hàng
- **Môi trường:** Edge155,1366×1000, localhost:5181 trên snapshot; file cụ thể trong bằng chứng.
- **Cách tái tạo:**
  1. Nhập same-day-customers.csv, sáu khách mỗi người chỉ có một hóa đơn.
  2. Mở khách.
  3. Đã làm hai lần.
- **Thực tế:** Tất cả F=1, vẫn ghi Cửa hàng đang duy trì tỷ lệ khách quay lại mua sắm rất tích cực.
- **Mong đợi:** Chỉ kết luận quay lại khi có dữ liệu tần suất hoặc nói chưa có khách thuộc nhóm nguy cơ.
- **Bằng chứng:** [data/same-day-customers.csv](data/same-day-customers.csv); [screenshots/retention-unsupported-1.png](screenshots/retention-unsupported-1.png); [screenshots/retention-unsupported-2.png](screenshots/retention-unsupported-2.png); [evidence/last-checks.json](evidence/last-checks.json).
- **Nguyên nhân trong code:** src/core/textConclusions.ts:118 lấy không có nguy cơ làm bằng chứng quay lại; không tính tỷ lệ mua lặp. Chắc chắn.
- **Phạm vi ảnh hưởng:** Khách chỉ mua một lần, file ngắn, nhóm khách mới.
- **Hướng sửa gợi ý:** Tính repeat customer rate hoặc dùng nhận xét trung tính đúng dữ liệu.

## Bước 1 — Bảng đối chiếu số liệu

| Chỉ số | App hiển thị / xuất | Đáp án độc lập | Khớp? |
| --- | --- | --- | --- |
| Oracle doanh thu | 1 triệu đ; CSV=1.000.000 | 1.000.000đ | Có |
| Dòng hợp lệ | 28 trong file summary/report | 28 | Có |
| Số hóa đơn | 18 | 18 | Có |
| AOV | 55.556đ | round(1.000.000/18)=55.556đ | Có |
| Lợi nhuận | 400.000đ | 400.000đ | Có |
| Biên lãi | 40% | 40% | Có |
| Độ phủ vốn | 100% | 100% | Có |
| Mẫu doanh thu | 734,8 triệu đ; tổng CSV sản phẩm734.802.500 | 734.802.500đ | Có, số rút gọn trên KPI |
| Mẫu hợp lệ / bị loại | 4.939 /92 | 4.939 /92 từ5.031 bản ghi | Có |
| Mẫu hóa đơn/AOV | 2.627 /279.712đ | 2.627 /279.712đ | Có |
| Mẫu lợi nhuận/biên | 188,7triệu đ /25,7% | 188.707.800đ /25,7% | Có, KPI rút gọn |

### Sản phẩm trong bộ28 dòng

| Sản phẩm | Doanh thu app / oracle | Số lượng app / oracle | Lãi app / oracle | ABC app / oracle | Xu hướng, khuyến nghị |
| --- | --- | --- | --- | --- | --- |
| Cà phê | 500000 / 500000 | 15 / 15 | 200000 / 200000 | A / A | Tăng trưởng; Đáng đầu tư |
| Sữa đặc | 300000 / 300000 | 12 / 12 | 120000 / 120000 | A / A | Giảm sút; Đáng đầu tư |
| Trà | 150000 / 150000 | 10 / 10 | 60000 / 60000 | B / B | Tăng trưởng; Đáng đầu tư |
| Bánh | 30000 / 30000 | 8 / 8 | 12000 / 12000 | C / C | Giảm sút; Cân nhắc loại bỏ |
| Nến | 15000 / 15000 | 6 / 6 | 6000 / 6000 | C / C | Ổn định; Duy trì ổn định |
| Kẹo | 5000 / 5000 | 4 / 4 | 2000 / 2000 | C / C | Giảm sút; Cân nhắc loại bỏ |

### Sáu khách được so trực tiếp trong bảng/CSV

| Khách | R app/oracle | F app/oracle | M app/oracle | Phân khúc app/oracle | Điểm R/F/M (Worker, không phải cột UI) |
| --- | --- | --- | --- | --- | --- |
| KH-vip | 0 / 0 | 4 / 4 | 350000 / 350000 | VIP / VIP | 5/3/5 = 5/3/5 |
| KH-risk | 112 / 112 | 4 / 4 | 300000 / 300000 | Có nguy cơ rời đi / Có nguy cơ rời đi | 2/3/5 = 2/3/5 |
| KH-normal | 59 / 59 | 3 / 3 | 165000 / 165000 | Bình thường / Bình thường | 4/3/4 = 4/3/4 |
| KH-loyal | 0 / 0 | 5 / 5 | 162500 / 162500 | Trung thành / Trung thành | 5/4/4 = 5/4/4 |
| KH-churn | 152 / 152 | 1 / 1 | 15000 / 15000 | Đã ngừng mua / Đã ngừng mua | 2/1/2 = 2/1/2 |
| KH-new | 0 / 0 | 1 / 1 | 7500 / 7500 | Mới / Mới | 5/1/2 = 5/1/2 |

### Cặp mua cùng

| Cặp | Số đơn app/oracle | Tỷ lệ app/oracle | Nguồn |
| --- | --- | --- | --- |
| Cà phê + Sữa đặc | 3 / 3 | 42.9 / 42.9% | Bốn cặp đầu có thẻ UI; cặp còn lại kiểm từ message Worker |
| Bánh + Kẹo | 2 / 2 | 28.6 / 28.6% | Bốn cặp đầu có thẻ UI; cặp còn lại kiểm từ message Worker |
| Bánh + Nến | 2 / 2 | 28.6 / 28.6% | Bốn cặp đầu có thẻ UI; cặp còn lại kiểm từ message Worker |
| Kẹo + Nến | 2 / 2 | 28.6 / 28.6% | Bốn cặp đầu có thẻ UI; cặp còn lại kiểm từ message Worker |
| Bánh + Sữa đặc | 1 / 1 | 14.3 / 14.3% | Bốn cặp đầu có thẻ UI; cặp còn lại kiểm từ message Worker |
| Kẹo + Sữa đặc | 1 / 1 | 14.3 / 14.3% | Bốn cặp đầu có thẻ UI; cặp còn lại kiểm từ message Worker |
| Nến + Sữa đặc | 1 / 1 | 14.3 / 14.3% | Bốn cặp đầu có thẻ UI; cặp còn lại kiểm từ message Worker |
| Bánh + Trà | 1 / 1 | 14.3 / 14.3% | Bốn cặp đầu có thẻ UI; cặp còn lại kiểm từ message Worker |
| Nến + Trà | 1 / 1 | 14.3 / 14.3% | Bốn cặp đầu có thẻ UI; cặp còn lại kiểm từ message Worker |

Có7 hóa đơn nhiều mặt hàng; cặp cà phê+sữa đặc3/7=42,9%; ba cặp bánh/kẹo/nến2/7=28,6%. Tooltip tháng08: doanh thu252.500đ, lãi101.000đ; tooltip Trà150.000đ; tooltip nhóm nguy cơ1 khách — đều khớp. Trục0tr là lỗi trình bày riêng UI-13.

### Báo cáo làm sạch đối chiếu độc lập

| Lý do | Mẫu app / oracle | 9 dòng kiểm lý do app / đáp án | Số thứ tự9 dòng |
| --- | --- | --- | --- |
| Trùng | 42 / 42 | 1 /1 | #2 |
| Ngày | 15 / 15 | 3 /3 | #3,#8,#9 |
| Thiếu sản phẩm | 10 / 10 | 1 /1 | #4 |
| Số lượng | 25 / 25 | 2 /2 | #5,#6 |
| Doanh thu | 0 /0 | 1 /1 | #7 |

Một bản ghi nhiều lỗi (#9) chỉ tính lỗi ngày đầu tiên. Số thứ tự trong báo cáo đúng theo bản ghi CSV, không gồm tiêu đề. File toàn lỗi không trả report là UI-15. Nhóm oracle nhỏ52 phép so sánh, mẫu1.360, boundaryRFM31, boundaryABC22 đều khớp; phần lớn so sánh mẫu dùng CSV xuất/Worker, không tuyên bố đã đọc từng hàng300 khách bằng mắt. [evidence/validation-results.json](evidence/validation-results.json) xác nhận 96 kiểm tra hậu xử lý qua.

## Bước 2 — Ma trận file đã thử

Tất cả55 mục dưới được thử hai lượt và trạng thái/số tiền/report giống nhau. “Đạt” chỉ nói hành vi tương ứng với dữ liệu kiểm, không miễn các lỗi UI dùng chung. Ảnh đại diện từng mục có trong screenshots/matrix-contact-01…10.png và ảnh gốc matrix-*; trường hợp lỗi sau phân tích xem thêm ảnh zero-valid-error vì ảnh input trong matrix được chụp trước khi bấm phân tích.

| File | Lượt1 / lượt2 | Dòng hợp lệ / loại | Doanh thu | Kết luận / quan sát |
| --- | --- | --- | --- | --- |
| [data/oracle-28.csv](data/oracle-28.csv) | dashboard / dashboard | 28 / 0 | 1000000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/csv-comma.csv](data/csv-comma.csv) | dashboard / dashboard | 1 / 0 | 100000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/csv-semicolon.csv](data/csv-semicolon.csv) | dashboard / dashboard | 1 / 0 | 100000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/csv-tab.csv](data/csv-tab.csv) | dashboard / dashboard | 1 / 0 | 100000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/csv-bom.csv](data/csv-bom.csv) | dashboard / dashboard | 1 / 0 | 100000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/quoted-multiline.csv](data/quoted-multiline.csv) | dashboard / dashboard | 1 / 0 | 100000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/duplicate-header.csv](data/duplicate-header.csv) | dashboard / dashboard | 1 / 0 | 100000 | Chấp nhận, PapaParse đổi tên cột trùng; có warning console. Hai ô trùng có cùng giá trị, chưa chứng minh chính sách chọn cột khi giá trị khác nhau. |
| [data/empty.csv](data/empty.csv) | error / error | — | — | Thông báo file CSV không dữ liệu; không crash. |
| [data/header-only.csv](data/header-only.csv) | error / error | — | — | Thông báo file CSV không dữ liệu; không crash. |
| [data/fake-jpeg.csv](data/fake-jpeg.csv) | error / error | — | — | Nội dung nhị phân đổi đuôi.csv bị báo không dữ liệu, không crash. |
| [data/missing-required.csv](data/missing-required.csv) | mapping-blocked / mapping-blocked | — | — | Khóa nút và yêu cầu đủ cột, đúng. |
| [data/unusual-headers.csv](data/unusual-headers.csv) | dashboard / dashboard | 1 / 0 | 100000 | Đủ mapping để phân tích nhờ Mã hàng/Thành tiền/SL; Khách không tự nhận diện. Cần người dùng chọn. |
| [data/date-iso.csv](data/date-iso.csv) | dashboard / dashboard | 1 / 0 | 100000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/date-dmy.csv](data/date-dmy.csv) | dashboard / dashboard | 1 / 0 | 100000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/date-us.csv](data/date-us.csv) | dashboard / dashboard | 1 / 0 | 100000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/date-serial-csv.csv](data/date-serial-csv.csv) | error / error | — | — | CSV serial thành chuỗi, bị loại; Excel serial dạng number được nhận. |
| [data/date-invalid.csv](data/date-invalid.csv) | error / error | — | — | Ngày không tồn tại bị loại; toàn lỗi chỉ báo chung UI-15. |
| [data/date-ambiguous.csv](data/date-ambiguous.csv) | dashboard / dashboard | 1 / 0 | 100000 | 03/04/2025 thành2025-04-03 (DD/MM). Chưa có căn cứ kết luận sai nếu người dùng định dạng Việt. |
| [data/date-1999.csv](data/date-1999.csv) | dashboard / dashboard | 1 / 0 | 100000 | ISO1999 được nhận; giới hạn2000–2100 chỉ ở fallback. |
| [data/date-2101.csv](data/date-2101.csv) | dashboard / dashboard | 1 / 0 | 100000 | ISO2101 được nhận; không có cảnh báo. Chính sách năm chưa thống nhất, không tự coi là lỗi khi chưa chốt giới hạn. |
| [data/number-million-vn.csv](data/number-million-vn.csv) | dashboard / dashboard | 1 / 0 | 1234567 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/number-million-us.csv](data/number-million-us.csv) | dashboard / dashboard | 1 / 0 | 1234568 | 1234567,50 làm tròn doanh thu1234568 trên kết quả. |
| [data/number-currency.csv](data/number-currency.csv) | dashboard / dashboard | 1 / 0 | 125000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/number-k.csv](data/number-k.csv) | dashboard / dashboard | 1 / 0 | 50000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/number-tr.csv](data/number-tr.csv) | dashboard / dashboard | 1 / 0 | 2500000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/number-ambiguous.csv](data/number-ambiguous.csv) | dashboard / dashboard | 1 / 0 | 1234 | 1.234 thành1234; thuận định dạng nghìn Việt, không chọn locale. |
| [data/number-junk.csv](data/number-junk.csv) | error / error | — | — | Chuỗi sai bị loại; thông báo toàn lỗi không có chi tiết. |
| [data/number-empty.csv](data/number-empty.csv) | error / error | — | — | Trống bị loại khi không có đơn giá dự phòng. |
| [data/number-negative.csv](data/number-negative.csv) | error / error | — | — | Âm bị loại theo luật. |
| [data/duplicate-real-order.csv](data/duplicate-real-order.csv) | dashboard / dashboard | 1 / 1 | 100000 | Có mất dòng bán thật theo ý nghĩa dữ liệu thử; chính sách chữ ký làm đúng, UI-06. |
| [data/duplicate-no-order.csv](data/duplicate-no-order.csv) | dashboard / dashboard | 2 / 0 | 200000 | Bản sao không bị phát hiện, UI-06. |
| [data/bad-revenue-valid-price.csv](data/bad-revenue-valid-price.csv) | dashboard / dashboard | 1 / 1 | 20000 | Không fallback; report không giải thích số sai, UI-07. |
| [data/negative-profit.csv](data/negative-profit.csv) | dashboard / dashboard | 1 / 0 | 100000 | Lãi âm đúng công thức; nhận xét sản phẩm báo thiếu vốn sai, UI-10. |
| [data/total-cost-as-unit.csv](data/total-cost-as-unit.csv) | dashboard / dashboard | 1 / 0 | 100000 | Công thức đơn vị đúng; không phát hiện người dùng nhập tổng, UI-09. |
| [data/single-product.csv](data/single-product.csv) | dashboard / dashboard | 2 / 0 | 200000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/single-customer.csv](data/single-customer.csv) | dashboard / dashboard | 2 / 0 | 150000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/same-day-customers.csv](data/same-day-customers.csv) | dashboard / dashboard | 6 / 0 | 75000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/single-month.csv](data/single-month.csv) | dashboard / dashboard | 2 / 0 | 130000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/order-partial.csv](data/order-partial.csv) | dashboard / dashboard | 2 / 0 | 120000 | Ẩn số đơn/AOV/RFM nhưng VIP tổng quan vẫn có, UI-05. |
| [data/order-none.csv](data/order-none.csv) | dashboard / dashboard | 2 / 0 | 120000 | Ẩn số đơn/AOV/RFM nhưng VIP tổng quan vẫn có, UI-05. |
| [data/order-reused-days.csv](data/order-reused-days.csv) | dashboard / dashboard | 2 / 0 | 120000 | Gộp hai ngày/khách, số đơn1 và AOV120k; UI-14. |
| [data/cost-partial.csv](data/cost-partial.csv) | dashboard / dashboard | 2 / 0 | 200000 | Lãi40k/biên40%, coverage50%, đúng phần dữ liệu có vốn. |
| [data/cleaning-reasons.csv](data/cleaning-reasons.csv) | dashboard / dashboard | 1 / 8 | 100000 | 9 vào,1 giữ,8 loại; counts/index đúng. |
| [data/special-names.csv](data/special-names.csv) | dashboard / dashboard | 7 / 0 | 70021 | Không chạy script; CSV =,+,-,@ được prefix nháy đơn; dấu nháy/tiếng Việt giữ được. |
| [data/whitespace-order.csv](data/whitespace-order.csv) | dashboard / dashboard | 1 / 0 | 100000 | Mã trim rỗng khiến reliable=false, KPI bị ẩn; bác bỏ nghi vấn vượt kiểm tra. |
| [data/boundary-rfm.csv](data/boundary-rfm.csv) | dashboard / dashboard | 7 / 0 | 741000 | R60 còn VIP, R61 nguy cơ, F4 trung thành; khớp oracle. |
| [data/boundary-abc.csv](data/boundary-abc.csv) | dashboard / dashboard | 3 / 0 | 100000 | Đúng80%/95% cho A/B/C; khớp oracle. |
| [data/scale-50000.csv](data/scale-50000.csv) | dashboard / dashboard | 50000 / 0 | 5000000 | Giữ50k, doanh thu5triệu/10k đơn; đo hiệu năng riêng bên dưới. |
| [data/scale-200000.csv](data/scale-200000.csv) | dashboard / dashboard | 200000 / 0 | 20000000 | Giữ200k, doanh thu20triệu/40k đơn; đo hiệu năng riêng bên dưới. |
| [data/excel-first-normal.xlsx](data/excel-first-normal.xlsx) | dashboard / dashboard | 1 / 0 | 100000 | Dữ liệu được nhận, kết quả đúng dữ liệu thử; không crash. |
| [data/excel-data-second.xlsx](data/excel-data-second.xlsx) | error / error | — | — | Sheet2 có dữ liệu nhưng chỉ đọc sheet1; lỗi có thể khôi phục, UI-08. |
| [data/excel-header-row3.xlsx](data/excel-header-row3.xlsx) | mapping-blocked / mapping-blocked | — | — | Header BÁO CÁO/__EMPTY; khóa mapping, UI-08. |
| [data/excel-merged.xlsx](data/excel-merged.xlsx) | mapping-blocked / mapping-blocked | — | — | Merge tiêu đề trang trí gặp cùng giới hạn header, UI-08. |
| [data/excel-blanks.xlsx](data/excel-blanks.xlsx) | dashboard / dashboard | 2 / 0 | 120000 | Giữ ô thiếu vốn/danh mục, coverage83%, lãi40k, không mất dòng. |
| [data/excel-date-serial.xlsx](data/excel-date-serial.xlsx) | dashboard / dashboard | 1 / 0 | 100000 | Serial được nhận là ngày2026-09-30. |

Thử bổ sung ngoài manifest: [data/legacy.xls](data/legacy.xls) đọc thành công hai lần; [data/customer-partial.csv](data/customer-partial.csv) tái tạo UI-17; [data/network-marker.csv](data/network-marker.csv) dùng marker riêng để kiểm request mạng. Kéo hai file cùng lúc chỉ nhận file đầu, đã ghi rõ thực tế chứ không coi là hỗ trợ đa file.

## Bước 3 — Màn hình và luồng đã kiểm tra

| Mục | Kích thước/lượt | Kết quả và bằng chứng |
| --- | --- | --- |
| Trang đầu, dùng mẫu, link CSV/XLSX | 375/768/1366,2 lượt | Nhập/tải được; nhãn mẫu lệch UI-11, header che UI-01. Ảnh ui-welcome-*. |
| Mapping/xem trước/đổi cột | Cả3,2 lượt | Gợi ý9 cột oracle đúng; cột trùng khóa nút; chữ làm số lượng báo lỗi (không crash); sửa lại phân tích được. ui-actions.json mapping-*. |
| Tổng quan/sản phẩm/khách | Cả3,2 lượt, sáng/tối | Số liệu oracle khớp; trục0tr/missing class/mobile bị lỗi UI-04/13/16. Ảnh ui-overview/products/customers-*. |
| Tooltip3 biểu đồ | 1366,2 lượt | Giá trị đúng, trình bày dính chữ/no background UI-04; ảnh tooltip-*. |
| Tìm/lọc/sort2 chiều | 1366, sample | 8 cột×2 chiều được đối chiếu CSV và20 hàng UI; đều đúng. Lọc sản phẩm ra1, khách VIP KH0 ra64. ui-actions/validation-results. |
| Phân trang/export toàn bộ | 1366, sample | Trang1/2 mỗi20; xuất50 sản phẩm/300 khách khi đang trang2; lọc xuất1/64. Có BOM, tiếng Việt và escape công thức đúng. |
| Chuyển tab/quay lại | 1366 | Bộ lọc/sort/page reset khi mount lại; ghi nhận hành vi, không lưu state xuyên tab. |
| File thứ hai/reset | 1366 | Dữ liệu28 dòng được xóa, file1 dòng chỉ có100k/1đơn; không lẫn dữ liệu. |
| Theme5màu/sáng/tối/system | Cả3,2 lượt | Màu/palette đổi, reload giữ dark/amber/compact/font20, hai tab đồng bộ. System dark/light đã chờ effect và xác nhận qua extra-results; số light đọc sớm trong ui-actions là race của phép đo, không là bug. |
| Mật độ/font16/18/20 | Cả3,2 lượt | Không đạt UI-04: thuộc tính lưu nhưng density không đổi, font nhiều thành phần cố định. |
| Reduced motion | 1366,2 lượt + test50k | Không confetti, số hiển thị ngay, duration cực ngắn. Assertion gốc sai hợp đồng CSS UI-03; delay chưa reset. |
| Bàn phím/Escape/focus | Cả3,2 lượt | Mũi tên/Home/End/Escape và focus trả nút mở đạt. Tab trong modal có bước activeElement=body khi vòng, không focus nút nền; chưa dùng screen reader. |
| Hủy parse | 200k,2 lượt | Về upload, không alert; Worker terminate. verify-results parse. |
| Hủy phân tích bằng click chuột thật | 200k,2 lượt | Về mapping, loader0/alert0 sau1giây; cancel-real.json. Không dùng kết quả thao tác cancel bên trong listener QA để kết luận sản phẩm. |
| Hủy tải mẫu mạng chậm mô phỏng | 1366,2 lượt | Về upload, request abort, không alert; verify-results sample-slow-route. |
| Network/console | Các màn hình + lượtfont thật | Không pageerror ứng dụng trong các luồng bình thường; lỗi fonts denied là môi trường của lượt sandbox. Lượt quyền mạng font200, không payload dữ liệu thử. network-live.json. |
| Dark contrast | Cả3, xem ảnh5màu | Đã xem trực tiếp: chữ chính đọc được, chữ phụ nhỏ/muted; chưa chứng nhận WCAG định lượng cho mọi màu. |

### Hiệu năng đo thực tế

| CSV | Lượt | Parse (ms) | Analyze (ms) | Gap heartbeat lớn nhất (ms) | Heap trước/sau parse/sau analyze (MiB) |
| --- | --- | --- | --- | --- | --- |
| 50000 | 1 | 341 | 686 | 82.6 | 12.9 / 25.5 / 36.1 |
| 50000 | 2 | 312 | 684 | 79.4 | 12.9 / 25.8 / 34.0 |
| 200000 | 1 | 934 | 1259 | 211.5 | 12.9 / 59.1 / 81.9 |
| 200000 | 2 | 947 | 1226 | 204.8 | 12.9 / 59.1 / 81.9 |

Heap là JS heap **renderer chính**, không phải toàn bộ RAM Edge hay heap Worker. Dataset có 25 sản phẩm,300 khách, 5 mặt hàng/đơn. Hai lượt tương tự, chưa thấy tăng bộ nhớ bất thường trong quy mô này; không suy thành không rò rỉ dài hạn. Timing gồm truyền dữ liệu/đợi kết quả trên browser, không gồm chụp report. Loader còn các mốc coarse, nhưng plateau trong công đoạn parse dưới khoảng1giây và gap chính lớn nhất212ms; chưa tái tạo H10 trên file đã thử.

### Network và quyền riêng tư

Lượt sandbox thấy request font nhưng bị ERR_NETWORK_ACCESS_DENIED. Đã chạy lại quyền mạng: Google Fonts CSS và3 WOFF2 trả200, font tải được; không có POST và không request URL/body chứa marker QA_PRIVATE_7f38. Không thấy file/giao dịch được gửi khỏi trình duyệt trong các luồng đã kiểm. Điều này không phải chứng nhận không có mọi hình thức rò rỉ trong mọi môi trường. [evidence/network-live.json](evidence/network-live.json).

## Bước 4 — Kết quả H1–H11

| Giả thuyết | Kết luận | Bằng chứng và giới hạn |
| --- | --- | --- |
| H1 | Xác nhận | VIP tổng quan1 dù không mã đơn, tab khách chặn. UI-05, ảnh h1-vip/hidden-customers. |
| H2 | Xác nhận | Test50k trượt name none; thực tế duration 0,01ms. UI-03, test gốc chạy2lượt. |
| H3 | Xác nhận | block/inline-flex/whitespace-nowrap không có, small inline; density không đổi; font px giữ nguyên. UI-04. Không nói tất cả utilities vô hiệu: grid/flex/md-grid có CSS tự viết và vẫn hoạt động. |
| H4 | Xác nhận hành vi và rủi ro | Dòng thật giống nhau bị loại, bản sao thiếu mã được giữ. UI-06 tuân chữ ký hiện hành nhưng chính sách có rủi ro. |
| H5 | Chưa chắc là sai nghiệp vụ | Đã xác định1234 và03/04→03tháng4, không có chọn locale/cảnh báo. Đúng định dạng Việt; chưa biết ý định của file nên không báo parse sai chắc chắn. |
| H6 | Xác nhận | 123abc bị loại dù đơn giá hợp lệ; reason≤0 thiếu chính xác. UI-07. |
| H7 | Xác nhận | Sheet2 báo không dữ liệu; header3/merge khóa mapping, không hướng dẫn chọn vùng. UI-08. |
| H8 | Xác nhận thiếu cảnh báo; công thức đúng | Nhập tổng vốn60k như vốn đơn vị nhân2 thành120k; không cảnh báo. UI-09 gợi ý. Khi lỗ có thêm lỗi nhận xét UI-10. |
| H9 | Xác nhận audit/font; bác bỏ rò giao dịch trong phép thử | xlsx bị2advisory high; font gọiGoogle200. Không POST/marker ngoài. Chưa kiểm khai thác. |
| H10 | Bác bỏ với CSV/máy đã thử | 50k/200k2lượt vẫn đáp ứng, gap chính≤212ms; chưa tái tạo đứng lâu. Không kết luận cho mọi Excel/thiết bị. |
| H11 | Xác nhận UI/DECISIONS cũ, README hiện đúng | UI5030 vs file5031; DECISIONS có src/styles không tồn tại; README đã mô tả5031 đúng. Không dùng tài liệu làm oracle. |

## Bước 5 — Review code sau thực nghiệm

| Phần | Kết quả đối chiếu và nhận xét |
| --- | --- |
| ABC | Dùng tích lũy trước sản phẩm; đúng80/95 trong boundary, đơn sản phẩm A; không chia0 vì valid revenue>0. Core khác phân vị số lượng sản phẩm, đúng quy tắc hiện hành. |
| RFM | R theo cuối file, F distinct đơn, ngưỡng chi cao min(top20%,avg×1,2); R60/R61/F4 khớp oracle. Vấn đề reliability/tỷ trọng/nhận xét ở UI-05/17/18. |
| Xu hướng | So hai tháng có dữ liệu cuối, ngưỡng>10/<-10. Tháng trước0/có doanh thu→mới; một tháng→ổn định. Tháng trống lịch không được chèn. Không quy thành bug khi đó là phạm vi hiện tại. |
| Mua cùng | Set sản phẩm/đơn tránh đếm lặp một cặp; tỷ lệ mẫu số đơn nhiều mặt hàng; cặp một lần được phép. Gộp mã tái dùng tạo cặp giả UI-14. |
| Lợi nhuận | Tổng và sản phẩm cùng dùng phần có vốn; fixturepartial coverage50%/biên40% đúng. Top chỉprofit>0 khiến template sai khi toàn lỗ UI-10. |
| Template/ký tự đặc biệt | Số trong oracle tương ứng bảng/tooltip; script không chạy, export nháy đúng. Nhận xét quay lại/vốn/mẫu số có lỗi; câu0sản phẩm vẫn render được nhưng không phải dữ liệu có chứng cứ kinh doanh. |
| Worker/URL | Hook terminate ởcancel/finish/unmount; hai lượt instrument active0 và mỗi URL tạo đều revoke. Click chuột hủy thật không để loader treo. |
| Listener/animation | ThemeProvider có removeEventListener cho media/storage, AnimatedNumber disconnect observer/cancel RAF, Dialog clear timer/khôi phục overflow. Đã đọc cleanup; chưa chứng minh leak-free bằng profile 100 chu kỳ. |
| Phạm vi | Chỉ frontend, fetch nghiệp vụ duy nhất tải mẫu; chưa thấy auth/backend/database ngoài yêu cầu. |
| Chất lượng tests | Test overview có đáp án cụ thể300k/150k/110k/36,7%; product/customer có phân khúc cụ thể. Sample test chủ yếu ngưỡng>/>= nên không bắt thay đổi nhỏ tổng tiền; parser mẫu dùng split comma, không cover CSV quoted. Sync=async chỉ chứng minh hai nhánh cùng kết quả, không chứng minh độc lập đúng. |
| Khoảng trống tests quan trọng | Thiếu customer coverage, mã đơn tái dùng, đếm trùng không mã, all-invalid report, giá vốn0/toàn lỗ, ambiguitylocale, Excel sheet/header, density tác dụng và font trong bảng. Test UIassertion hiện không phản ánh đầy đủ hộp dialog/reduced motion. |

## Nghi vấn cần xác minh và phần chưa kiểm tra

- **Chưa kiểm tra khai thác xlsx** bằng workbook tấn công; chỉ xác minh audit/advisory. Không đưa exploit vào app.
- **Chưa kiểm tra Safari/Firefox hoặc thiết bị điện thoại thật**; kích thước viewport dùng Edge trên Windows.
- **Chưa kiểm tra WCAG định lượng đầy đủ/screen reader**; đã xem sáng/tối và thử bàn phím.
- **Chưa đo toàn bộ RAM tiến trình/heap Worker** hoặc leak 100 chu kỳ; CDP đo main renderer, có bằng chứng cleanup chức năng Worker/URL.
- **Chưa benchmark Excel 200k, hóa đơn cực nhiều sản phẩm hoặc phần cứng yếu**; H10 chỉ bị bác bỏ ở dataset đã mô tả.
- **Chưa thể kết luận dữ liệu mơ hồ1.234/03/04 là sai ý người dùng**; cần chốt locale/nghiệp vụ.
- **Chưa kiểm tình huống header trùng có giá trị mâu thuẫn**; case đã thử có cùng giá trị và PapaParse warning.
- **Chưa kiểm deployment subpath/offline** vì nhiệm vụ chạylocalhost và không có môi trường hosting.
- Lượt hủy gọi click **bên trong listener QA** gây progress35 ghi lại sau terminate; đây là can thiệp thứ tự dispatch của harness. Không báo đó là bug người dùng; đã thay bằng pointer thật và xác nhận sạch trong cancel-real.json.
- Các quan sát root-year1999/2101 không đồng nhất với fallback2000–2100 cần chốt chính sách năm; chưa coi là lỗi chắc chắn.

## Mẫu lỗi lặp lại

| Nhóm nguyên nhân | Các mục | Cách xử lý một nhóm |
| --- | --- | --- |
| CSS utilities/layout không đồng bộ | UI-01/02/04/13/16 | Hoàn thiện hệ styles/responsive, đo kích thước thực và giá trị scale; cập nhật test người dùng nhìn thấy. |
| Độ tin cậy/định danh dữ liệu | UI-05/06/14 | Chuẩn hóa ID, kiểm nhất quán, phân biệt dòng/bản sao, áp dụng reliability thống nhất. |
| Template không xét đầy đủ trạng thái | UI-07/10/15/17/18 | Truyền trạng thái/coverage/error có cấu trúc; hạn chế kết luận vượt số liệu. |
| Giới hạn input không được hướng dẫn | UI-08/09 | Nói rõ sheet/header/vốn đơn vị; thêm chọn vùng/định dạng nếu mở rộng. |
| Test và metadata | UI-03/11 | Thống nhất reduced-motion contract, không hardcode số mẫu. |
| Dependency bảo mật | UI-12 | Chọn bản đãvá theo kênh chính thức, audit và regression lại. |

## Cách chạy lại

Chạy từ thư mục dự án gốc. Tất cả lệnh dưới chỉ ghi vào review; không chạy generate-sample. Snapshot đã có sẵn nên **không chạy setup.cjs lại** để tránh thay baseline hash. Muốn review phiên bản mới nên tạo thư mục review mới và baseline mới.

```powershell
node review/run-command.cjs replay-ci npm.cmd ci
node review/run-command.cjs replay-build npm.cmd run build
node review/run-command.cjs replay-lint npm.cmd run lint
node review/run-command.cjs replay-unit npm.cmd run test
node review/run-command.cjs replay-ui npm.cmd run test:ui
node review/run-command.cjs replay-audit npm.cmd audit --json
```

Nếu network/process bị sandbox chặn, lệnh cần quyền tương ứng như lần review; không hiểu EACCES là lỗi ứng dụng. Bản Playwright gốc tự dùng5175. Để chạy scripts độc lập, mở một terminal riêng:

```powershell
node review/run-command.cjs dev npm.cmd run dev -- --host 127.0.0.1 --port 5181 --strictPort
```

Terminal khác:

```powershell
node review/fixtures.cjs
node review/oracle.cjs
node review/step1.cjs
node review/matrix.cjs
node review/ui.cjs
node review/verify.cjs
node review/cancel-real.cjs
node review/extra.cjs
node review/last-checks.cjs
node review/network-live.cjs
node review/validate-results.cjs
node review/gallery.cjs
node review/verify-integrity.cjs
```

verify.cjs chứa một phép đo hủy theo listener QA được giữ để minh bạch; dùng cancel-real.cjs cho kết luận hủy bằng chuột. Mỗi lần rerun có thể ghi đè ảnh/JSON cùng tên trong review; sao lưu nếu cần giữ các đợt độc lập. Các script record-matrix/record-ui chỉ thêm ghi chú phát hiện; finalize.cjs hợp nhất bản báo cáo từ evidence có sẵn, không sửa source. Dừng server bằng Ctrl+C khi xong.

### Cấu trúc bằng chứng

- `data/`: CSV/XLS/XLSX thử; `downloads/`: CSV từ giao diện và mẫu tải.
- `screenshots/`: ảnh gốc, viewport mobile và 10 contact sheet.
- `logs/`: npm/build/lint/Vitest/Playwright/audit.
- `evidence/`: oracle, dữ liệu quan sát trình duyệt, console/network, timing/heap, findings.ndjson, hash và xác thực.
- `project/test-results/`: trace/error-context của lượt test gốc cuối; `evidence/playwright-run1-results/` giữ lượt đầu.
- `UI-FINDINGS-LIVE.md`: nhật ký đã ghi trong quá trình; `UI-FINDINGS.md`: bản tổng hợp này.
