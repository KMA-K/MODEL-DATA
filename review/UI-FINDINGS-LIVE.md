# Báo cáo QA độc lập — Bán Hàng Smarter

Ngày kiểm tra: 14/10/2026. Trạng thái: đang thực hiện.

## Phạm vi và bảo toàn dự án

- Chỉ đọc mã nguồn gốc; mọi file tạo mới và kết quả chạy lưu trong `review/`.
- Lệnh cài đặt/build/test chạy trên bản sao trong `review/project` để không thay đổi dependencies, dist, artifacts hoặc test-results gốc.
- Kết luận chỉ dựa trên chạy thực tế, đối chiếu độc lập và ảnh được xem trực tiếp; không dùng README làm đáp án.
- Mỗi phát hiện sẽ ghi ngay sau khi tái tạo. Mục chưa thực hiện không được coi là đạt.

## Nhật ký thực hiện

- Đã đọc yêu cầu QA. Đang xác minh khả năng điều khiển Edge bằng Playwright.

## Phát hiện đã xác minh

Chưa có kết luận ở thời điểm khởi tạo báo cáo.

## Nghi vấn cần xác minh

H1–H11 đang chờ thực nghiệm.

## Bảng đối chiếu số liệu

Chưa kiểm tra.

## Kết quả H1–H11

Chưa kiểm tra.

## Ma trận file đầu vào

Chưa kiểm tra.

## Màn hình và luồng

Chưa kiểm tra.

## Chưa kiểm tra được

Các bước chưa thực hiện sẽ được cập nhật với lý do nếu không thể hoàn tất.

## Mẫu lỗi lặp lại và cách chạy lại

Đang chuẩn bị công cụ trong review.
- Bước 0: npm ci trên bản sao thành công sau cấp quyền mạng; build và lint đạt; Vitest 7 file/21 test đạt. Log trong review/logs. Playwright đang chạy. Đáp án độc lập: mẫu 5.031 dòng, giữ 4.939 dòng, doanh thu 734.802.500đ; file 28 dòng có doanh thu 1.000.000đ/18 đơn/AOV 55.556đ/lãi 400.000đ.

- Bước 1 oracle-28: 52/52 đối chiếu khớp; bằng chứng evidence/step1-oracle-28.json, downloads/oracle-28-*.csv và screenshots/oracle-28-*.png.
- Bước 1 sample: 1360/1360 đối chiếu khớp; bằng chứng evidence/step1-sample.json, downloads/sample-*.csv và screenshots/sample-*.png.
- Bước 1 boundary-rfm: 31/31 đối chiếu khớp; bằng chứng evidence/step1-boundary-rfm.json, downloads/boundary-rfm-*.csv và screenshots/boundary-rfm-*.png.
- Bước 1 boundary-abc: 22/22 đối chiếu khớp; bằng chứng evidence/step1-boundary-abc.json, downloads/boundary-abc-*.csv và screenshots/boundary-abc-*.png.
- Bước 1 oracle-28: 52/52 đối chiếu khớp; bằng chứng evidence/step1-oracle-28.json, downloads/oracle-28-*.csv và screenshots/oracle-28-*.png.
- Bước 1 sample: 1360/1360 đối chiếu khớp; bằng chứng evidence/step1-sample.json, downloads/sample-*.csv và screenshots/sample-*.png.
- Bước 1 boundary-rfm: 31/31 đối chiếu khớp; bằng chứng evidence/step1-boundary-rfm.json, downloads/boundary-rfm-*.csv và screenshots/boundary-rfm-*.png.
- Bước 1 boundary-abc: 22/22 đối chiếu khớp; bằng chứng evidence/step1-boundary-abc.json, downloads/boundary-abc-*.csv và screenshots/boundary-abc-*.png.
### UI-01 · Quan trọng · Banner riêng tư che khuất thanh điều hướng
- **Thấy ở đâu:** Đầu trang của cả ba dashboard
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Nhập oracle-28.csv. 2. Mở ba tab. 3. Lặp lại bằng file mẫu; đã thực hiện hai lượt.
- **Thực tế:** Banner đen phủ lên phần dưới logo và nút Phân tích file mới ngay đầu trang.
- **Mong đợi:** Logo và nút điều hướng hiển thị trọn vẹn, không bị banner khác che.
- **Bằng chứng:** screenshots/oracle-28-products.png; screenshots/oracle-28-customers.png; screenshots/sample-overview.png (đã xem trực tiếp).
- **Nguyên nhân trong code:** src/index.css:196,252 và src/App.tsx:88: hai phần sticky có top/z-index và thứ tự DOM không đồng bộ; khả năng cao, sẽ đo bounding box ở Bước 3.
- **Phạm vi ảnh hưởng:** Upload, mapping và mọi dashboard, cả desktop/mobile.
- **Hướng sửa gợi ý:** Bố trí banner/header theo cùng thứ tự và tính offset sticky theo chiều cao thực tế.

