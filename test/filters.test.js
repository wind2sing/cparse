/**
 * 过滤器模块单元测试
 */

const filters = require('../src/filters');

describe('Filters', () => {
  describe('int filter', () => {
    test('should convert string numbers to integers', () => {
      expect(filters.int('123')).toBe(123);
      expect(filters.int('456.78')).toBe(456);
      expect(filters.int('  789  ')).toBe(789);
    });

    test('should extract numbers from mixed strings', () => {
      expect(filters.int('abc123def')).toBe(123);
      expect(filters.int('价格：999元')).toBe(999);
      expect(filters.int('50件商品')).toBe(50);
    });

    test('should handle default values', () => {
      expect(filters.int('abc', 0)).toBe(0);
      expect(filters.int('', 42)).toBe(42);
      expect(filters.int('no-numbers', -1)).toBe(-1);
    });

    test('should handle edge cases', () => {
      expect(filters.int(123)).toBe(123);
      expect(filters.int(null)).toBeNaN();
      expect(filters.int(undefined)).toBeNaN();
    });
  });

  describe('float filter', () => {
    test('should convert string numbers to floats', () => {
      expect(filters.float('123.45')).toBe(123.45);
      expect(filters.float('3.14159')).toBe(3.14159);
      expect(filters.float('-42.5')).toBe(-42.5);
    });

    test('should handle integers', () => {
      expect(filters.float('100')).toBe(100);
      expect(filters.float(42)).toBe(42);
    });

    test('should handle default values', () => {
      expect(filters.float('abc', 0.0)).toBe(0.0);
      expect(filters.float('', 3.14)).toBe(3.14);
    });
  });

  describe('bool filter', () => {
    test('should convert truthy values to true', () => {
      expect(filters.bool('true')).toBe(true);
      expect(filters.bool('yes')).toBe(true);
      expect(filters.bool(1)).toBe(true);
      expect(filters.bool('non-empty')).toBe(true);
      expect(filters.bool([])).toBe(true);
      expect(filters.bool({})).toBe(true);
    });

    test('should convert falsy values to false', () => {
      expect(filters.bool('')).toBe(false);
      expect(filters.bool(0)).toBe(false);
      expect(filters.bool(null)).toBe(false);
      expect(filters.bool(undefined)).toBe(false);
      expect(filters.bool(false)).toBe(false);
    });
  });

  describe('trim filter', () => {
    test('should trim whitespace from strings', () => {
      expect(filters.trim('  hello  ')).toBe('hello');
      expect(filters.trim('\t\nworld\r\n')).toBe('world');
      expect(filters.trim('   ')).toBe('');
    });

    test('should return non-strings unchanged', () => {
      expect(filters.trim(123)).toBe(123);
      expect(filters.trim(null)).toBe(null);
      expect(filters.trim(undefined)).toBe(undefined);
      expect(filters.trim([])).toEqual([]);
    });
  });

  describe('slice filter', () => {
    test('should slice strings', () => {
      expect(filters.slice('hello', 1, 3)).toBe('el');
      expect(filters.slice('world', 0, 3)).toBe('wor');
      expect(filters.slice('test', 2)).toBe('st');
      expect(filters.slice('abc', -2)).toBe('bc');
    });

    test('should slice arrays', () => {
      expect(filters.slice([1, 2, 3, 4], 1, 3)).toEqual([2, 3]);
      expect(filters.slice(['a', 'b', 'c'], 0, 2)).toEqual(['a', 'b']);
    });

    test('should return non-sliceable values unchanged', () => {
      expect(filters.slice(123, 0, 2)).toBe(123);
      expect(filters.slice(null, 0, 1)).toBe(null);
    });
  });

  describe('reverse filter', () => {
    test('should reverse strings', () => {
      expect(filters.reverse('hello')).toBe('olleh');
      expect(filters.reverse('world')).toBe('dlrow');
      expect(filters.reverse('a')).toBe('a');
      expect(filters.reverse('')).toBe('');
    });

    test('should return non-strings unchanged', () => {
      expect(filters.reverse(123)).toBe(123);
      expect(filters.reverse(null)).toBe(null);
      expect(filters.reverse([])).toEqual([]);
    });
  });

  describe('date filter', () => {
    test('should parse standard date formats', () => {
      const date1 = filters.date('2024-01-15');
      expect(date1).toBeInstanceOf(Date);
      expect(date1.getFullYear()).toBe(2024);
      expect(date1.getMonth()).toBe(0); // January is 0
      expect(date1.getDate()).toBe(15);
    });

    test('should parse custom date formats', () => {
      const date1 = filters.date('20240115');
      expect(date1).toBeInstanceOf(Date);
      expect(date1.getFullYear()).toBe(2024);

      const date2 = filters.date('2024/01/15 14:30:25');
      expect(date2).toBeInstanceOf(Date);
      expect(date2.getHours()).toBe(14);
    });

    test('should handle timezone append', () => {
      const date = filters.date('2024-01-15', ' UTC');
      expect(date).toBeInstanceOf(Date);
    });

    test('should handle invalid dates', () => {
      const date = filters.date('invalid-date');
      expect(date).toBeInstanceOf(Date);
      expect(isNaN(date.getTime())).toBe(true);
    });
  });

  describe('size filter', () => {
    test('should parse byte sizes', () => {
      expect(filters.size('1024B')).toBe(1024);
      expect(filters.size('1KB')).toBe(1024);
      expect(filters.size('1MB')).toBe(1048576);
      expect(filters.size('1GB')).toBe(1073741824);
    });

    test('should handle decimal values', () => {
      expect(filters.size('1.5KB')).toBe(1536);
      expect(filters.size('2.5MB')).toBe(2621440);
    });

    test('should handle different unit formats', () => {
      expect(filters.size('1 KB')).toBe(1024);
      expect(filters.size('1kb')).toBe(1024);
      expect(filters.size('1KiB')).toBe(1024);
    });

    test('should handle plain numbers', () => {
      expect(filters.size('1024')).toBe(1024);
      expect(filters.size('500')).toBe(500);
    });

    test('should return original value for invalid input', () => {
      expect(filters.size('invalid')).toBe('invalid');
      expect(filters.size(123)).toBe(123);
      expect(filters.size(null)).toBe(null);
    });
  });
});
