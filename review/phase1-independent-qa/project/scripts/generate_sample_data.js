import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 50 sản phẩm bán lẻ thực tế (Tên, Danh mục, Đơn giá bán VND, Giá vốn ước tính VND)
const PRODUCTS = [
  // Đồ uống & Cà phê
  { id: 'SP001', name: 'Cà phê rang xay Robusta Đắk Lắk 500g', category: 'Đồ uống', price: 115000, cost: 72000 },
  { id: 'SP002', name: 'Trà ô long túi lọc Tam Đường 100g', category: 'Đồ uống', price: 48000, cost: 28000 },
  { id: 'SP003', name: 'Sữa tươi tiệt trùng ít đường 1L', category: 'Đồ uống', price: 36000, cost: 27000 },
  { id: 'SP004', name: 'Nước ngọt Coca-Cola lon 320ml', category: 'Đồ uống', price: 10500, cost: 7800 },
  { id: 'SP005', name: 'Nước khoáng thiên nhiên Lavie 500ml', category: 'Đồ uống', price: 6000, cost: 3800 },
  { id: 'SP006', name: 'Bia Heineken lon 330ml', category: 'Đồ uống', price: 21500, cost: 17200 },
  { id: 'SP007', name: 'Nước tăng lực Red Bull 250ml', category: 'Đồ uống', price: 14000, cost: 10200 },
  { id: 'SP008', name: 'Trà chanh Nestea hộp 18 gói', category: 'Đồ uống', price: 38000, cost: 25000 },

  // Bánh kẹo & Ăn vặt
  { id: 'SP009', name: 'Bánh ChocoPie Orion hộp 12 cái', category: 'Bánh kẹo', price: 54000, cost: 39000 },
  { id: 'SP010', name: 'Bánh quy bơ Danisa 454g', category: 'Bánh kẹo', price: 145000, cost: 110000 },
  { id: 'SP011', name: 'Snack khoai tây Lay\'s vị tự nhiên 95g', category: 'Bánh kẹo', price: 22000, cost: 15500 },
  { id: 'SP012', name: 'Hạt điều rang muối Bình Phước 500g', category: 'Bánh kẹo', price: 165000, cost: 118000 },
  { id: 'SP013', name: 'Kẹo dẻo gấu Haribo 80g', category: 'Bánh kẹo', price: 28000, cost: 18000 },
  { id: 'SP014', name: 'Bánh gạo One One vị ngọt dịu 150g', category: 'Bánh kẹo', price: 24000, cost: 17000 },
  { id: 'SP015', name: 'Rong biển sấy giòn Tao Kae Noi 32g', category: 'Bánh kẹo', price: 29000, cost: 20000 },
  { id: 'SP016', name: 'Bánh mì sandwich bơ sữa Kinh Đô 250g', category: 'Bánh kẹo', price: 20000, cost: 14000 },

  // Thực phẩm & Gia vị
  { id: 'SP017', name: 'Mì Hảo Hảo tôm chua cay thùng 30 gói', category: 'Thực phẩm khô', price: 125000, cost: 105000 },
  { id: 'SP018', name: 'Gạo ST25 Ông Cua túi 5kg', category: 'Thực phẩm khô', price: 195000, cost: 158000 },
  { id: 'SP019', name: 'Dầu ăn Neptune Gold chai 1L', category: 'Gia vị & Chế biến', price: 56000, cost: 44000 },
  { id: 'SP020', name: 'Nước mắm Nam Ngư Đệ Nhị 900ml', category: 'Gia vị & Chế biến', price: 34000, cost: 25000 },
  { id: 'SP021', name: 'Hạt nêm Knorr thịt thăn 900g', category: 'Gia vị & Chế biến', price: 82000, cost: 63000 },
  { id: 'SP022', name: 'Tương ớt Chinsu chai 250g', category: 'Gia vị & Chế biến', price: 15000, cost: 10500 },
  { id: 'SP023', name: 'Đường tinh luyện Biên Hòa 1kg', category: 'Gia vị & Chế biến', price: 28000, cost: 22000 },
  { id: 'SP024', name: 'Mì Spaghetti Barilla 500g', category: 'Thực phẩm khô', price: 46000, cost: 32000 },
  { id: 'SP025', name: 'Xúc xích tiệt trùng Vissan gói 5 cây', category: 'Thực phẩm khô', price: 23000, cost: 16500 },
  { id: 'SP026', name: 'Sữa đặc Ông Thọ nắp bật lon 380g', category: 'Gia vị & Chế biến', price: 26000, cost: 19500 },

  // Hóa mỹ phẩm & Chăm sóc cá nhân
  { id: 'SP027', name: 'Dầu gội Clear Men mát lạnh 650g', category: 'Chăm sóc cá nhân', price: 185000, cost: 142000 },
  { id: 'SP028', name: 'Dầu gội Sunsilk mềm mượt diệu kỳ 650g', category: 'Chăm sóc cá nhân', price: 155000, cost: 118000 },
  { id: 'SP029', name: 'Sữa tắm Lifebuoy bảo vệ vượt trội 850g', category: 'Chăm sóc cá nhân', price: 172000, cost: 129000 },
  { id: 'SP030', name: 'Kem đánh răng Colgate Total 150g', category: 'Chăm sóc cá nhân', price: 45000, cost: 31000 },
  { id: 'SP031', name: 'Bàn chải đánh răng P/S than tre', category: 'Chăm sóc cá nhân', price: 26000, cost: 16000 },
  { id: 'SP032', name: 'Khăn ướt Caryn không cồn 100 tờ', category: 'Chăm sóc cá nhân', price: 39000, cost: 26000 },
  { id: 'SP033', name: 'Dao cạo râu Gillette Vector 1 cán 2 lưỡi', category: 'Chăm sóc cá nhân', price: 68000, cost: 48000 },

  // Vệ sinh & Đồ dùng gia đình
  { id: 'SP034', name: 'Nước giặt OMO Matic cửa trên túi 3.6kg', category: 'Gia dụng & Tẩy rửa', price: 215000, cost: 168000 },
  { id: 'SP035', name: 'Nước xả vải Comfort đậm đặc túi 3.2L', category: 'Gia dụng & Tẩy rửa', price: 198000, cost: 152000 },
  { id: 'SP036', name: 'Nước rửa chén Sunlight chanh can 3.6kg', category: 'Gia dụng & Tẩy rửa', price: 112000, cost: 84000 },
  { id: 'SP037', name: 'Nước lau sàn Sunlight hương hoa hạ 3.6kg', category: 'Gia dụng & Tẩy rửa', price: 92000, cost: 68000 },
  { id: 'SP038', name: 'Giấy vệ sinh cuộn Pulppy lốc 10 cuộn', category: 'Gia dụng & Tẩy rửa', price: 95000, cost: 71000 },
  { id: 'SP039', name: 'Khăn giấy lụa Paseo 3 lớp hộp 130 tờ', category: 'Gia dụng & Tẩy rửa', price: 27000, cost: 18500 },
  { id: 'SP040', name: 'Túi rác tự phân hủy sinh học Opec 1kg', category: 'Gia dụng & Tẩy rửa', price: 42000, cost: 28000 },
  { id: 'SP041', name: 'Màng bọc thực phẩm Ringo 30cm x 150m', category: 'Gia dụng & Tẩy rửa', price: 65000, cost: 45000 },

  // Mặt hàng bán chậm / Biên lợi nhuận thấp (nhóm C)
  { id: 'SP042', name: 'Bút bi Thiên Long 0.5mm hộp 20 cây', category: 'Văn phòng phẩm', price: 75000, cost: 58000 },
  { id: 'SP043', name: 'Sổ tay bìa da A5 cao cấp', category: 'Văn phòng phẩm', price: 62000, cost: 49000 },
  { id: 'SP044', name: 'Ghim bấm số 10 Deli hộp 1000 kim', category: 'Văn phòng phẩm', price: 8000, cost: 6000 },
  { id: 'SP045', name: 'Pin tiểu AA Energizer vỉ 2 viên', category: 'Đồ gia dụng', price: 42000, cost: 32000 },
  { id: 'SP046', name: 'Băng keo trong 5cm x 100 yard', category: 'Văn phòng phẩm', price: 21000, cost: 15500 },
  { id: 'SP047', name: 'Kéo cắt giấy học sinh deli', category: 'Văn phòng phẩm', price: 16000, cost: 11500 },
  { id: 'SP048', name: 'Bật lửa gas BIC mini', category: 'Đồ gia dụng', price: 12000, cost: 8500 },
  { id: 'SP049', name: 'Hộp quẹt diêm Thống Nhất lốc 10 bao', category: 'Đồ gia dụng', price: 15000, cost: 11000 },
  { id: 'SP050', name: 'Ổ cắm điện đa năng Comet 3 chấu dây 3m', category: 'Đồ gia dụng', price: 135000, cost: 102000 }
];

