# NHẬT KÝ QUYẾT ĐỊNH THIẾT KẾ (DECISIONS.MD)

Dự án: **Web App Trực Quan Hóa Dữ Liệu Bán Hàng Cho Cửa Hàng Bán Lẻ Nhỏ**

---

## 1. Giai đoạn 0: Khởi tạo và Cấu trúc Dự án

### Quyết định 0.1: Cấu trúc 3 tầng độc lập
- **Quyết định**: Phân tách mã nguồn thành 3 tầng:
  1. `src/core/`: Chứa toàn bộ logic đọc file (`parser.ts`), làm sạch dữ liệu (`cleaner.ts`), các thuật toán phân tích (ABC Pareto, RFM khách hàng, xu hướng, đồng xuất hiện) và sinh câu kết luận template. Tầng này là các hàm thuần túy (pure functions), không phụ thuộc vào React/UI, độc lập để kiểm thử tự động (Unit Test bằng Vitest).
  2. `src/components/`: Tầng giao diện hiển thị (React 19), chia theo chức năng: Upload & Ghép cột, Dashboard (Tổng quan, Sản phẩm, Khách hàng), Bảng dữ liệu tương tác, Xuất CSV.
  3. `src/styles/`: Thiết kế giao diện hiện đại bằng Vanilla CSS với hệ thống biến (CSS Design Tokens), hỗ trợ đầy đủ responsive cả điện thoại (Mobile) lẫn máy tính (Laptop/Desktop).
- **Lý do**: Đảm bảo hiệu năng tối đa khi xử lý tập dữ liệu lớn (>50.000 dòng), tránh render lại không cần thiết và tạo điều kiện unit test 100% các con số tính toán.

### Quyết định 0.2: Thư viện và Công nghệ
- **Vite + React 19 (TypeScript)**: Tối ưu tốc độ tải và đóng gói nhẹ nhàng.
- **PapaParse**: Xử lý CSV nhanh, tự động xử lý UTF-8 BOM, ngắt dòng Windows/Unix và tự đoán dấu phân cách (`,`, `;`, `\t`).
- **SheetJS (xlsx)**: Đọc file Excel `.xlsx`, `.xls` ngay trên trình duyệt mà không cần backend.
- **Recharts**: Vẽ biểu đồ linh hoạt, tương thích tốt với React và hiển thị mượt mà trên mobile.
- **Lucide React**: Bộ icon trực quan, hiện đại, kích thước nhẹ.
- **Vitest**: Chạy unit test nhanh chóng cho lõi tính toán.

### Quyết định 0.3: Dữ liệu mẫu kiểm thử xuyên suốt
- **Quyết định**: Sinh tập dữ liệu thực tế gồm 5.030 dòng, 50 mặt hàng tiêu dùng nhanh (FMCG) và tạp hóa phổ biến tại Việt Nam, 300 khách hàng, trải dài 12 tháng (10/2025 - 09/2026).
- **Cố ý đưa vào các dòng lỗi**:
  - 30 dòng trùng lặp 100%.
  - 15 dòng để trống hoặc sai ngày bán.
  - 15 dòng có số lượng hoặc doanh thu âm.
  - 10 dòng có số lượng hoặc doanh thu bằng 0.
  - 10 dòng thiếu mã/tên sản phẩm.
- **Lý do**: Đảm bảo bộ lọc làm sạch dữ liệu (`cleaner.ts`) được kiểm tra nghiêm ngặt, thống kê minh bạch số dòng bị loại và lý do cho người dùng.

---

## 2. Giai đoạn 1: Tải file & Ghép cột

### Quyết định 1.1: Tự động đoán ghép cột theo từ khóa tiếng Việt & Anh
- **Quyết định**: Cung cấp từ điển các tên cột phổ biến (bao gồm tiếng Việt có dấu, không dấu và tiếng Anh):
  - Ngày bán: `ngày bán`, `ngày`, `ngay_ban`, `order date`, `date`, `created_at`...
  - Sản phẩm: `tên sản phẩm`, `tên hàng`, `mã sản phẩm`, `mã hàng`, `sku`, `product`...
  - Số lượng: `số lượng`, `sl`, `qty`, `quantity`...
  - Doanh thu: `doanh thu`, `thành tiền`, `tổng tiền`, `revenue`, `total`...
  - Đơn giá: `đơn giá`, `giá bán`, `price`, `unit price`...
  - Giá vốn: `giá vốn`, `tiền vốn`, `cost`, `cogs`...
  - Mã khách hàng: `mã khách hàng`, `mã kh`, `khách hàng`, `customer id`...
  - Mã đơn hàng: `mã đơn hàng`, `mã đơn`, `số hóa đơn`, `order id`, `invoice`...