- Ma trận oracle-28: #1 dashboard / 1000000đ / 28 hợp lệ; #2 dashboard / 1000000đ / 28 hợp lệ. Chi tiết evidence/matrix-oracle-28-1.json và -2.json.
- Ma trận csv-comma: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-csv-comma-1.json và -2.json.
- Ma trận csv-semicolon: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-csv-semicolon-1.json và -2.json.
- Ma trận csv-tab: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-csv-tab-1.json và -2.json.
- Ma trận csv-bom: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-csv-bom-1.json và -2.json.
- Ma trận quoted-multiline: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-quoted-multiline-1.json và -2.json.
- Ma trận duplicate-header: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-duplicate-header-1.json và -2.json.
- Ma trận empty: #1 error; #2 error. Chi tiết evidence/matrix-empty-1.json và -2.json.
- Ma trận header-only: #1 error; #2 error. Chi tiết evidence/matrix-header-only-1.json và -2.json.
- Ma trận fake-jpeg: #1 error; #2 error. Chi tiết evidence/matrix-fake-jpeg-1.json và -2.json.
- Ma trận missing-required: #1 mapping-blocked; #2 mapping-blocked. Chi tiết evidence/matrix-missing-required-1.json và -2.json.
- Ma trận unusual-headers: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-unusual-headers-1.json và -2.json.
- Ma trận date-iso: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-date-iso-1.json và -2.json.
- Ma trận date-dmy: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-date-dmy-1.json và -2.json.
- Ma trận date-us: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-date-us-1.json và -2.json.
- Ma trận date-serial-csv: #1 error; #2 error. Chi tiết evidence/matrix-date-serial-csv-1.json và -2.json.
- Ma trận date-invalid: #1 error; #2 error. Chi tiết evidence/matrix-date-invalid-1.json và -2.json.
- Ma trận date-ambiguous: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-date-ambiguous-1.json và -2.json.
- Ma trận date-1999: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-date-1999-1.json và -2.json.
- Ma trận date-2101: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-date-2101-1.json và -2.json.
- Ma trận number-million-vn: #1 dashboard / 1234567đ / 1 hợp lệ; #2 dashboard / 1234567đ / 1 hợp lệ. Chi tiết evidence/matrix-number-million-vn-1.json và -2.json.
- Ma trận number-million-us: #1 dashboard / 1234568đ / 1 hợp lệ; #2 dashboard / 1234568đ / 1 hợp lệ. Chi tiết evidence/matrix-number-million-us-1.json và -2.json.
- Ma trận number-currency: #1 dashboard / 125000đ / 1 hợp lệ; #2 dashboard / 125000đ / 1 hợp lệ. Chi tiết evidence/matrix-number-currency-1.json và -2.json.
- Ma trận number-k: #1 dashboard / 50000đ / 1 hợp lệ; #2 dashboard / 50000đ / 1 hợp lệ. Chi tiết evidence/matrix-number-k-1.json và -2.json.
- Ma trận number-tr: #1 dashboard / 2500000đ / 1 hợp lệ; #2 dashboard / 2500000đ / 1 hợp lệ. Chi tiết evidence/matrix-number-tr-1.json và -2.json.
- Ma trận number-ambiguous: #1 dashboard / 1234đ / 1 hợp lệ; #2 dashboard / 1234đ / 1 hợp lệ. Chi tiết evidence/matrix-number-ambiguous-1.json và -2.json.
- Ma trận number-junk: #1 error; #2 error. Chi tiết evidence/matrix-number-junk-1.json và -2.json.
- Ma trận number-empty: #1 error; #2 error. Chi tiết evidence/matrix-number-empty-1.json và -2.json.
- Ma trận number-negative: #1 error; #2 error. Chi tiết evidence/matrix-number-negative-1.json và -2.json.
- Ma trận duplicate-real-order: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-duplicate-real-order-1.json và -2.json.
- Ma trận duplicate-no-order: #1 dashboard / 200000đ / 2 hợp lệ; #2 dashboard / 200000đ / 2 hợp lệ. Chi tiết evidence/matrix-duplicate-no-order-1.json và -2.json.
- Ma trận bad-revenue-valid-price: #1 dashboard / 20000đ / 1 hợp lệ; #2 dashboard / 20000đ / 1 hợp lệ. Chi tiết evidence/matrix-bad-revenue-valid-price-1.json và -2.json.
### UI-07 · Quan trọng · Loại dòng có doanh thu sai nhưng báo cáo không chỉ ra lỗi định dạng
- **Thấy ở đâu:** Báo cáo làm sạch
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Nhập bad-revenue-valid-price.csv có 123abc và đơn giá hợp lệ. 2. Phân tích. 3. Đọc report; làm hai lần.
- **Thực tế:** Dòng bị loại; lý do chỉ ghi Doanh thu hoặc đơn giá nhỏ hơn hoặc bằng 0, dù 123abc là lỗi định dạng và đơn giá dương.
- **Mong đợi:** Nêu không phải số và chỉ rõ trường lỗi; chính sách fallback cần được giải thích trước khi loại.
- **Bằng chứng:** screenshots/matrix-bad-revenue-valid-price-1-report.png; evidence/matrix-bad-revenue-valid-price-1.json và -2.json.
- **Nguyên nhân trong code:** src/core/cleaner.ts:79 đưa parse lỗi về 0; nhánh doanh thu không fallback và mô tả invalid_revenue bỏ trường hợp không phải số. Chắc chắn.
- **Phạm vi ảnh hưởng:** Chuỗi tiền sai, file có cả đơn giá/doanh thu.
- **Hướng sửa gợi ý:** Phân biệt parse lỗi với số 0 và mô tả đúng; cân nhắc fallback có xác nhận.