// Tạo 300 khách hàng mẫu
const CUSTOMERS = [];
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
const LOT = ['Văn', 'Thị', 'Đức', 'Thanh', 'Hữu', 'Minh', 'Ngọc', 'Hải', 'Quang', 'Xuân', 'Kim', 'Bảo'];
const TEN = ['An', 'Bình', 'Cường', 'Dung', 'Giang', 'Hà', 'Hương', 'Hùng', 'Khanh', 'Linh', 'Long', 'Mai', 'Nam', 'Nga', 'Phong', 'Quân', 'Sơn', 'Tâm', 'Thảo', 'Tuấn', 'Vinh', 'Yến'];

for (let i = 1; i <= 300; i++) {
  const h = HO[i % HO.length];
  const l = LOT[(i * 3) % LOT.length];
  const t = TEN[(i * 7) % TEN.length];
  CUSTOMERS.push({
    id: `KH${String(i).padStart(3, '0')}`,
    name: `${h} ${l} ${t}`,
    // Tỉ trọng: 10% VIP, 20% Trung thành, 40% Bình thường, 30% Thỉnh thoảng/Sắp rời
    tier: i <= 30 ? 'VIP' : (i <= 90 ? 'LOYAL' : (i <= 210 ? 'REGULAR' : 'OCCASIONAL'))
  });
}

