"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guessColumnMapping = void 0;
exports.parseCsvFile = parseCsvFile;
exports.parseXlsxFile = parseXlsxFile;
exports.parseSalesFile = parseSalesFile;
// src/core/parser.ts
const papaparse_1 = __importDefault(require("papaparse"));
const XLSX = __importStar(require("xlsx"));
// Danh sách từ khóa phỏng đoán cột phổ biến (tiếng Việt không dấu/có dấu, tiếng Anh)
var columnMapping_1 = require("./columnMapping.cjs");
Object.defineProperty(exports, "guessColumnMapping", { enumerable: true, get: function () { return columnMapping_1.guessColumnMapping; } });
/**
 * Đọc file CSV bằng PapaParse
 */
async function parseCsvFile(file) {
    const csvText = await file.text();
    return new Promise((resolve, reject) => {
        papaparse_1.default.parse(csvText, {
            header: true,
            skipEmptyLines: 'greedy',
            transformHeader: (header) => header.trim(),
            complete: (results) => {
                const malformed = results.errors.find(error => error.type === 'FieldMismatch' || error.type === 'Quotes');
                if (malformed)
                    return reject(new Error(`CSV có cấu trúc không hợp lệ ở bản ghi ${(malformed.row ?? 0) + 1}: ${malformed.message}`));
                if (!results.data || results.data.length === 0) {
                    return reject(new Error('File CSV không có dữ liệu hoặc rỗng.'));
                }
                const headers = results.meta.fields || Object.keys(results.data[0] || {});
                resolve({
                    headers,
                    previewRows: results.data.slice(0, 10),
                    allRows: results.data,
                    totalRows: results.data.length,
                    fileName: file.name,
                    fileSizeBytes: file.size
                });
            },
            error: (error) => {
                reject(new Error(`Lỗi khi đọc file CSV: ${error.message}`));
            }
        });
    });
}
/**
 * Đọc file Excel (.xlsx, .xls) bằng SheetJS
 */
async function parseXlsxFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
        throw new Error('File Excel không có bất kỳ trang tính (Sheet) nào.');
    }
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        raw: true,
        dateNF: 'yyyy-mm-dd'
    });
    if (!jsonData || jsonData.length === 0) {
        throw new Error('Trang tính Excel không chứa dòng dữ liệu nào.');
    }
    const headers = Object.keys(jsonData[0]);
    return {
        headers,
        previewRows: jsonData.slice(0, 10),
        allRows: jsonData,
        totalRows: jsonData.length,
        fileName: file.name,
        fileSizeBytes: file.size
    };
}
/**
 * Hàm điều phối đọc file tự động theo định dạng đuôi
 */
async function parseSalesFile(file) {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.csv')) {
        return parseCsvFile(file);
    }
    else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        return parseXlsxFile(file);
    }
    else {
        throw new Error('Định dạng file không được hỗ trợ. Vui lòng chọn file .csv hoặc .xlsx.');
    }
}
