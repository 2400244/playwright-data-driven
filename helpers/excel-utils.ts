import * as fs from 'fs';
import * as path from 'path';

/**
 * ExcelUtils migration to TypeScript.
 * 
 * MIGRATION NOTE: This helper has been converted to use JSON files instead of Excel.
 * Reasons:
 * 1. Playwright tests work best with static, version-controlled test data
 * 2. JSON is more portable and doesn't require external dependencies
 * 3. Excel parsing in Node.js (xlsx package) adds complexity and maintenance burden
 * 
 * RECOMMENDED APPROACH:
 * Convert testdata.xlsx to testdata.json and use test.each() for data-driven tests:
 * 
 * const testData = JSON.parse(fs.readFileSync('testdata.json', 'utf-8'));
 * test.describe('Data-driven tests', () => {
 *   for (const data of testData) {
 *     test(`test with ${data.name}`, async ({ page }) => {
 *       // use data.username, data.password, etc.
 *     });
 *   }
 * });
 * 
 * If Excel is absolutely required, install: npm install xlsx
 * and uncomment the Excel implementation at the bottom of this file.
 */

export class ExcelUtils {
  private static readonly testDataFileName = 'testdata.json';
  private static readonly currentDir = process.cwd();
  private static readonly resourcePath = '/tests/resources/';
  private static testDataPath: string;
  private static data: any[][] = [];
  private static currentSheetName: string = '';

  /**
   * Load test data from JSON file.
   * Expected JSON format:
   * {
   *   "SheetName": [
   *     ["header1", "header2", "header3"],
   *     ["value1", "value2", "value3"],
   *     ["value4", "value5", "value6"]
   *   ]
   * }
   */
  static setDataFileSheet(sheetName: string): void {
    this.testDataPath = path.join(this.currentDir, this.resourcePath, this.testDataFileName);
    this.currentSheetName = sheetName;
    
    try {
      const fileContent = fs.readFileSync(this.testDataPath, 'utf-8');
      const jsonData = JSON.parse(fileContent);
      
      if (!jsonData[sheetName]) {
        throw new Error(`Sheet "${sheetName}" not found in ${this.testDataFileName}`);
      }
      
      this.data = jsonData[sheetName];
    } catch (error) {
      console.error(`Failed to load test data from ${this.testDataPath}:`, error);
      throw error;
    }
  }

  /**
   * Get cell data at specified row and column.
   * @param rowNum - Zero-based row index
   * @param colNum - Zero-based column index
   */
  static getCellData(rowNum: number, colNum: number): string {
    if (!this.data || this.data.length === 0) {
      throw new Error('No data loaded. Call setDataFileSheet() first.');
    }
    
    if (rowNum < 0 || rowNum >= this.data.length) {
      throw new Error(`Row ${rowNum} out of bounds. Available rows: 0-${this.data.length - 1}`);
    }
    
    const row = this.data[rowNum];
    if (colNum < 0 || colNum >= row.length) {
      throw new Error(`Column ${colNum} out of bounds in row ${rowNum}. Available columns: 0-${row.length - 1}`);
    }
    
    const value = row[colNum];
    return value !== null && value !== undefined ? String(value) : '';
  }

  /**
   * Get total number of rows (including header).
   */
  static getRowCount(): number {
    return this.data ? this.data.length : 0;
  }

  /**
   * Get entire row data.
   * @param rowNum - Zero-based row index
   */
  static getRowData(rowNum: number): any[] {
    if (!this.data || rowNum < 0 || rowNum >= this.data.length) {
      throw new Error(`Invalid row number: ${rowNum}`);
    }
    return this.data[rowNum];
  }