// Cặp sản phẩm hay mua cùng nhau (Co-occurrence)
const FREQUENT_PAIRS = [
  ['SP001', 'SP026'], // Cà phê + Sữa đặc Ông Thọ
  ['SP017', 'SP025'], // Mì Hảo Hảo + Xúc xích Vissan
  ['SP034', 'SP035'], // Nước giặt OMO + Nước xả Comfort
  ['SP030', 'SP031'], // Kem đánh răng + Bàn chải
  ['SP004', 'SP011'], // Coca-Cola + Snack khoai tây
  ['SP019', 'SP021']  // Dầu ăn + Hạt nêm Knorr
];

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function generateSampleData(targetRows = 5200) {
  const rows = [];
  const startDate = new Date('2025-10-01');
  const endDate = new Date('2026-09-30'); // 12 tháng

  let orderCounter = 10001;

  // Đảm bảo toàn bộ 300 khách hàng đều có ít nhất 1 giao dịch xuất hiện
  for (const customer of CUSTOMERS) {
    const orderId = `DH-${orderCounter++}`;
    const custNum = parseInt(customer.id.replace('KH', ''), 10);
    let orderDate;
    if (custNum > 240) {
      const earlyEnd = new Date('2026-05-01');
      orderDate = formatDate(new Date(startDate.getTime() + Math.random() * (earlyEnd.getTime() - startDate.getTime())));
    } else {
      orderDate = formatDate(new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())));
    }
    const prod = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const qty = Math.floor(Math.random() * 2) + 1;
    rows.push({
      'Mã đơn hàng': orderId,
      'Ngày bán': orderDate,
      'Mã khách hàng': customer.id,
      'Tên khách hàng': customer.name,
      'Mã sản phẩm': prod.id,
      'Tên sản phẩm': prod.name,
      'Danh mục': prod.category,
      'Số lượng': qty,
      'Đơn giá': prod.price,
      'Giá vốn': prod.cost,
      'Doanh thu': qty * prod.price
    });
  }

  while (rows.length < targetRows - 150) {
    const orderId = `DH-${orderCounter++}`;
    
    // Chọn khách hàng
    const randCust = Math.random();
    let customer;
    if (randCust < 0.45) {
      // 45% giao dịch thuộc top 30 khách VIP
      customer = CUSTOMERS[Math.floor(Math.random() * 30)];
    } else if (randCust < 0.75) {
      // 30% giao dịch thuộc top 31-90
      customer = CUSTOMERS[30 + Math.floor(Math.random() * 60)];
    } else {
      // 25% giao dịch thuộc nhóm còn lại
      customer = CUSTOMERS[90 + Math.floor(Math.random() * 210)];
    }

    // Thời điểm đơn hàng
    // Nếu là nhóm sắp rời đi (KH250 - KH300), các giao dịch chỉ diễn ra trong 6 tháng đầu
    let orderDate;
    const custNum = parseInt(customer.id.replace('KH', ''), 10);
    if (custNum > 240) {
      // Churned / At risk khách: mua trước 2026-05-01
      const earlyEnd = new Date('2026-05-01');
      orderDate = formatDate(new Date(startDate.getTime() + Math.random() * (earlyEnd.getTime() - startDate.getTime())));
    } else {
      orderDate = formatDate(new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())));
    }

    // Đơn hàng có từ 1 đến 4 món
    const itemsInOrder = Math.floor(Math.random() * 3) + 1;
    
    // Thỉnh thoảng kích hoạt cặp mua cùng nhau
    let addedPair = false;
    if (Math.random() < 0.35) {
      const pair = FREQUENT_PAIRS[Math.floor(Math.random() * FREQUENT_PAIRS.length)];
      const p1 = PRODUCTS.find(p => p.id === pair[0]);
      const p2 = PRODUCTS.find(p => p.id === pair[1]);
      if (p1 && p2) {
        const q1 = Math.floor(Math.random() * 3) + 1;
        const q2 = Math.floor(Math.random() * 2) + 1;
        rows.push({
          'Mã đơn hàng': orderId,
          'Ngày bán': orderDate,
          'Mã khách hàng': customer.id,
          'Tên khách hàng': customer.name,
          'Mã sản phẩm': p1.id,
          'Tên sản phẩm': p1.name,
          'Danh mục': p1.category,
          'Số lượng': q1,
          'Đơn giá': p1.price,
          'Giá vốn': p1.cost,
          'Doanh thu': q1 * p1.price
        });
        rows.push({
          'Mã đơn hàng': orderId,
          'Ngày bán': orderDate,
          'Mã khách hàng': customer.id,
          'Tên khách hàng': customer.name,
          'Mã sản phẩm': p2.id,
          'Tên sản phẩm': p2.name,
          'Danh mục': p2.category,
          'Số lượng': q2,
          'Đơn giá': p2.price,
          'Giá vốn': p2.cost,
          'Doanh thu': q2 * p2.price
        });
        addedPair = true;
      }
    }

    if (!addedPair) {
      for (let k = 0; k < itemsInOrder; k++) {
        // Trọng số chọn sản phẩm: SP001 - SP020 chiếm nhiều lượng bán (nhóm A)
        let prod;
        const randP = Math.random();
        if (randP < 0.65) {
          prod = PRODUCTS[Math.floor(Math.random() * 18)]; // Nhóm hot
        } else if (randP < 0.90) {
          prod = PRODUCTS[18 + Math.floor(Math.random() * 22)]; // Nhóm trung bình B
        } else {
          prod = PRODUCTS[40 + Math.floor(Math.random() * 10)]; // Nhóm chậm C
        }

        const qty = Math.floor(Math.random() * 4) + 1;
        rows.push({
          'Mã đơn hàng': orderId,
          'Ngày bán': orderDate,
          'Mã khách hàng': customer.id,
          'Tên khách hàng': customer.name,
          'Mã sản phẩm': prod.id,
          'Tên sản phẩm': prod.name,
          'Danh mục': prod.category,
          'Số lượng': qty,
          'Đơn giá': prod.price,
          'Giá vốn': prod.cost,
          'Doanh thu': qty * prod.price
        });
      }
    }
  }

  // --- CỐ Ý TẠO CÁC DÒNG LỖI ĐỂ KIỂM THỬ TÍNH NĂNG LÀM SẠCH (DATA CLEANER) ---
  console.log(`Đang thêm các dòng lỗi kiểm thử...`);
  
  // 1. Dòng trùng lặp hoàn toàn (Duplicates - 30 dòng)
  for (let d = 0; d < 30; d++) {
    const originalRow = rows[d * 10];
    rows.push({ ...originalRow });
  }

  // 2. Dòng thiếu ngày bán (Missing Date - 15 dòng)
  for (let m = 0; m < 15; m++) {
    const prod = PRODUCTS[m % PRODUCTS.length];
    rows.push({
      'Mã đơn hàng': `DH-ERR-DATE-${m}`,
      'Ngày bán': '', // Trống ngày
      'Mã khách hàng': 'KH005',
      'Tên khách hàng': 'Trần Thị Hà',
      'Mã sản phẩm': prod.id,
      'Tên sản phẩm': prod.name,
      'Danh mục': prod.category,
      'Số lượng': 2,
      'Đơn giá': prod.price,
      'Giá vốn': prod.cost,
      'Doanh thu': 2 * prod.price
    });
  }

  // 3. Dòng có số lượng âm hoặc doanh thu âm (Negative numbers - 15 dòng)
  for (let n = 0; n < 15; n++) {
    const prod = PRODUCTS[n % PRODUCTS.length];
    rows.push({
      'Mã đơn hàng': `DH-ERR-NEG-${n}`,
      'Ngày bán': '2026-03-15',
      'Mã khách hàng': 'KH012',
      'Tên khách hàng': 'Lê Đức Minh',
      'Mã sản phẩm': prod.id,
      'Tên sản phẩm': prod.name,
      'Danh mục': prod.category,
      'Số lượng': -3, // Số âm
      'Đơn giá': prod.price,
      'Giá vốn': prod.cost,
      'Doanh thu': -3 * prod.price // Doanh thu âm
    });
  }

  // 4. Dòng số lượng = 0 hoặc doanh thu = 0 (Zero quantity - 10 dòng)
  for (let z = 0; z < 10; z++) {
    const prod = PRODUCTS[z % PRODUCTS.length];
    rows.push({
      'Mã đơn hàng': `DH-ERR-ZERO-${z}`,
      'Ngày bán': '2026-04-20',
      'Mã khách hàng': 'KH020',
      'Tên khách hàng': 'Phạm Hải Nam',
      'Mã sản phẩm': prod.id,
      'Tên sản phẩm': prod.name,
      'Danh mục': prod.category,
      'Số lượng': 0, // Bằng 0
      'Đơn giá': prod.price,
      'Giá vốn': prod.cost,
      'Doanh thu': 0
    });
  }

  // 5. Dòng thiếu tên/mã sản phẩm (10 dòng)
  for (let p = 0; p < 10; p++) {
    rows.push({
      'Mã đơn hàng': `DH-ERR-PROD-${p}`,
      'Ngày bán': '2026-05-10',
      'Mã khách hàng': 'KH033',
      'Tên khách hàng': 'Hoàng Quang Sơn',
      'Mã sản phẩm': '',
      'Tên sản phẩm': '',
      'Danh mục': 'Khác',
      'Số lượng': 1,
      'Đơn giá': 50000,
      'Giá vốn': 35000,
      'Doanh thu': 50000
    });
  }

  console.log(`Tổng cộng tạo ra ${rows.length} dòng dữ liệu mẫu (đã bao gồm các dòng lỗi có chủ ý).`);
  return rows;
}

// Chạy trực tiếp nếu là file chính
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rows = generateSampleData(5100);

  const outDir = path.resolve(__dirname, '../public/sample-data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Xuất file CSV
  const headers = Object.keys(rows[0]);
  const csvLines = [headers.join(',')];
  for (const r of rows) {
    const line = headers.map(h => {
      let val = r[h] !== undefined && r[h] !== null ? String(r[h]) : '';
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
    csvLines.push(line);
  }
  const csvPath = path.join(outDir, 'du_lieu_ban_hang_mau.csv');
  fs.writeFileSync(csvPath, '\uFEFF' + csvLines.join('\n'), 'utf8'); // BOM for Excel UTF-8
  console.log(`Đã xuất CSV: ${csvPath}`);

  // Xuất file XLSX
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'BanHang2025_2026');
  const xlsxPath = path.join(outDir, 'du_lieu_ban_hang_mau.xlsx');
  XLSX.writeFile(workbook, xlsxPath);
  console.log(`Đã xuất XLSX: ${xlsxPath}`);
}
