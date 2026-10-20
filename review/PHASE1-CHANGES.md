# BÁO CÁO TỔNG KẾT THAY ĐỔI — GIAI ĐOẠN 1: DATA INTEGRITY & RELIABILITY

- **Thư mục lưu trữ:** `review/PHASE1-CHANGES.md`
- **Tài liệu chi tiết tại thư mục gốc:** [PHASE1-IMPLEMENTATION-REPORT.md](../PHASE1-IMPLEMENTATION-REPORT.md)
- **Thời gian hoàn thành:** 14/10/2026
- **Trạng thái:** HOÀN THÀNH 100% (7/7 mã lỗi bắt buộc đã được giải quyết và kiểm thử hồi quy thành công)

---

## 1. Tóm tắt các file mã nguồn đã chỉnh sửa

| STT | Đường dẫn file | Nội dung thay đổi chính | Mã lỗi liên quan |
|---|---|---|---|
| 1 | `src/core/types.ts` | Bổ sung kiểu `DeduplicatePolicy`, `OrderIdStatus`; thêm `rawOrderId`, `suspectedDuplicates`, `topLossMaking`, `customerRevenueCoverage`, `repeatCustomersCount`, `repeatCustomerRate`, `storeRevenuePercentage`. | UI-06, UI-14, UI-17, UI-05, UI-10, UI-18 |
| 2 | `src/core/cleaner.ts` | Thay đổi chính sách loại trùng sang mặc định an toàn `keep_all` (không tự xóa dòng bán thật); bổ sung quét xung đột mã đơn theo ngày/khách để tự động tách giao dịch nội bộ bằng khóa `rawOrderId#date#customerId`. | UI-06, UI-14 |
| 3 | `src/core/overviewMetrics.ts` | Bổ sung đánh giá tính tin cậy của mã hóa đơn; gán `orderIdStatus = 'reused_disambiguated'` và `hasOrderCollisions = true` khi phát hiện tái dùng mã đơn qua ngày/khách; giữ nguyên tính toàn vẹn của số đơn và AOV. | UI-14, UI-05 |
| 4 | `src/core/productMetrics.ts` | Bổ sung danh sách `topLossMaking` chứa các sản phẩm có lợi nhuận âm để phân biệt rõ tình trạng bán lỗ với tình trạng thiếu cột giá vốn. | UI-10 |
| 5 | `src/core/customerMetrics.ts` | Nhận `totalStoreRevenue` để tính mẫu số toàn cửa hàng (`storeRevenuePercentage`) phân biệt với mẫu số nhóm khách đã nhận diện (`revenuePercentage`); tính `repeatCustomerRate` và `repeatCustomersCount` ($F \ge 2$). | UI-17, UI-18 |
| 6 | `src/core/textConclusions.ts` | Sửa `generateProfitMarginConclusion` để báo cáo trung thực mức lỗ khi toàn bộ sản phẩm lỗ (không yêu cầu nhập giá vốn); sửa `generateCustomerConclusion` để phân định 2 mẫu số tỷ trọng VIP và chỉ nhận xét tích cực về quay lại khi có lượt mua lặp lại thực tế. | UI-10, UI-17, UI-18 |
| 7 | `src/core/analyzer.ts` | Truyền `overview.totalRevenue` và `overview.hasReliableOrderIds` vào hàm tính toán và kết luận khách hàng, đảm bảo tính nhất quán trên cả đường chạy đồng bộ và Worker. | UI-05, UI-17, UI-18 |
| 8 | `src/core/columnMapping.ts` | Cập nhật kiểu `COLUMN_KEYWORDS` loại trừ `deduplicatePolicy` khỏi danh sách từ khóa cột Excel/CSV. | Type safety |
| 9 | `src/components/dashboard/OverviewTab.tsx` | Thống nhất điều kiện hiển thị KPI Khách VIP (`isVipAvailable = customerAnalysis.hasCustomerData && ordersAvailable`); khi thiếu mã đơn hiển thị `Chưa đủ dữ liệu`; cập nhật phụ đề Tổng đơn hàng khi có mã đơn tái sử dụng. | UI-05, UI-14 |
| 10 | `src/components/dashboard/CustomerTab.tsx` | Thêm chú thích minh bạch về độ phủ mã khách hàng (`customerRevenueCoverage`) và mẫu số phân khúc trên biểu đồ khi độ phủ < 100%. | UI-17 |
| 11 | `src/components/upload/CleaningReportModal.tsx` | Bổ sung khu vực thông báo "Dòng nghi ngờ trùng lặp" với số dòng được giữ và tổng tiền được bảo vệ theo chính sách an toàn. | UI-06 |
| 12 | `package.json` | Nâng cấp dependency `xlsx` từ `0.18.5` (có cảnh báo High) lên bản phát hành chính thức đã vá lỗi `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`. | UI-12 |

---

## 2. Các file kiểm thử mới và cập nhật