- Ma trận negative-profit: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-negative-profit-1.json và -2.json.
- Ma trận total-cost-as-unit: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-total-cost-as-unit-1.json và -2.json.
- Ma trận single-product: #1 dashboard / 200000đ / 2 hợp lệ; #2 dashboard / 200000đ / 2 hợp lệ. Chi tiết evidence/matrix-single-product-1.json và -2.json.
### UI-13 · Quan trọng · Trục tiền biểu đồ lặp nhãn 0tr với dữ liệu dưới một triệu
- **Thấy ở đâu:** Biểu đồ tháng và Top sản phẩm
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Nhập oracle-28.csv. 2. Xem Tổng quan/Sản phẩm. 3. Lặp lại toàn pipeline lần hai; đã thực hiện.
- **Thực tế:** Các tick 0/100000/200000/300000/400000 cùng hiện 0tr; biểu đồ sản phẩm nhiều tick 0tr và tick 500000 hiện 1tr.
- **Mong đợi:** Phân biệt giá trị bằng nghìn đồng hoặc triệu có số thập phân phù hợp.
- **Bằng chứng:** screenshots/oracle-28-overview.png; screenshots/oracle-28-products.png; evidence/step1-oracle-28.json có văn bản trục.
- **Nguyên nhân trong code:** src/components/dashboard/OverviewTab.tsx:18 và ProductTab.tsx:29: Math.round(value/1000000) làm mất độ phân giải. Chắc chắn; sẽ đối chiếu số dòng cuối.
- **Phạm vi ảnh hưởng:** Cửa hàng nhỏ, kỳ ngắn, biểu đồ có giá trị dưới 1 triệu hoặc bước tick nhỏ.
- **Hướng sửa gợi ý:** Chọn đơn vị theo miền dữ liệu và giữ độ chính xác đủ phân biệt tick.

