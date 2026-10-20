# Định hướng mở rộng: từ "Bán Hàng Smarter" thành phần mềm bán hàng cho hộ tạp hóa

Ngày soạn: 14/10/2026. Tài liệu tổng hợp các đề xuất về kiến trúc, lộ trình và rủi ro khi mở rộng dự án phân tích dữ liệu bán lẻ hiện có thành phần mềm bán hàng (POS + kho + hóa đơn điện tử).

> Lưu ý: phần pháp lý bên dưới dựa trên thông tin tìm được ngày 14/10/2026 từ các bài viết của nhà cung cấp phần mềm và trang tổng hợp văn bản pháp luật. Quy định mới có hiệu lực từ 01/07/2026 và có thể được hướng dẫn thêm. Cần xác nhận lại với cơ quan thuế hoặc nhà cung cấp hóa đơn điện tử trước khi cam kết với khách hàng. Tài liệu này không phải tư vấn pháp lý.

---

## 1. Hiện trạng và mục tiêu mới

**Hiện trạng:** web một trang (React + Vite + TypeScript), người dùng tải file CSV/Excel, ghép cột, làm sạch, rồi xem dashboard 3 tab (Tổng quan, Sản phẩm, Khách hàng). Toàn bộ xử lý nằm trong trình duyệt, không có backend, không có database.

**Mục tiêu mới (nhắm vào hộ bán lẻ một chủ, ví dụ tạp hóa):**

1. **Xuất hóa đơn điện tử** theo quy định của nhà nước (tính năng cốt lõi).
2. **Nhập liệu kho** cho cửa hàng chưa có dữ liệu: mặt hàng, số lượng tồn, thời gian nhập.
3. **Giao diện bán hàng (POS)** giống quầy thu ngân siêu thị: chủ chọn hoặc quét món hàng, hệ thống tính tiền.
4. **Khách hàng có gợi ý:** gõ tên thì gợi ý khách cũ; chưa có thì tạo mới và cập nhật dữ liệu; có lựa chọn "Khách lẻ" (guest) cho người không muốn để tên.
5. **Cài đặt dễ:** bật lên là dùng được.

**Nhận định chính:** thêm hóa đơn và bán hàng làm dự án đổi bản chất, từ công cụ xem báo cáo thành phần mềm bán hàng. Phần báo cáo hiện có vẫn giữ giá trị, nhưng nguồn dữ liệu chuyển từ "file tải lên" sang "dữ liệu do chính app sinh ra".

---

## 2. Hóa đơn điện tử: phần khó nhất

### 2.1. Quy định hiện hành (tóm tắt, cần xác minh)

- Từ 01/07/2026, một số đối tượng kinh doanh bán trực tiếp cho người tiêu dùng bắt buộc dùng hóa đơn điện tử khởi tạo từ máy tính tiền có kết nối chuyển dữ liệu đến cơ quan thuế (Nghị định 254/2026/NĐ-CP; hướng dẫn thêm tại Thông tư 91/2026/TT-BTC).
- Đơn vị đã đăng ký hóa đơn điện tử có mã hoặc không có mã theo quy định thì không bắt buộc chuyển sang hình thức từ máy tính tiền.
- Hộ kinh doanh, cá nhân kinh doanh có doanh thu năm trên 1 tỷ đồng được chọn hóa đơn điện tử có mã hoặc hóa đơn từ máy tính tiền.
- Phải hoàn tất đăng ký với cơ quan thuế trước khi dùng hình thức hóa đơn này.
- Máy tính tiền hoặc phần mềm bán hàng phải kết nối chuyển dữ liệu đến cơ quan thuế theo định dạng chuẩn.
- Cục Thuế đã khẳng định không yêu cầu hộ kinh doanh doanh thu thấp dừng dùng hóa đơn điện tử.

### 2.2. Hệ quả với kiến trúc

Hóa đơn hợp lệ phải **gửi dữ liệu ra cơ quan thuế**. Vì vậy ứng dụng không thể chỉ chạy thuần trên trình duyệt, cũng không thể chỉ "vẽ" ra một tờ hóa đơn.