1. **`src/test/phase1IntegrityRegression.test.ts` (MỚI):**
   - 23 bài test kiểm thử tự động chuyên sâu kiểm tra toàn diện 7 mã lỗi:
     - Case A, B, C, D cho UI-06 (Duplicate detection & policy).
     - Case reused order IDs, same day different customer, multi-item order, missing order IDs cho UI-14.
     - Case partial customer, 100% coverage, no customer cho UI-17.
     - Case missing order ID cho UI-05.
     - Case negative profit (-40k), break-even, mixed profit/loss, missing cost cho UI-10.
     - Case all F=1 (same-day-customers.csv), repeat customer rate cho UI-18.
     - 5 bài test Excel/XLSX/legacy XLS/blanks/date serials/unicode cho UI-12.
2. **`src/test/cleaner.test.ts` (CẬP NHẬT):**
   - Cập nhật kỳ vọng theo chính sách loại trùng mới: kiểm tra cả chính sách mặc định an toàn (`keep_all`) giữ 3 dòng và chính sách xác nhận xóa trùng (`drop_exact_duplicates`) giữ 2 dòng.
3. **`src/test/sampleDataset.test.ts` (CẬP NHẬT):**
   - Kiểm tra bộ dữ liệu mẫu 5.031 dòng: chính sách an toàn giữ lại 4.981 dòng (chỉ loại 50 dòng lỗi định dạng thật và cảnh báo 42 dòng nghi trùng); chính sách nghiêm ngặt loại 92 dòng.
4. **`tests/browser/phase1_integrity.pw.ts` (MỚI):**
   - 4 kịch bản kiểm thử giao diện người dùng thực tế bằng Playwright trên trình duyệt:
     - Người dùng upload `duplicate-real-order.csv`: kiểm tra doanh thu giữ nguyên 200.000đ và mở xem báo cáo nghi trùng.
     - Người dùng upload `order-none.csv`: kiểm tra KPI Khách VIP và Tổng đơn hiển thị `Chưa đủ dữ liệu`, tab Khách hàng báo thiếu mã đơn.
     - Người dùng upload `negative-profit.csv`: kiểm tra KPI Lợi nhuận gộp ghi nhận -40.000đ và nhận xét tab Sản phẩm nêu rõ lợi nhuận âm.
     - Người dùng upload `same-day-customers.csv`: kiểm tra nhận xét tab Khách hàng không khen ngợi quay lại khi $F=1$.

---

## 3. Bảng tổng hợp kết quả kiểm tra trước / sau

| Tình huống | Trước khi sửa | Sau khi sửa | Đánh giá |
|---|---|---|---|
| `duplicate-real-order.csv` | Doanh thu 100.000đ (mất 1 dòng) | Doanh thu 200.000đ (giữ cả 2 dòng, báo nghi trùng) | Đạt |
| `order-reused-days.csv` | 1 đơn, AOV 120.000đ (gộp sai) | 2 đơn, AOV 60.000đ (tách đúng 2 giao dịch) | Đạt |
| `customer-partial.csv` | VIP chiếm 100% doanh thu (sai ngữ cảnh) | VIP chiếm 10% toàn tiệm, 100% nhóm có mã khách (độ phủ 10%) | Đạt |
| `order-none.csv` | Khách VIP = 1 trên Tổng quan | Khách VIP = "Chưa đủ dữ liệu" | Đạt |
| `negative-profit.csv` | "Cần nhập cột Giá vốn" | "Tất cả mặt hàng có giá vốn hiện đang ghi nhận mức lợi nhuận âm (Trà: -40.000 đ, biên -40%)" | Đạt |
| `same-day-customers.csv` | "Duy trì tỷ lệ khách quay lại rất tích cực" | "Toàn bộ 6 khách hàng đều mới phát sinh 1 đơn hàng (chưa có lượt mua lặp lại)" | Đạt |
| Bảo mật `xlsx` | 1 High severity vulnerability (Prototype Pollution / ReDoS) | 0 vulnerabilities (`npm audit` sạch 100%) | Đạt |

---

## 4. Kết quả thực thi các lệnh hệ thống

- **`npm run build`:** Thành công (Exit code 0, 0 errors, hoàn tất trong 0.5s).
- **`npm run lint`:** Thành công (Exit code 0, 0 errors).
- **`npm run test` (Vitest):** Thành công 15/15 files, **65/65 tests pass (100%)**.
- **`npx playwright test tests/browser/phase1_integrity.pw.ts`:** Thành công **4/4 tests pass (100%)**.
- **`npm audit`:** Thành công (**0 vulnerabilities**).

---

## 5. Kết luận

Toàn bộ các yêu cầu của **GIAI ĐOẠN 1: DATA INTEGRITY & RELIABILITY** đã được hoàn thành trọn vẹn, có tài liệu và bài kiểm thử bảo chứng. Dự án sẵn sàng bước vào **Giai đoạn 2 — Thiết kế nền dữ liệu POS và kho**.
