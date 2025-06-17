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

  describe('default filter', () => {
    test('should return default value for null input', () => {
      expect(filters.default(null, 'default value')).toBe('default value');
      expect(filters.default(null, 0)).toBe(0);
      expect(filters.default(null, false)).toBe(false);
    });

    test('should return default value for undefined input', () => {
      expect(filters.default(undefined, 'default value')).toBe('default value');
      expect(filters.default(undefined, 123)).toBe(123);
      expect(filters.default(undefined, true)).toBe(true);
    });

    test('should return original value if it is not null or undefined', () => {
      expect(filters.default('some string', 'default')).toBe('some string');
      expect(filters.default(0, 'default')).toBe(0);
      expect(filters.default(false, 'default')).toBe(false);
      expect(filters.default('', 'default')).toBe('');
      const arr = [];
      expect(filters.default(arr, 'default')).toBe(arr);
      const obj = {};
      expect(filters.default(obj, 'default')).toBe(obj);
      expect(filters.default(NaN, 'default')).toBeNaN();
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

  describe('regex filter', () => {
    test('should match patterns', () => {
      expect(filters.regex('hello123', '\\d+')).toEqual(['123']);
      expect(filters.regex('abc123def456', '\\d+', 'g')).toEqual(['123', '456']);
      expect(filters.regex('Hello World', '\\w+', 'g')).toEqual(['Hello', 'World']);
    });

    test('should return empty array for no matches', () => {
      expect(filters.regex('hello', '\\d+')).toEqual([]);
    });

    test('should handle invalid patterns', () => {
      expect(filters.regex('hello', '[')).toBe('hello');
    });

    test('should return non-strings unchanged', () => {
      expect(filters.regex(123, '\\d+')).toBe(123);
      expect(filters.regex(null, '\\d+')).toBe(null);
    });
  });

  describe('replace filter', () => {
    test('should replace simple strings', () => {
      expect(filters.replace('hello world', 'world', 'universe')).toBe('hello universe');
      expect(filters.replace('test test', 'test', 'demo')).toBe('demo test');
    });

    test('should replace with regex', () => {
      expect(filters.replace('hello123world456', '\\d+', 'X', 'g')).toBe('helloXworldX');
      expect(filters.replace('Hello World', '\\b\\w', 'X', 'g')).toBe('Xello Xorld');
    });

    test('should handle invalid patterns', () => {
      expect(filters.replace('hello', '[', 'X', 'g')).toBe('hello');
    });

    test('should return non-strings unchanged', () => {
      expect(filters.replace(123, 'test', 'demo')).toBe(123);
    });
  });

  describe('split filter', () => {
    test('should split strings', () => {
      expect(filters.split('a,b,c', ',')).toEqual(['a', 'b', 'c']);
      expect(filters.split('hello world', ' ')).toEqual(['hello', 'world']);
      expect(filters.split('a-b-c-d', '-', 2)).toEqual(['a', 'b']);
    });

    test('should return non-strings unchanged', () => {
      expect(filters.split(123, ',')).toBe(123);
      expect(filters.split(null, ',')).toBe(null);
    });
  });

  describe('join filter', () => {
    test('should join arrays', () => {
      expect(filters.join(['a', 'b', 'c'], '-')).toBe('a-b-c');
      expect(filters.join(['hello', 'world'], ' ')).toBe('hello world');
      expect(filters.join([1, 2, 3])).toBe('1,2,3');
    });

    test('should return non-arrays unchanged', () => {
      expect(filters.join('hello', '-')).toBe('hello');
      expect(filters.join(123, '-')).toBe(123);
    });
  });

  describe('capitalize filter', () => {
    test('should capitalize first letter', () => {
      expect(filters.capitalize('hello')).toBe('Hello');
      expect(filters.capitalize('WORLD')).toBe('World');
      expect(filters.capitalize('hELLO wORLD')).toBe('Hello world');
    });

    test('should handle empty strings', () => {
      expect(filters.capitalize('')).toBe('');
    });

    test('should return non-strings unchanged', () => {
      expect(filters.capitalize(123)).toBe(123);
      expect(filters.capitalize(null)).toBe(null);
    });
  });

  describe('upper filter', () => {
    test('should convert to uppercase', () => {
      expect(filters.upper('hello')).toBe('HELLO');
      expect(filters.upper('Hello World')).toBe('HELLO WORLD');
    });

    test('should return non-strings unchanged', () => {
      expect(filters.upper(123)).toBe(123);
    });
  });

  describe('lower filter', () => {
    test('should convert to lowercase', () => {
      expect(filters.lower('HELLO')).toBe('hello');
      expect(filters.lower('Hello World')).toBe('hello world');
    });

    test('should return non-strings unchanged', () => {
      expect(filters.lower(123)).toBe(123);
    });
  });

  describe('title filter', () => {
    test('should convert to title case', () => {
      expect(filters.title('hello world')).toBe('Hello World');
      expect(filters.title('HELLO WORLD')).toBe('Hello World');
      expect(filters.title('hELLO wORLD')).toBe('Hello World');
    });

    test('should return non-strings unchanged', () => {
      expect(filters.title(123)).toBe(123);
    });
  });

  describe('length filter', () => {
    test('should return string length', () => {
      expect(filters.length('hello')).toBe(5);
      expect(filters.length('')).toBe(0);
      expect(filters.length('测试')).toBe(2);
    });

    test('should return array length', () => {
      expect(filters.length([1, 2, 3])).toBe(3);
      expect(filters.length([])).toBe(0);
    });

    test('should return non-strings/arrays unchanged', () => {
      expect(filters.length(123)).toBe(123);
      expect(filters.length(null)).toBe(null);
    });
  });

  describe('first filter', () => {
    test('should return first element of array', () => {
      expect(filters.first([1, 2, 3])).toBe(1);
      expect(filters.first(['a', 'b', 'c'])).toBe('a');
    });

    test('should return first character of string', () => {
      expect(filters.first('hello')).toBe('h');
      expect(filters.first('a')).toBe('a');
    });

    test('should handle empty arrays/strings', () => {
      expect(filters.first([])).toBeUndefined();
      expect(filters.first('')).toBeUndefined();
    });

    test('should return non-arrays/strings unchanged', () => {
      expect(filters.first(123)).toBe(123);
      expect(filters.first(null)).toBe(null);
    });
  });

  describe('last filter', () => {
    test('should return last element of array', () => {
      expect(filters.last([1, 2, 3])).toBe(3);
      expect(filters.last(['a', 'b', 'c'])).toBe('c');
    });

    test('should return last character of string', () => {
      expect(filters.last('hello')).toBe('o');
      expect(filters.last('a')).toBe('a');
    });

    test('should handle empty arrays/strings', () => {
      expect(filters.last([])).toBeUndefined();
      expect(filters.last('')).toBeUndefined();
    });

    test('should return non-arrays/strings unchanged', () => {
      expect(filters.last(123)).toBe(123);
      expect(filters.last(null)).toBe(null);
    });
  });

  describe('unique filter', () => {
    test('should remove duplicates from array', () => {
      expect(filters.unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(filters.unique(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
    });

    test('should handle empty arrays', () => {
      expect(filters.unique([])).toEqual([]);
    });

    test('should return non-arrays unchanged', () => {
      expect(filters.unique('hello')).toBe('hello');
      expect(filters.unique(123)).toBe(123);
    });
  });

  describe('sort filter', () => {
    test('should sort arrays in ascending order', () => {
      expect(filters.sort([3, 1, 2])).toEqual([1, 2, 3]);
      expect(filters.sort(['c', 'a', 'b'])).toEqual(['a', 'b', 'c']);
    });

    test('should sort arrays in descending order', () => {
      expect(filters.sort([3, 1, 2], 'desc')).toEqual([3, 2, 1]);
      expect(filters.sort(['c', 'a', 'b'], 'desc')).toEqual(['c', 'b', 'a']);
    });

    test('should return non-arrays unchanged', () => {
      expect(filters.sort('hello')).toBe('hello');
      expect(filters.sort(123)).toBe(123);
    });
  });

  describe('compact filter', () => {
    test('should remove falsy values', () => {
      expect(filters.compact([1, null, 2, undefined, 3, '', 4, 0, false, NaN]))
        .toEqual([1, 2, 3, 4, false]);
    });

    test('should handle empty arrays', () => {
      expect(filters.compact([])).toEqual([]);
    });

    test('should return non-arrays unchanged', () => {
      expect(filters.compact('hello')).toBe('hello');
      expect(filters.compact(123)).toBe(123);
    });
  });

  describe('number filter', () => {
    test('should format numbers with decimals', () => {
      expect(filters.number(123.456, 2)).toBe('123.46');
      expect(filters.number(123.456, 0)).toBe('123');
      expect(filters.number(123.456, 4)).toBe('123.4560');
    });

    test('should handle string numbers', () => {
      expect(filters.number('123.456', 2)).toBe('123.46');
      expect(filters.number('100', 1)).toBe('100.0');
    });

    test('should return non-numbers unchanged', () => {
      expect(filters.number('hello')).toBe('hello');
      expect(filters.number(null)).toBe(null);
    });
  });
});