- Ma trận single-customer: #1 dashboard / 150000đ / 2 hợp lệ; #2 dashboard / 150000đ / 2 hợp lệ. Chi tiết evidence/matrix-single-customer-1.json và -2.json.
- Ma trận same-day-customers: #1 dashboard / 75000đ / 6 hợp lệ; #2 dashboard / 75000đ / 6 hợp lệ. Chi tiết evidence/matrix-same-day-customers-1.json và -2.json.
- Ma trận single-month: #1 dashboard / 130000đ / 2 hợp lệ; #2 dashboard / 130000đ / 2 hợp lệ. Chi tiết evidence/matrix-single-month-1.json và -2.json.
- Ma trận order-partial: #1 dashboard / 120000đ / 2 hợp lệ; #2 dashboard / 120000đ / 2 hợp lệ. Chi tiết evidence/matrix-order-partial-1.json và -2.json.
- Ma trận order-none: #1 dashboard / 120000đ / 2 hợp lệ; #2 dashboard / 120000đ / 2 hợp lệ. Chi tiết evidence/matrix-order-none-1.json và -2.json.
- Ma trận order-reused-days: #1 dashboard / 120000đ / 2 hợp lệ; #2 dashboard / 120000đ / 2 hợp lệ. Chi tiết evidence/matrix-order-reused-days-1.json và -2.json.
- Ma trận cost-partial: #1 dashboard / 200000đ / 2 hợp lệ; #2 dashboard / 200000đ / 2 hợp lệ. Chi tiết evidence/matrix-cost-partial-1.json và -2.json.
- Ma trận cleaning-reasons: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-cleaning-reasons-1.json và -2.json.
- Ma trận special-names: #1 dashboard / 70021đ / 7 hợp lệ; #2 dashboard / 70021đ / 7 hợp lệ. Chi tiết evidence/matrix-special-names-1.json và -2.json.
- Ma trận whitespace-order: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-whitespace-order-1.json và -2.json.
- Ma trận boundary-rfm: #1 dashboard / 741000đ / 7 hợp lệ; #2 dashboard / 741000đ / 7 hợp lệ. Chi tiết evidence/matrix-boundary-rfm-1.json và -2.json.
- Ma trận boundary-abc: #1 dashboard / 100000đ / 3 hợp lệ; #2 dashboard / 100000đ / 3 hợp lệ. Chi tiết evidence/matrix-boundary-abc-1.json và -2.json.
- Ma trận scale-50000: #1 dashboard / 5000000đ / 50000 hợp lệ; #2 dashboard / 5000000đ / 50000 hợp lệ. Chi tiết evidence/matrix-scale-50000-1.json và -2.json.
- Ma trận scale-200000: #1 dashboard / 20000000đ / 200000 hợp lệ; #2 dashboard / 20000000đ / 200000 hợp lệ. Chi tiết evidence/matrix-scale-200000-1.json và -2.json.
- Ma trận excel-first-normal: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-excel-first-normal-1.json và -2.json.
- Ma trận excel-data-second: #1 error; #2 error. Chi tiết evidence/matrix-excel-data-second-1.json và -2.json.
- Ma trận excel-header-row3: #1 mapping-blocked; #2 mapping-blocked. Chi tiết evidence/matrix-excel-header-row3-1.json và -2.json.
- Ma trận excel-merged: #1 mapping-blocked; #2 mapping-blocked. Chi tiết evidence/matrix-excel-merged-1.json và -2.json.
- Ma trận excel-blanks: #1 dashboard / 120000đ / 2 hợp lệ; #2 dashboard / 120000đ / 2 hợp lệ. Chi tiết evidence/matrix-excel-blanks-1.json và -2.json.
- Ma trận excel-date-serial: #1 dashboard / 100000đ / 1 hợp lệ; #2 dashboard / 100000đ / 1 hợp lệ. Chi tiết evidence/matrix-excel-date-serial-1.json và -2.json.
### UI-05 · Quan trọng · VIP hiển thị dù mã hóa đơn chưa đủ tin cậy
- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Mở app. 2. Nhập data/order-none.csv (hoặc .xlsx theo manifest). 3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-order-none-1.json và -2.json.
- **Thực tế:** VIP = 1 trong khi tổng đơn/AOV báo thiếu; cờ mã đơn false. Tab khách yêu cầu mã đơn (ảnh bổ sung ở kiểm tra giả thuyết).
- **Mong đợi:** Ẩn hoặc ghi rõ chưa đủ dữ liệu cho mọi nội dung RFM.
- **Bằng chứng:** evidence/matrix-order-none-1.json, -2.json; screenshots/matrix-order-none-1-result.png hoặc -1-input.png; báo cáo -1-report.png nếu có.
- **Nguyên nhân trong code:** OverviewTab.tsx:23 chỉ hasCustomerData; CustomerTab.tsx:25 kiểm hasReliableOrderIds. Chắc chắn.
- **Phạm vi ảnh hưởng:** Thiếu toàn bộ hoặc một phần mã đơn.
- **Hướng sửa gợi ý:** Dùng cùng điều kiện tin cậy cho KPI/RFM/gợi ý.

### UI-06 · Nghiêm trọng · Chữ ký trùng không phân biệt dòng bán hợp lệ và bản sao
- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Mở app. 2. Nhập data/duplicate-real-order.csv (hoặc .xlsx theo manifest). 3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-duplicate-real-order-1.json và -2.json.
- **Thực tế:** Hai dòng bán hợp lệ giống nhau tổng 200.000đ còn 100.000đ; report loại #2. Bản sao thiếu mã trong duplicate-no-order.csv lại giữ 200.000đ, không loại.
- **Mong đợi:** Cần phân biệt bản sao với dòng hàng riêng hoặc cho người dùng duyệt chính sách loại trùng. Đây là rủi ro của quy tắc nghiệp vụ, không phải hàm vi phạm quy tắc chữ ký đã nêu.
- **Bằng chứng:** evidence/matrix-duplicate-real-order-1.json, -2.json; screenshots/matrix-duplicate-real-order-1-result.png hoặc -1-input.png; báo cáo -1-report.png nếu có.
- **Nguyên nhân trong code:** cleaner.ts:337–350 tạo mã AUTO có STT rồi đưa mã đó vào chữ ký; chữ ký không có mã dòng. Chắc chắn, sẽ cập nhật số dòng chính xác.
- **Phạm vi ảnh hưởng:** Doanh thu/số lượng/lãi và RFM sau làm sạch.
- **Hướng sửa gợi ý:** Có mã dòng hàng, chọn giữ/loại hoặc báo cáo các ứng viên trước khi quyết định; khi thiếu mã đơn đừng quảng bá bắt mọi bản sao.