**Cách thực tế, ít rủi ro nhất:** tích hợp với một **nhà cung cấp dịch vụ hóa đơn điện tử** có API (ví dụ MISA, Viettel, VNPT...) thay vì tự kết nối trực tiếp với cơ quan thuế. Ứng dụng gửi dữ liệu bán hàng; nhà cung cấp lo ký, cấp mã và gửi thuế.

Việc cần chuẩn bị:

- Tìm hiểu API, điều kiện hợp tác, chi phí và môi trường thử của vài nhà cung cấp cho hộ nhỏ.
- Một dịch vụ trung gian nhỏ để giữ khóa API an toàn.
- Hàng đợi gửi lại khi mất mạng, kèm nhật ký để đối chiếu.
- Quy trình sửa/hủy hóa đơn đúng quy định (không được xóa bừa).
- Xác nhận các tình huống: bán cho khách lẻ không lấy thông tin, thông tin người mua tối thiểu, hóa đơn từng lần bán.

**Hành động sớm:** liên hệ nhà cung cấp ngay từ bây giờ, song song với việc làm nền dữ liệu, vì đăng ký tài khoản thử và duyệt hợp tác có thể mất thời gian.

---

## 3. Các phân hệ cần có

| Phân hệ | Chức năng | Ghi chú |
| --- | --- | --- |
| Danh mục hàng và kho | Tên, mã/mã vạch, đơn vị, giá bán, giá vốn, tồn kho, ngày nhập | Nhập tay và nhập từ Excel. Tồn kho = tổng nhập − tổng bán, mỗi lần nhập là một phiếu nhập |
| Bán hàng (POS) | Chọn/quét hàng, số lượng, tính tiền, in hoặc gửi hóa đơn | Tìm theo tên, quét mã vạch, phím tắt, nút hàng hay bán |
| Khách hàng | Gợi ý khi gõ, tự tạo nếu chưa có, "Khách lẻ" | Chỉ cần tên hoặc số điện thoại, tránh bắt nhập nhiều |
| Hóa đơn điện tử | Phát hành, tra cứu, xử lý sai sót | Qua nhà cung cấp |
| Báo cáo | Dashboard hiện có | Đổi nguồn sang dữ liệu trong app; giữ tải file cho khách có dữ liệu cũ |
| Sao lưu | Xuất/nhập toàn bộ dữ liệu | Bắt buộc |

**Lợi ích kéo theo:** dữ liệu bán hàng tự sinh nên không cần ghép cột, có sẵn mã đơn thật, nên các chỉ số phụ thuộc mã đơn (số đơn, AOV, mua cùng, RFM) sẽ chạy đúng.

### 3.1. Mô hình dữ liệu gợi ý (mức khái quát)

- **Hàng hóa:** mã, mã vạch, tên, danh mục, đơn vị, giá bán, giá vốn hiện hành.
- **Phiếu nhập kho:** ngày nhập, nhà cung cấp (tùy chọn), các dòng (hàng, số lượng, giá nhập).
- **Khách hàng:** mã nội bộ, tên, số điện thoại (tùy chọn), cờ "khách lẻ".
- **Đơn bán:** mã đơn, thời gian, khách, tổng tiền, phương thức thanh toán, trạng thái hóa đơn.
- **Dòng đơn bán:** hàng, số lượng, đơn giá, thành tiền, giá vốn tại thời điểm bán (để tính lợi nhuận đúng dù giá vốn đổi sau này).
- **Hóa đơn điện tử:** liên kết đơn bán, mã/số hóa đơn từ nhà cung cấp, trạng thái (chờ gửi, đã gửi, lỗi), nhật ký.

---

## 4. Backend: có hay không?

**Kết luận: cần một backend mỏng cho hóa đơn, chưa cần hệ thống server đầy đủ.**

### 4.1. Vì sao cần chút backend

- Khóa API của nhà cung cấp không được để trong code trình duyệt.
- Nhiều nhà cung cấp chặn gọi trực tiếp từ trình duyệt (CORS) hoặc yêu cầu gọi từ máy chủ.
- Cần nơi xếp hàng gửi lại và ghi nhật ký đối chiếu.

### 4.2. Vì sao chưa đưa toàn bộ dữ liệu lên server

