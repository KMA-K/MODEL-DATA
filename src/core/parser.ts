// src/core/parser.ts
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ParseResult } from './types';

// Danh sách từ khóa phỏng đoán cột phổ biến (tiếng Việt không dấu/có dấu, tiếng Anh)
export { guessColumnMapping } from './columnMapping';

/**
 * Đọc file CSV bằng PapaParse
 */
export async function parseCsvFile(file: File): Promise<ParseResult> {
  const csvText = await file.text();
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(csvText, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const malformed = results.errors.find(error => error.type === 'FieldMismatch' || error.type === 'Quotes');
        if (malformed) return reject(new Error(`CSV có cấu trúc không hợp lệ ở bản ghi ${(malformed.row ?? 0) + 1}: ${malformed.message}`));
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
      error: (error: Error) => {
        reject(new Error(`Lỗi khi đọc file CSV: ${error.message}`));
      }
    });
  });
}

/**
 * Đọc file Excel (.xlsx, .xls) bằng SheetJS
 */
export async function parseXlsxFile(file: File): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('File Excel không có bất kỳ trang tính (Sheet) nào.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
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
export async function parseSalesFile(file: File): Promise<ParseResult> {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.csv')) {
    return parseCsvFile(file);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseXlsxFile(file);
  } else {
    throw new Error('Định dạng file không được hỗ trợ. Vui lòng chọn file .csv hoặc .xlsx.');
  }
}