### UI-08 · Quan trọng · Excel khác sheet hoặc lệch header không có đường xử lý rõ
- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Mở app. 2. Nhập data/excel-data-second.csv (hoặc .xlsx theo manifest). 3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-excel-data-second-1.json và -2.json.
- **Thực tế:** Excel có dữ liệu hợp lệ ở sheet 2 báo Trang tính Excel không chứa dòng dữ liệu nào. Header ở dòng 3/merge dẫn tới cột BÁO CÁO và __EMPTY, nút bị khóa.
- **Mong đợi:** Cho chọn sheet/header hoặc chỉ rõ cách chuyển sheet/dọn dòng trang trí trong thông báo.
- **Bằng chứng:** evidence/matrix-excel-data-second-1.json, -2.json; screenshots/matrix-excel-data-second-1-result.png hoặc -1-input.png; báo cáo -1-report.png nếu có.
- **Nguyên nhân trong code:** parser.ts:51 chọn SheetNames[0], sheet_to_json không đặt range/header. Chắc chắn.
- **Phạm vi ảnh hưởng:** File Excel xuất từ phần mềm có sheet giới thiệu hoặc tiêu đề trang trí.
- **Hướng sửa gợi ý:** Bổ sung sheet/header selector hoặc hướng dẫn giới hạn ngay khi nhập.

### UI-09 · Gợi ý · Giá vốn tổng dòng có thể bị hiểu là vốn đơn vị mà không cảnh báo
- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Mở app. 2. Nhập data/total-cost-as-unit.csv (hoặc .xlsx theo manifest). 3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-total-cost-as-unit-1.json và -2.json.
- **Thực tế:** Số lượng 2, doanh thu 100.000đ, người nhập tổng vốn 60.000đ → app nhân đôi thành 120.000đ, lãi -20.000đ; không cảnh báo. Với vốn đơn vị 70.000đ, lãi -40.000đ cũng không cảnh báo bất thường.
- **Mong đợi:** Công thức đơn vị hiện tính đúng; nên xác nhận loại giá vốn hoặc cảnh báo để người không rành kỹ thuật phát hiện nhập nhầm.
- **Bằng chứng:** evidence/matrix-total-cost-as-unit-1.json, -2.json; screenshots/matrix-total-cost-as-unit-1-result.png hoặc -1-input.png; báo cáo -1-report.png nếu có.
- **Nguyên nhân trong code:** cleaner.ts xử lý totalCost=costPrice×quantity; ColumnMapper có nhãn Giá vốn đơn vị. Chắc chắn; không coi đây là lỗi công thức.
- **Phạm vi ảnh hưởng:** File dùng tổng vốn dòng, file lỗ hàng loạt.
- **Hướng sửa gợi ý:** Cho chọn vốn đơn vị/tổng dòng hoặc cảnh báo tỷ lệ dòng lỗ bất thường, không tự sửa số.

### UI-10 · Quan trọng · Có giá vốn và đang lỗ nhưng nhận xét lại yêu cầu nhập giá vốn
- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Mở app. 2. Nhập data/negative-profit.csv (hoặc .xlsx theo manifest). 3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-negative-profit-1.json và -2.json.
- **Thực tế:** Lợi nhuận -40.000đ, coverage 100%, biên -40%, nhưng productProfit nói Cần nhập cột Giá vốn; top lợi nhuận rỗng.
- **Mong đợi:** Phân biệt không có giá vốn với không có sản phẩm lãi dương; nói rõ sản phẩm đang lỗ.
- **Bằng chứng:** evidence/matrix-negative-profit-1.json, -2.json; screenshots/matrix-negative-profit-1-result.png hoặc -1-input.png; báo cáo -1-report.png nếu có.
- **Nguyên nhân trong code:** productMetrics.ts lọc profit>0 cho topProfitable; textConclusions.ts:87 coi topProfitable rỗng là thiếu vốn. Chắc chắn.
- **Phạm vi ảnh hưởng:** Toàn sản phẩm lỗ hoặc hòa vốn.
- **Hướng sửa gợi ý:** Tách điều kiện thiếu vốn và danh sách không có lãi dương.

