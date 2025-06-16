/**
 * 查询解析器单元测试
 */

const queryParser = require('../src/query-parser');

describe('Query Parser', () => {
  describe('basic parsing', () => {
    test('should parse simple selectors', () => {
      const result = queryParser('h1');
      expect(result).toEqual({
        selector: 'h1',
        attribute: undefined,
        filters: [],
        getAll: false
      });
    });

    test('should parse selectors with attributes', () => {
      const result = queryParser('a@href');
      expect(result).toEqual({
        selector: 'a',
        attribute: 'href',
        filters: [],
        getAll: false
      });
    });

    test('should parse class selectors', () => {
      const result = queryParser('.title');
      expect(result).toEqual({
        selector: '.title',
        attribute: undefined,
        filters: [],
        getAll: false
      });
    });

    test('should parse ID selectors', () => {
      const result = queryParser('#main');
      expect(result).toEqual({
        selector: '#main',
        attribute: undefined,
        filters: [],
        getAll: false
      });
    });
  });

  describe('getAll syntax', () => {
    test('should parse getAll selectors', () => {
      const result = queryParser('[h1]');
      expect(result).toEqual({
        selector: 'h1',
        attribute: undefined,
        filters: [],
        getAll: true
      });
    });

    test('should parse getAll with attributes', () => {
      const result = queryParser('[a@href]');
      expect(result).toEqual({
        selector: 'a',
        attribute: 'href',
        filters: [],
        getAll: true
      });
    });

    test('should handle whitespace in brackets', () => {
      const result = queryParser('[ .title ]');
      expect(result).toEqual({
        selector: '.title',
        attribute: undefined,
        filters: [],
        getAll: true
      });
    });
  });

  describe('filters', () => {
    test('should parse single filter', () => {
      const result = queryParser('span | trim');
      expect(result.selector).toBe('span');
      expect(result.filters).toHaveLength(1);
      expect(result.filters[0].name).toBe('trim');
    });

    test('should parse multiple filters', () => {
      const result = queryParser('span | trim | int');
      expect(result.selector).toBe('span');
      expect(result.filters).toHaveLength(2);
      expect(result.filters[0].name).toBe('trim');
      expect(result.filters[1].name).toBe('int');
    });

    test('should parse filters with arguments', () => {
      const result = queryParser('text | slice:0:10');
      expect(result.selector).toBe('text');
      expect(result.filters).toHaveLength(1);
      expect(result.filters[0].name).toBe('slice');
      expect(result.filters[0].args).toEqual(['0:10']);
    });

    test('should parse getAll with filters', () => {
      const result = queryParser('[li | trim | int]');
      expect(result.selector).toBe('li');
      expect(result.getAll).toBe(true);
      expect(result.filters).toHaveLength(2);
    });
  });

  describe('complex selectors', () => {
    test('should parse descendant selectors', () => {
      const result = queryParser('.container .title');
      expect(result.selector).toBe('.container .title');
      expect(result.attribute).toBeUndefined();
    });

    test('should parse child selectors', () => {
      const result = queryParser('ul > li');
      expect(result.selector).toBe('ul > li');
    });

    test('should parse pseudo selectors', () => {
      const result = queryParser('li:first-child');
      expect(result.selector).toBe('li:first-child');
    });

    test('should parse attribute selectors', () => {
      const result = queryParser('input[type="text"]');
      expect(result.selector).toBe('input[type="text"]');
    });
  });

  describe('attribute parsing', () => {
    test('should parse common attributes', () => {
      expect(queryParser('a@href').attribute).toBe('href');
      expect(queryParser('img@src').attribute).toBe('src');
      expect(queryParser('input@value').attribute).toBe('value');
    });

    test('should parse data attributes', () => {
      expect(queryParser('div@data-id').attribute).toBe('data-id');
      expect(queryParser('span@data-value').attribute).toBe('data-value');
    });

    test('should handle whitespace around @', () => {
      expect(queryParser('a @ href').attribute).toBe('href');
      expect(queryParser('img @src').attribute).toBe('src');
    });
  });

  describe('error handling', () => {
    test('should throw error for non-string input', () => {
      expect(() => queryParser(123)).toThrow('Query should be string');
      expect(() => queryParser(null)).toThrow('Query should be string');
      expect(() => queryParser(undefined)).toThrow('Query should be string');
      expect(() => queryParser({})).toThrow('Query should be string');
    });

    test('should throw error for empty string', () => {
      expect(() => queryParser('')).toThrow('Query string cannot be empty');
      expect(() => queryParser('   ')).toThrow('Query string cannot be empty');
    });

    test('should throw error for empty brackets', () => {
      expect(() => queryParser('[]')).toThrow('Empty selector inside brackets');
      expect(() => queryParser('[  ]')).toThrow('Empty selector inside brackets');
    });
  });

  describe('edge cases', () => {
    test('should handle selectors with special characters', () => {
      const result = queryParser('input[name="user-name"]@value');
      expect(result.selector).toBe('input[name="user-name"]');
      expect(result.attribute).toBe('value');
    });

    test('should handle empty selector with attribute', () => {
      const result = queryParser('@text');
      expect(result.selector).toBe(null);
      expect(result.attribute).toBe('text');
    });

    test('should handle filters without selector', () => {
      const result = queryParser('| trim');
      expect(result.selector).toBe(null);
      expect(result.filters).toHaveLength(1);
    });

    test('should preserve whitespace in complex selectors', () => {
      const result = queryParser('.class1 .class2');
      expect(result.selector).toBe('.class1 .class2');
    });
  });
});
