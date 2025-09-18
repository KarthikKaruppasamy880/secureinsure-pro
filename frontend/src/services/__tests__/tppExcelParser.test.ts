import { TPPExcelParser } from '../tppExcelParser';
import { InsuranceField } from '../excelToJson';

// Mock XLSX library
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn()
  }
}));

describe('TPPExcelParser', () => {
  let parser: TPPExcelParser;

  beforeEach(() => {
    parser = new TPPExcelParser();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('parseExcelFile', () => {
    it('should parse Excel file and return configuration', async () => {
      // Mock fetch response
      const mockArrayBuffer = new ArrayBuffer(8);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockArrayBuffer)
      });

      // Mock XLSX
      const XLSX = require('xlsx');
      XLSX.read.mockReturnValue({
        Sheets: {
          'Case Setup': {},
          'Insured': {}
        }
      });
      XLSX.utils.sheet_to_json.mockReturnValue([
        ['Field Level-1', 'Type', 'Mandatory'],
        ['Case ID', 'text', 'Yes'],
        ['Product Type', 'select', 'Yes']
      ]);

      const result = await parser.parseExcelFile('path/to/file.xlsx');

      expect(result).toHaveProperty('sheets');
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty('generatedAt');
      expect(result).toHaveProperty('sourceFile');
    });

    it('should handle Excel file not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      const result = await parser.parseExcelFile('path/to/file.xlsx');

      expect(result).toHaveProperty('sheets');
      expect(Object.keys(result.sheets)).toHaveLength(9); // Should return default configuration
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await parser.parseExcelFile('path/to/file.xlsx');

      expect(result).toHaveProperty('sheets');
      expect(result.sourceFile).toBe('Default Configuration');
    });
  });

  describe('field validation', () => {
    it('should create valid field structure', () => {
      const field = parser['createDefaultField']('Test Field', 'text', true, 'Case Setup');

      expect(field).toMatchObject({
        fieldName: 'Test Field',
        fieldLevel1: 'Case Setup',
        fieldLevel2: 'General',
        type: 'text',
        mandatory: true,
        validations: expect.arrayContaining(['required']),
        sheet: 'Case Setup'
      });
    });

    it('should determine correct field types', () => {
      expect(parser.determineFieldType('Email Address', 'Personal')).toBe('email');
      expect(parser.determineFieldType('Phone Number', 'Personal')).toBe('tel');
      expect(parser.determineFieldType('Date of Birth', 'Personal')).toBe('date');
      expect(parser.determineFieldType('Premium Amount', 'Personal')).toBe('number');
      expect(parser.determineFieldType('Gender', 'Personal')).toBe('select');
      expect(parser.determineFieldType('Comments', 'Personal')).toBe('textarea');
      expect(parser.determineFieldType('Agree to Terms', 'Personal')).toBe('checkbox');
    });

    it('should determine mandatory fields correctly', () => {
      expect(parser.isRequiredField('First Name')).toBe(true);
      expect(parser.isRequiredField('Last Name')).toBe(true);
      expect(parser.isRequiredField('Date of Birth')).toBe(true);
      expect(parser.isRequiredField('SSN')).toBe(true);
      expect(parser.isRequiredField('Comments')).toBe(false);
    });

    it('should generate proper validations', () => {
      const emailValidations = parser.extractValidation('email', 'Email Address');
      expect(emailValidations).toContain('required');
      expect(emailValidations).toContain('email_format');

      const phoneValidations = parser.extractValidation('tel', 'Phone Number');
      expect(phoneValidations).toContain('required');
      expect(phoneValidations).toContain('phone_format');

      const numberValidations = parser.extractValidation('number', 'Premium Amount');
      expect(numberValidations).toContain('required');
      expect(numberValidations).toContain('numeric');
      expect(numberValidations).toContain('min:0');
    });
  });

  describe('default configuration', () => {
    it('should generate default configuration with all required sheets', () => {
      const config = parser['getDefaultConfiguration']();

      const expectedSheets = [
        'Case Setup',
        'Insured',
        'Benefit and Riders',
        'Beneficiary',
        'Owner',
        'Payor',
        'Secondary Address',
        'Life Insurance History',
        'Premium Mood'
      ];

      expectedSheets.forEach(sheetName => {
        expect(config.sheets).toHaveProperty(sheetName);
        expect(config.sheets[sheetName].fields).toBeInstanceOf(Array);
        expect(config.sheets[sheetName].fields.length).toBeGreaterThan(0);
      });
    });

    it('should have proper metadata for each sheet', () => {
      const config = parser['getDefaultConfiguration']();

      Object.values(config.sheets).forEach(sheet => {
        expect(sheet.metadata).toMatchObject({
          totalFields: expect.any(Number),
          mandatoryFields: expect.any(Number),
          optionalFields: expect.any(Number)
        });
        expect(sheet.metadata.totalFields).toBe(
          sheet.metadata.mandatoryFields + sheet.metadata.optionalFields
        );
      });
    });
  });

  describe('text processing', () => {
    it('should clean field names properly', () => {
      expect(parser['cleanFieldName']('1. First Name')).toBe('First Name');
      expect(parser['cleanFieldName']('field@name#test')).toBe('Fieldnametest');
      expect(parser['cleanFieldName']('  multiple   spaces  ')).toBe('Multiple Spaces');
      expect(parser['cleanFieldName']('lower case name')).toBe('Lower Case Name');
    });

    it('should convert time ranges to dates correctly', () => {
      const now = new Date();
      const lastWeek = parser['convertTimeRangeToDate']('last week');
      const thisWeek = parser['convertTimeRangeToDate']('this week');
      const lastMonth = parser['convertTimeRangeToDate']('last month');

      expect(new Date(lastWeek)).toBeInstanceOf(Date);
      expect(new Date(thisWeek)).toBeInstanceOf(Date);
      expect(new Date(lastMonth)).toBeInstanceOf(Date);
      
      // Verify that last week is actually before now
      expect(new Date(lastWeek).getTime()).toBeLessThan(now.getTime());
    });
  });

  describe('export functionality', () => {
    it('should export configuration successfully', async () => {
      const mockConfig = {
        sheets: {},
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        sourceFile: 'test.xlsx'
      };

      // Mock localStorage
      const mockSetItem = jest.fn();
      Object.defineProperty(window, 'localStorage', {
        value: { setItem: mockSetItem }
      });

      // Mock DOM manipulation
      const mockClick = jest.fn();
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      const mockCreateElement = jest.fn(() => ({
        click: mockClick,
        href: '',
        download: ''
      }));
      const mockCreateObjectURL = jest.fn(() => 'mock-url');
      const mockRevokeObjectURL = jest.fn();

      Object.defineProperty(document, 'createElement', { value: mockCreateElement });
      Object.defineProperty(document.body, 'appendChild', { value: mockAppendChild });
      Object.defineProperty(document.body, 'removeChild', { value: mockRemoveChild });
      Object.defineProperty(URL, 'createObjectURL', { value: mockCreateObjectURL });
      Object.defineProperty(URL, 'revokeObjectURL', { value: mockRevokeObjectURL });

      await parser.exportConfiguration(mockConfig);

      expect(mockSetItem).toHaveBeenCalledWith('insuranceFieldsConfig', JSON.stringify(mockConfig));
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();
    });
  });
});