### UI-11 · Nhỏ · Nhãn dữ liệu mẫu lệch số bản ghi thực
- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Mở app. 2. Nhập data/oracle-28.csv (hoặc .xlsx theo manifest). 3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-oracle-28-1.json và -2.json.
- **Thực tế:** Trang đầu ghi mẫu 5.030 dòng; file mẫu tải và parse thực tế có 5.031 bản ghi.
- **Mong đợi:** Nhãn cùng số thực tế hoặc dùng mô tả xấp xỉ rõ ràng.
- **Bằng chứng:** evidence/matrix-oracle-28-1.json, -2.json; screenshots/matrix-oracle-28-1-result.png hoặc -1-input.png; báo cáo -1-report.png nếu có.
- **Nguyên nhân trong code:** FileUploadZone.tsx:16 hardcode 5.030; dữ liệu public đếm độc lập 5031. Chắc chắn.
- **Phạm vi ảnh hưởng:** Trang đầu và mô tả mẫu.
- **Hướng sửa gợi ý:** Sinh metadata mẫu hoặc tránh hardcode số chính xác.

### UI-14 · Nghiêm trọng · Mã hóa đơn tái dùng qua ngày/khách bị gộp và không cảnh báo
- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Mở app. 2. Nhập data/order-reused-days.csv (hoặc .xlsx theo manifest). 3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-order-reused-days-1.json và -2.json.
- **Thực tế:** Hai hóa đơn HD1 ở 01/09 và 30/09 của hai khách bị gộp: doanh thu 120.000đ, tổng đơn 1, AOV 120.000đ; đáp án theo hai giao dịch là 2 đơn/AOV 60.000đ. Dữ liệu vẫn được đánh dấu mã đơn tin cậy.
- **Mong đợi:** Phát hiện mã đơn không nhất quán và yêu cầu xác minh, tránh báo số đơn tin cậy.
- **Bằng chứng:** evidence/matrix-order-reused-days-1.json, -2.json; screenshots/matrix-order-reused-days-1-result.png hoặc -1-input.png; báo cáo -1-report.png nếu có.
- **Nguyên nhân trong code:** overviewMetrics.ts dùng Set orderId toàn file; productMetrics.ts gom giỏ cùng mã; cờ tin cậy chỉ kiểm mã khác AUTO-. Chắc chắn.
- **Phạm vi ảnh hưởng:** Số đơn/AOV, cặp mua cùng giả, tần suất/nhóm khách.
- **Hướng sửa gợi ý:** Kiểm tính nhất quán ngày/khách cho mỗi mã đơn trước khi quyết định khóa nhóm.

### UI-15 · Quan trọng · Toàn bộ dòng sai thì mất báo cáo lý do và số thứ tự
- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Mở app. 2. Nhập data/date-invalid.csv (hoặc .xlsx theo manifest). 3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-date-invalid-1.json và -2.json.
- **Thực tế:** CSV chứa 31/02/2026 chỉ báo Không có dòng hợp lệ. Hãy kiểm tra ghép cột và định dạng dữ liệu; không cho xem lý do/ngày/#1. Cùng hành vi khi số sai hoặc serial CSV.
- **Mong đợi:** Trả báo cáo làm sạch ngay cả khi validRows=0 để người dùng biết ô nào cần sửa.
- **Bằng chứng:** evidence/matrix-date-invalid-1.json, -2.json; screenshots/matrix-date-invalid-1-result.png hoặc -1-input.png; báo cáo -1-report.png nếu có.
- **Nguyên nhân trong code:** analyzer.ts:87 ném Error khi cleanRows rỗng trước khi trả report; report modal chỉ ở dashboard App.tsx. Chắc chắn.
- **Phạm vi ảnh hưởng:** File toàn lỗi hoặc ghép sai cột.
- **Hướng sửa gợi ý:** Giữ report trong lỗi có cấu trúc và hiển thị ở màn hình mapping.

### UI-12 · Quan trọng · Dependency xlsx bị npm audit cảnh báo mức high
- **Thấy ở đâu:** Nhập file → dashboard/báo cáo
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Mở app. 2. Nhập data/excel-first-normal.csv (hoặc .xlsx theo manifest). 3. Phân tích/xem kết quả; đã làm hai lần, xem evidence/matrix-excel-first-normal-1.json và -2.json.
- **Thực tế:** npm ci và npm audit trên snapshot đều ghi 1 dependency high; xlsx 0.18.5 bị hai advisory prototype pollution/ReDoS; fixAvailable=false. Không chạy khai thác nên không kết luận app đã bị xâm nhập.
- **Mong đợi:** Dùng bản phát hành đã vá và kiểm tra lại các file Excel trước khi đưa cho người dùng.
- **Bằng chứng:** evidence/matrix-excel-first-normal-1.json, -2.json; screenshots/matrix-excel-first-normal-1-result.png hoặc -1-input.png; báo cáo -1-report.png nếu có.
- **Nguyên nhân trong code:** package.json phụ thuộc xlsx ^0.18.5; parser.ts import xlsx và đọc workbook người dùng. Chắc chắn về dependency, chưa xác minh khai thác.
- **Phạm vi ảnh hưởng:** Luồng nhập Excel.
- **Hướng sửa gợi ý:** Đánh giá bản chính thức có vá theo SheetJS và rerun regression; không giả định npm audit fix tự giải quyết.