- **Lý do**: Người dùng bán lẻ thường xuất file từ KiotViet, Sapo, Haravan, Pos365 với các tiêu đề cột khác nhau. Tự đoán cột giúp người dùng bắt đầu ngay mà không cần mất công chọn lại thủ công.

### Quyết định 1.2: Làm sạch dữ liệu minh bạch, tuyệt đối không âm thầm xóa
- **Quyết định**: Khi gặp dòng trùng lặp, thiếu ngày, số âm hoặc = 0, hệ thống thu thập vào `CleaningReport` kèm số thứ tự dòng mẫu (1-based index) và lý do cụ thể. Người dùng có thể nhấn nút "Xem báo cáo làm sạch file" bất kỳ lúc nào để xem danh sách này.
- **Lý do**: Chủ cửa hàng cần kiểm soát được file kế toán của mình, biết rõ bao nhiêu dòng bị loại và tại sao.

---

## 3. Giai đoạn 2: Lõi tính toán & Kiểm tra tính toán độc lập

### Quyết định 2.1: Kiểm tra tính toán độc lập 3 con số (Hand-check Verification)
- **Quyết định kiểm thử độc lập**:
  - **Con số 1 (Doanh thu & Số lượng)**: Kiểm tra tay với 3 giao dịch mẫu (10×10.000 + 5×20.000 + 2×50.000) = **300.000 VND** và **17 sản phẩm**. Thuật toán tính đúng 100%.
  - **Con số 2 (Đơn hàng & AOV)**: Kiểm tra tay với 2 đơn hàng DH001 và DH002: AOV = 300.000 / 2 = **150.000 VND**. Thuật toán tính đúng 100%.
  - **Con số 3 (Lợi nhuận gộp & Tỷ suất lợi nhuận)**: Giá vốn tương ứng là 60.000 + 60.000 + 70.000 = 190.000 VND -> Lợi nhuận gộp = 300.000 - 190.000 = **110.000 VND**, Tỷ suất LN gộp = (110.000 / 300.000) × 100 = **36.7%**. Thuật toán tính đúng 100%.

### Quyết định 2.2: Ẩn an toàn khi thiếu cột tùy chọn
- **Quyết định**: Nếu người dùng không có cột Giá vốn, giá trị `totalProfit` và `profitMargin` được đặt là `null` (không đặt là 0) và giao diện hiển thị thẻ "Cần thêm giá vốn để tính phần này". Tương tự nếu thiếu cột Khách hàng hoặc Mã đơn hàng, các phần phân tích tương ứng tự động ẩn và hiển thị lời nhắc rõ ràng.
- **Lý do**: Tránh làm người dùng hiểu lầm rằng cửa hàng bị hòa vốn (0% lãi) hoặc không có khách hàng.

---

## 4. Giai đoạn 3 & 4: Dashboard, Trải nghiệm & Hoàn thiện

### Quyết định 4.1: Câu kết luận tiếng Việt tự nhiên theo Template (Không dùng AI)
- **Quyết định**: Sử dụng các hàm nội suy chuỗi logic thuần túy (Template Strings) kết hợp với định dạng tiền tệ Việt Nam (`triệu đ`, `tỷ đ`).
  - Ví dụ: *"8 sản phẩm nhóm A đóng góp 80,2% doanh thu..."*, *"15 khách VIP đóng góp 38% tổng doanh thu toàn cửa hàng..."*.
- **Lý do**: Tốc độ phản hồi tức thì (0ms), hoạt động hoàn toàn offline không cần gọi API OpenAI/Gemini bên ngoài, đảm bảo 100% dữ liệu không rời khỏi máy tính.

### Quyết định 4.2: Tích hợp nút dùng thử nhanh 1-click
- **Quyết định**: Bổ sung nút "Dùng thử dữ liệu mẫu (5.000 dòng)" ngay tại màn hình đầu tiên và trên thanh điều hướng.
- **Lý do**: Giúp người dùng hoặc người đánh giá có thể trải nghiệm ngay lập tức toàn bộ sức mạnh của ứng dụng mà không cần chuẩn bị sẵn file từ trước.