| Local-first (dữ liệu ở máy cửa hàng) | Toàn bộ trên server |
| --- | --- |
| Bán được khi mất mạng, nhanh | Mất mạng là ngừng bán, trừ khi làm thêm cơ chế offline phức tạp |
| Không giữ dữ liệu khách, ít trách nhiệm pháp lý | Phải lo bảo mật, sao lưu, quy định bảo vệ dữ liệu cá nhân |
| Gần như không tốn chi phí vận hành | Tốn hosting, giám sát, vá lỗi, phải trực khi sập |
| Điểm bán hàng: "dữ liệu nằm trong máy bạn" | Dễ làm nhiều thiết bị, nhiều chi nhánh |

### 4.3. Mô hình đề xuất: local-first + backend mỏng

```
[App trên máy cửa hàng]  -- dữ liệu chính lưu ở máy (IndexedDB hoặc SQLite)
        |
        +-- chỉ khi phát hành hóa đơn --> [Backend mỏng] --> [Nhà cung cấp HĐĐT] --> Cơ quan thuế
                                               |
                                               +-- lưu: tài khoản cửa hàng, khóa API, nhật ký hóa đơn
```

Backend mỏng không giữ toàn bộ lịch sử bán hàng và thông tin khách; chỉ giữ dữ liệu tối thiểu để lập hóa đơn và đối chiếu.

### 4.4. Công nghệ gợi ý

- **Frontend:** giữ React + Vite + TypeScript, thêm lớp lưu trữ cục bộ.
- **Backend:** Node + TypeScript (dùng chung kiểu dữ liệu với frontend), chạy serverless (Cloudflare Workers, Vercel Functions) hoặc một VPS nhỏ. Cơ sở dữ liệu nhỏ (SQLite hoặc Postgres gói miễn phí) chỉ để lưu tài khoản và nhật ký hóa đơn.
- **Chưa cần:** microservices, Kubernetes, hàng đợi tin nhắn riêng.

### 4.5. Khi nào mở rộng backend

Chỉ khi có khách thật yêu cầu, làm từng việc một:

1. Sao lưu lên đám mây (tùy chọn). Bắt đầu bằng nút xuất file sao lưu, sau đó mới tự động.
2. Dùng nhiều thiết bị (cần đồng bộ, phần khó nhất vì xung đột dữ liệu).
3. Xem báo cáo từ xa hoặc nhiều chi nhánh.
4. Kiểm tra phiên bản, kích hoạt theo cửa hàng nếu bán thuê bao.

---

## 5. Đóng gói: "bật lên là dùng"

| Hướng | Ưu điểm | Nhược điểm |
| --- | --- | --- |
| **PWA** (mở link, thêm vào màn hình chính) | Không cần cài, chạy trên điện thoại/máy tính bảng, làm nhanh, dễ thử với khách | Khó điều khiển máy in nhiệt, máy quét mã vạch hơn |
| **Ứng dụng cài đặt** (Tauri hoặc Electron) | Nhấp đúp là cài, dữ liệu lưu trong máy (SQLite), dễ cắm máy in và máy quét | Phải đóng gói và phát hành bản cập nhật |

**Đề xuất:** làm PWA trước để thử nhanh với khách thật; nếu họ cần in và quét mã vạch ổn định thì đóng gói Tauri.

Yêu cầu chung cho cả hai:

- **Offline-first:** bán hàng và lưu dữ liệu chạy được khi mất mạng, chỉ gửi hóa đơn mới cần mạng.
- **Sao lưu:** dữ liệu nằm trên một máy, hỏng máy là mất lịch sử bán hàng. Cần nút xuất sao lưu, nhắc định kỳ.
- **Tự host font** và bỏ phụ thuộc tài nguyên bên ngoài.
- Cài đặt tối giản: không cần cấu hình, có dữ liệu mẫu để dùng thử, hướng dẫn 1-2 trang có ảnh.

---

## 6. Lộ trình đề xuất