- Bằng chứng audit: logs/audit-escalated.log; advisory https://github.com/advisories/GHSA-4r6h-8v6p-xvw6 và https://github.com/advisories/GHSA-5pgg-2g8v-p4x9.

### UI-17 · Nghiêm trọng · Nhận xét VIP báo 100% doanh thu dù chỉ chiếm 10% doanh thu cửa hàng
- **Thấy ở đâu:** Tab Khách hàng → nhận xét RFM
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Nhập customer-partial.csv: khách KH1 chi 100.000đ, dòng không mã khách 900.000đ. 2. So Tổng quan với nhận xét khách. 3. Đã làm hai lần.
- **Thực tế:** Tổng quan 1 triệu; nhận xét 1 khách VIP đóng góp 100% doanh thu (100.000đ). Tỷ lệ toàn cửa hàng thực tế 10%.
- **Mong đợi:** Dùng doanh thu toàn cửa hàng hoặc ghi rõ 100% doanh thu đã nhận diện khách, kèm coverage 10%.
- **Bằng chứng:** screenshots/customer-partial-overview-1.png và customer-partial-customers-1.png; evidence/extra-results.json (hai lượt).
- **Nguyên nhân trong code:** src/core/customerMetrics.ts:202 tổng hợp mẫu số từ customerItems; textConclusions.ts:116 gọi đó là doanh thu không giới hạn. Chắc chắn; dòng chính xác cập nhật cuối.
- **Phạm vi ảnh hưởng:** File chỉ có mã khách ở một phần giao dịch.
- **Hướng sửa gợi ý:** Thống nhất mẫu số với tổng quan hoặc ghi rõ tập con và độ phủ mã khách.