  /**
   * Set cell value (writes back to JSON file).
   * WARNING: Modifying test data files during test execution is generally not recommended.
   * Consider using in-memory data structures instead.
   */
  static setCellData(value: string, rowNum: number, colNum: number): void {
    if (!this.data || rowNum < 0 || rowNum >= this.data.length) {
      throw new Error(`Invalid row number: ${rowNum}`);
    }
    
    const row = this.data[rowNum];
    if (colNum < 0) {
      throw new Error(`Invalid column number: ${colNum}`);
    }
    
    // Extend row if needed
    while (row.length <= colNum) {
      row.push('');
    }
    
    row[colNum] = value;
    
    // Write back to file
    try {
      const fileContent = fs.readFileSync(this.testDataPath, 'utf-8');
      const jsonData = JSON.parse(fileContent);
      
      // Update the specific sheet using the stored sheet name
      if (this.currentSheetName && jsonData[this.currentSheetName]) {
        jsonData[this.currentSheetName] = this.data;
      }
      
      fs.writeFileSync(this.testDataPath, JSON.stringify(jsonData, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to write test data:', error);
      throw error;
    }
  }

  /**
   * Helper method to convert data to object array for use with test.each().
   * Assumes first row contains headers.
   */
  static getDataAsObjects(): Record<string, string>[] {
    if (!this.data || this.data.length < 2) {
      return [];
    }
    
    const headers = this.data[0].map(h => String(h));
    const results: Record<string, string>[] = [];
    
    for (let i = 1; i < this.data.length; i++) {
      const obj: Record<string, string> = {};
      const row = this.data[i];
      
      headers.forEach((header, index) => {
        obj[header] = row[index] !== null && row[index] !== undefined ? String(row[index]) : '';
      });
      
      results.push(obj);
    }
    
    return results;
  }
}

/**
 * ALTERNATIVE IMPLEMENTATION USING XLSX (Excel files)
 * 
 * To use this, install: npm install xlsx @types/xlsx
 * Then uncomment the code below and comment out the JSON implementation above.
 */

/*
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

export class ExcelUtils {
  private static readonly testDataExcelFileName = '../test-data/testdata.xlsx';
  private static readonly currentDir = process.cwd();
  private static readonly resourcePath = '/tests/resources/';
  private static testDataExcelPath: string;
  private static workbook: XLSX.WorkBook;
  private static worksheet: XLSX.WorkSheet;
  private static sheetName: string;

  static setExcelFileSheet(sheetName: string): void {
    this.testDataExcelPath = path.join(this.currentDir, this.resourcePath);
    const filePath = path.join(this.testDataExcelPath, this.testDataExcelFileName);
    
    this.workbook = XLSX.readFile(filePath);
    this.sheetName = sheetName;
    this.worksheet = this.workbook.Sheets[sheetName];
    
    if (!this.worksheet) {
      throw new Error(`Sheet "${sheetName}" not found in ${this.testDataExcelFileName}`);
    }
  }

  static getCellData(rowNum: number, colNum: number): string {
    const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
    const cell = this.worksheet[cellAddress];
    return cell ? XLSX.utils.format_cell(cell) : '';
  }

  static getRowCount(): number {
    const range = XLSX.utils.decode_range(this.worksheet['!ref'] || 'A1');
    return range.e.r + 1;
  }

  static getRowData(rowNum: number): any[] {
    const range = XLSX.utils.decode_range(this.worksheet['!ref'] || 'A1');
    const row: any[] = [];
    
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: col });
      const cell = this.worksheet[cellAddress];
      row.push(cell ? XLSX.utils.format_cell(cell) : '');
    }
    
    return row;
  }

  static setCellData(value: string, rowNum: number, colNum: number): void {
    const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
    this.worksheet[cellAddress] = { t: 's', v: value };
    
    XLSX.writeFile(this.workbook, path.join(this.testDataExcelPath, this.testDataExcelFileName));
  }

  static getDataAsObjects(): Record<string, string>[] {
    return XLSX.utils.sheet_to_json(this.worksheet, { header: 1 }).slice(1).map((row: any) => {
      const obj: Record<string, string> = {};
      const headers = XLSX.utils.sheet_to_json(this.worksheet, { header: 1 })[0] as string[];
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  }
}
*/