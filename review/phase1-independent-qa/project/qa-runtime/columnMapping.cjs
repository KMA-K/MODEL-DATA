"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guessColumnMapping = guessColumnMapping;
const COLUMN_KEYWORDS = {
    dateCol: [
        'ngày bán', 'ngay ban', 'ngày', 'ngay', 'ngày tạo', 'ngay tao',
        'thời gian', 'thoi gian', 'ngay_ban', 'order date', 'order_date',
        'date', 'transaction_date', 'created_at', 'invoice_date'
    ],
    productCol: [
        'tên sản phẩm', 'ten san pham', 'tên hàng', 'ten hang',
        'sản phẩm', 'san pham', 'mã sản phẩm', 'ma san pham',
        'mã hàng', 'ma hang', 'mặt hàng', 'mat hang',
        'product name', 'product_name', 'product', 'item name', 'item', 'sku', 'product_id'
    ],
    quantityCol: [
        'số lượng', 'so luong', 'sl', 'số lượng bán', 'so luong ban',
        'quantity', 'qty', 'count', 'amount'
    ],
    revenueCol: [
        'doanh thu', 'doanh_thu', 'thành tiền', 'thanh tien', 'thanh_tien',
        'tổng tiền', 'tong tien', 'tiền bán', 'tien ban',
        'revenue', 'total', 'total_amount', 'line_total', 'subtotal'
    ],
    unitPriceCol: [
        'đơn giá', 'don gia', 'don_gia', 'giá bán', 'gia ban',
        'price', 'unit price', 'unit_price', 'rate'
    ],
    customerIdCol: [
        'mã khách hàng', 'ma khach hang', 'mã kh', 'ma kh',
        'khách hàng', 'khach hang', 'tên khách hàng', 'ten khach hang',
        'customer id', 'customer_id', 'customer', 'customer name', 'client'
    ],
    costPriceCol: [
        'giá vốn', 'gia von', 'gia_von', 'tiền vốn', 'tien von',
        'cost', 'cost price', 'cost_price', 'cogs', 'buying price'
    ],
    orderIdCol: [
        'mã đơn hàng', 'ma don hang', 'mã đơn', 'ma don', 'số đơn', 'so don',
        'mã hóa đơn', 'ma hoa don', 'số hóa đơn', 'so hoa don',
        'order id', 'order_id', 'invoice', 'invoice no', 'invoice_id', 'order'
    ],
    categoryCol: [
        'danh mục', 'danh muc', 'nhóm hàng', 'nhom hang', 'loại hàng', 'loai hang',
        'ngành hàng', 'nganh hang', 'phân loại', 'phan loai',
        'category', 'group', 'type', 'department'
    ]
};
function normalizeText(text) {
    return text
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt để so sánh
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]/g, ' ')
        .replace(/\s+/g, ' ');
}
/**
 * Tự động đoán ghép cột theo tiêu đề file
 */
function guessColumnMapping(headers) {
    const mapping = {
        dateCol: '',
        productCol: '',
        quantityCol: '',
        revenueCol: '',
        unitPriceCol: '',
        customerIdCol: '',
        costPriceCol: '',
        orderIdCol: '',
        categoryCol: ''
    };
    const usedHeaders = new Set();
    const findBestHeader = (keys) => {
        // 1. Khớp chính xác (sau khi chuẩn hóa)
        for (const k of keys) {
            for (const header of headers) {
                if (usedHeaders.has(header) || !header.trim())
                    continue;
                const normH = normalizeText(header);
                const normK = normalizeText(k);
                if (normH === normK) {
                    usedHeaders.add(header);
                    return header;
                }
            }
        }
        // 2. Khớp chuỗi con (substring)
        for (const header of headers) {
            if (usedHeaders.has(header) || !header.trim())
                continue;
            const normH = normalizeText(header);
            for (const k of keys) {
                const normK = normalizeText(k);
                if (normH.includes(normK) || normK.includes(normH)) {
                    usedHeaders.add(header);
                    return header;
                }
            }
        }
        return '';
    };
    // Ưu tiên tìm các cột quan trọng trước
    mapping.dateCol = findBestHeader(COLUMN_KEYWORDS.dateCol);
    mapping.productCol = findBestHeader(COLUMN_KEYWORDS.productCol);
    mapping.quantityCol = findBestHeader(COLUMN_KEYWORDS.quantityCol);
    mapping.revenueCol = findBestHeader(COLUMN_KEYWORDS.revenueCol);
    mapping.unitPriceCol = findBestHeader(COLUMN_KEYWORDS.unitPriceCol);
    mapping.costPriceCol = findBestHeader(COLUMN_KEYWORDS.costPriceCol);
    mapping.customerIdCol = findBestHeader(COLUMN_KEYWORDS.customerIdCol);
    mapping.orderIdCol = findBestHeader(COLUMN_KEYWORDS.orderIdCol);
    mapping.categoryCol = findBestHeader(COLUMN_KEYWORDS.categoryCol);
    return mapping;
}