### UI-02 · Nhỏ · Drawer nhìn thấy được nhưng khung dialog 0×0 làm test báo hidden
- **Thấy ở đâu:** Tùy chỉnh giao diện và test Playwright đầu tiên
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Nhập oracle-28.csv. 2. Mở tùy chỉnh. 3. Chụp ảnh và đo cả dialog/inner; thực hiện hai lần và ở ba kích thước.
- **Thực tế:** Panel 440×761,5px nhìn thấy và bấm được; dialog cha 0×0, locator role dialog isVisible=false. Test đầu trượt ở toBeVisible.
- **Mong đợi:** Khung dialog có kích thước phù hợp hoặc assertion kiểm nội dung thực tế. Không kết luận drawer không mở vì thực tế thao tác đổi theme được.
- **Bằng chứng:** screenshots/theme-drawer-boundary-1.png, -2.png; evidence/verify-results.json; logs/playwright.log; evidence/playwright-run1-results/*/error-context.md.
- **Nguyên nhân trong code:** src/index.css:1202 fixed-position .dialog-inner thoát khỏi flow; dialog không có kích thước. tests/browser/dashboard.pw.ts:27 kiểm dialog cha. Chắc chắn.
- **Phạm vi ảnh hưởng:** Theme drawer và độ tin cậy của test visibility.
- **Hướng sửa gợi ý:** Bố trí fixed trên dialog hoặc quy định kích thước cha; assertion cần phản ánh nội dung người dùng nhìn thấy.

### UI-03 · Nhỏ · Test reduced motion đòi animationName none trái với CSS đang triển khai
- **Thấy ở đâu:** Test 50.000 dòng
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Bật prefers-reduced-motion. 2. Nhập oracle/50k. 3. Đo style; hai lần trong verify và test gốc.
- **Thực tế:** animationName=appleSpringReveal, duration=0,01ms, canvas=0; test yêu cầu none nên trượt.
- **Mong đợi:** Test và hành vi reduced motion thống nhất; thời lượng cực ngắn không đồng nghĩa animationName=none.
- **Bằng chứng:** evidence/verify-results.json H2; screenshots/h2-reduced-motion-1.png; logs/playwright.log; error-context test 50k.
- **Nguyên nhân trong code:** src/index.css:126 rút ngắn duration/iteration nhưng không đặt animation:none; tests/browser/dashboard.pw.ts:76. Chắc chắn.
- **Phạm vi ảnh hưởng:** Test giảm chuyển động; delay Reveal vẫn chưa reset.
- **Hướng sửa gợi ý:** Chốt tiêu chí reduced motion, kiểm duration/delay phù hợp hoặc thực sự tắt animation theo yêu cầu.

### UI-04 · Quan trọng · Class CSS thiếu, mật độ không đổi, cỡ chữ chỉ tác động một phần
- **Thấy ở đâu:** Bảng, tooltip và tùy chỉnh giao diện
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Mở bảng oracle. 2. Đo computed styles và chụp. 3. Đổi Thoáng/Gọn, 16/18/20; đã làm hai lần trên ba kích thước.
- **Thực tế:** block không tồn tại nên danh mục/date cùng dòng; inline-flex/whitespace-nowrap không tác dụng; tooltip là chữ chồng không có nền riêng. Mật độ đổi data-density nhưng padding/size không đổi. Root lên 20px trong khi KPI 28px desktop/24px mobile, h1 28px, bảng 13,5px giữ nguyên.
- **Mong đợi:** Class layout phải có CSS; mật độ đổi bố cục và cỡ chữ tăng được các thông tin quan trọng.
- **Bằng chứng:** screenshots/oracle-28-products.png, oracle-28-customers.png, tooltip-overview-1.png, h3-font20-products-1.png; evidence/verify-results.json H3 và ui-actions.json theme-*.
- **Nguyên nhân trong code:** src/index.css:3 chỉ import Google Fonts, chưa nhập Tailwind; tiện ích tự viết cuối CSS thiếu block/inline-flex/whitespace-nowrap/min-w-56/max-w-72/text-base/ml-auto; không có selector data-density. Chắc chắn.
- **Phạm vi ảnh hưởng:** Danh mục/date phụ, icon xu hướng, ô lời khuyên, KPI thiếu dữ liệu, tooltip và cá nhân hóa.
- **Hướng sửa gợi ý:** Hoàn thiện CSS đang dùng hoặc sinh utilities đồng bộ; dùng biến density và đơn vị font phù hợp.

### UI-16 · Quan trọng · Tab khách tràn màn hình mobile và kéo lệch cả trang
- **Thấy ở đâu:** Dashboard 375px → mở Khách hàng
- **Môi trường:** Edge 155, 375×1000; oracle-28.csv; hai lần, cả sáng/tối
- **Cách tái tạo:** 1. Nhập oracle ở 375px. 2. Bấm Khách hàng. 3. Quan sát và đo scrollX; đã thực hiện hai lượt.
- **Thực tế:** scrollWidth=501–502px với viewport375; click tab gây scrollX126, headingLeft=-110px. Logo, heading và KPI bên trái bị cắt.
- **Mong đợi:** Tab vừa viewport hoặc cuộn trong tablist riêng; không kéo lệch toàn dashboard.
- **Bằng chứng:** screenshots/mobile-tabs-viewport-1.png; mobile-customers-shift-1.png và -2.png; evidence/extra-results.json; ui-geometry-*-375-*.json; test mobile gốc trượt.
- **Nguyên nhân trong code:** src/index.css:624 flex item có padding ngang20px, white-space:nowrap và min-width theo nội dung; không có breakpoint cho tablist. Chắc chắn.
- **Phạm vi ảnh hưởng:** Dashboard mobile, số đếm tab làm tăng bề rộng; bảng có cuộn riêng là đúng và không phải nguyên nhân chính.
- **Hướng sửa gợi ý:** Giảm padding/min-width, dùng layout mobile và cuộn tablist thay vì cuộn document.

### UI-18 · Quan trọng · Nhận xét khẳng định khách quay lại tích cực dù tất cả mới mua một lần
- **Thấy ở đâu:** Nhận xét RFM trong tab Khách hàng
- **Môi trường:** Microsoft Edge 155, 1366×1000, localhost:5181, bản sao nguyên trạng
- **Cách tái tạo:** 1. Nhập same-day-customers.csv, sáu khách mỗi người chỉ có một hóa đơn. 2. Mở khách. 3. Đã làm hai lần.
- **Thực tế:** Tất cả F=1, vẫn ghi Cửa hàng đang duy trì tỷ lệ khách quay lại mua sắm rất tích cực.
- **Mong đợi:** Chỉ kết luận quay lại khi có dữ liệu tần suất hoặc nói chưa có khách thuộc nhóm nguy cơ.
- **Bằng chứng:** screenshots/retention-unsupported-1.png và -2.png; evidence/last-checks.json.
- **Nguyên nhân trong code:** src/core/textConclusions.ts:128 dùng không có khách nguy cơ để suy ra tỷ lệ quay lại tích cực, không tính tỷ lệ mua lặp. Chắc chắn.
- **Phạm vi ảnh hưởng:** Khách chỉ mua một lần, file ngắn, nhóm khách mới.
- **Hướng sửa gợi ý:** Tính repeat customer rate hoặc dùng nhận xét trung tính đúng dữ liệu.