1. **Nền dữ liệu:** thiết kế lại mô hình dữ liệu và lớp lưu trữ cục bộ. Làm đầu tiên vì mọi thứ khác dựa vào đây.
2. **Kho + POS + khách hàng:** bán được và trừ tồn kho, chưa cần hóa đơn.
3. **Nối báo cáo cũ** vào dữ liệu mới.
4. **Hóa đơn điện tử** qua nhà cung cấp, thử trên môi trường thử trước.
5. **Sao lưu, đóng gói, hướng dẫn**, rồi thử với **một** cửa hàng thật.

**Song song ngay từ đầu:** liên hệ và chọn nhà cung cấp hóa đơn (quyết định cách thiết kế backend).

Đừng làm hóa đơn đầu tiên: nó phụ thuộc vào POS đã chạy chắc và vào nhà cung cấp đã được chọn.

---

## 7. Việc cần xử lý từ dự án hiện tại

Từ tài liệu của dự án hiện có, những điểm nên sửa trước hoặc trong lúc mở rộng:

- Các nghi vấn làm **sai số liệu âm thầm** (ví dụ KPI "Khách VIP" vẫn hiện khi thiếu mã đơn; ghép cột sai với Excel có tiêu đề lệch dòng; giá vốn nhập nhầm tổng thay vì đơn vị). Phần nhập tay từ POS sẽ giảm các lỗi này, nhưng đường nhập từ file vẫn cần sửa.
- Thư viện `xlsx` bản cũ có lỗ hổng đã công bố, cần thay hoặc nâng cấp.
- Google Fonts gọi ra ngoài, cần tự host.
- Chạy lại toàn bộ test giao diện (Playwright), vì tác giả ghi chưa chạy lại và nghi một test sẽ trượt.
- CSS chưa hoàn thiện (mật độ Thoáng/Gọn, cỡ chữ, Tailwind chưa import).
- Quy trình kiểm thử độc lập bằng agent (không sửa code, ghi lỗi vào file `UI-FINDINGS.md`) nên chạy sau mỗi giai đoạn lớn.

---

## 8. Rủi ro cần nghĩ trước

- **Sai tiền hoặc sai tồn kho** gây thiệt hại thật: test kỹ tính tiền, làm tròn VND, thuế suất, giảm giá.
- **Sửa/hủy hóa đơn** có quy trình riêng theo quy định.
- **Hai thiết bị cùng bán** gây lệch dữ liệu: bản đầu nên giới hạn một thiết bị.
- **Phạm vi lan rộng:** POS + kho + hóa đơn là ba sản phẩm lớn. Giữ mỗi phần ở mức tối thiểu; chưa làm công nợ, nhiều chi nhánh, nhân viên và phân quyền cho đến khi khách thật yêu cầu.
- **Pháp lý thay đổi:** quy định mới, cần theo dõi hướng dẫn của cơ quan thuế.
- **Bảo mật khóa API và dữ liệu cá nhân của khách:** giữ tối thiểu dữ liệu ở backend.

---

## 9. Câu hỏi còn mở (cần quyết định)

1. Cửa hàng mục tiêu bán bằng **điện thoại/máy tính bảng** hay **máy tính để bàn**? Đã có **máy in hóa đơn** và **máy quét mã vạch** chưa? (Quyết định chọn PWA hay Tauri.)
2. **Nhà cung cấp hóa đơn điện tử** nào, điều kiện hợp tác và chi phí ra sao?
3. Khách mục tiêu thuộc diện **bắt buộc** hay **tự nguyện** dùng hóa đơn điện tử (liên quan doanh thu năm)?
4. Mô hình kinh doanh: bán một lần hay thuê bao? (Ảnh hưởng đến việc cần cơ chế cấp phép và cập nhật.)
5. Có cần **nhiều thiết bị** ngay từ phiên bản đầu không? (Nếu không, giữ local-first đơn giản.)

---

## 10. Bước tiếp theo

- Chốt các câu hỏi ở mục 9.
- Viết prompt workflow cho agent, chia theo giai đoạn: nền dữ liệu, kho, POS, khách hàng, hóa đơn (kèm backend mỏng), đóng gói.
- Sau mỗi giai đoạn, chạy agent kiểm thử độc lập, rồi chuyển báo cáo lỗi cho agent xây dựng sửa theo từng mã lỗi.
