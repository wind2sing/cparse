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

    test('should parse child selectors (Cheerio native)', () => {
      const result = queryParser('ul > li');
      expect(result.selector).toBe('ul > li');
      expect(result.attribute).toBeUndefined();
    });

    test('should parse pseudo selectors (Cheerio native)', () => {
      const result = queryParser('li:first-child');
      expect(result.selector).toBe('li:first-child');
      expect(result.attribute).toBeUndefined();
    });

    test('should parse attribute selectors (Cheerio native)', () => {
      const result = queryParser('input[type="text"]');
      expect(result.selector).toBe('input[type="text"]');
      expect(result.attribute).toBeUndefined();
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
      expect(() => queryParser(123)).toThrow('Query must be a string');
      expect(() => queryParser(null)).toThrow('Query must be a string');
      expect(() => queryParser(undefined)).toThrow('Query must be a string');
      expect(() => queryParser({})).toThrow('Query must be a string');
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

  describe('syntax sugar features', () => {
    test('should parse class condition syntax sugar', () => {
      const result = queryParser('div[.active]');
      expect(result.selector).toBe('div.active');
      expect(result.attribute).toBeUndefined();
    });

    test('should parse not-empty syntax sugar', () => {
      const result = queryParser('p:not-empty');
      expect(result.selector).toBe('p:not(:empty)');
      expect(result.attribute).toBeUndefined();
    });

    test('should handle Cheerio native selectors directly', () => {
      const result = queryParser('li:first');
      expect(result.selector).toBe('li:first');
      expect(result.attribute).toBeUndefined();
    });

    test('should handle Cheerio native contains', () => {
      const result = queryParser('p:contains("hello")');
      expect(result.selector).toBe('p:contains("hello")');
      expect(result.attribute).toBeUndefined();
    });

    test('should handle Cheerio native attribute selectors', () => {
      const result = queryParser('input[type=text]');
      expect(result.selector).toBe('input[type=text]');
      expect(result.attribute).toBeUndefined();
    });

    test('should handle Cheerio native has-attribute selectors', () => {
      const result = queryParser('img[alt]');
      expect(result.selector).toBe('img[alt]');
      expect(result.attribute).toBeUndefined();
    });

    test('should parse syntax sugar with attribute extraction', () => {
      const result = queryParser('a[.external]@href');
      expect(result.selector).toBe('a.external');
      expect(result.attribute).toBe('href');
    });
  });

  describe('combined features', () => {
    test('should parse nested selectors with attribute extraction', () => {
      const result = queryParser('nav > ul > li > a@href');
      expect(result.selector).toBe('nav > ul > li > a');
      expect(result.attribute).toBe('href');
    });

    test('should parse getAll with nested selectors', () => {
      const result = queryParser('[div > .item:first]');
      expect(result.selector).toBe('div > .item:first');
      expect(result.getAll).toBe(true);
    });

    test('should parse syntax sugar with nested selectors', () => {
      const result = queryParser('div > ul > li[.active]@data-id');
      expect(result.selector).toBe('div > ul > li.active');
      expect(result.attribute).toBe('data-id');
    });

    test('should parse complex query with filters', () => {
      const result = queryParser('p@data-id | trim');
      expect(result.selector).toBe('p');
      expect(result.attribute).toBe('data-id');
      expect(result.getAll).toBe(false);
      expect(result.filters).toHaveLength(1);
    });
  });
});
