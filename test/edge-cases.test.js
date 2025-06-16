/**
 * 边界情况和异常测试
 */

const { loadCheerio, parse } = require('../index.js');

describe('Edge Cases and Error Handling', () => {
  describe('Parse function error handling', () => {
    const $ = loadCheerio('<div>test</div>');

    test('should throw error for null/undefined rules', () => {
      expect(() => parse(null, $)).toThrow('Parse rule cannot be undefined or null');
      expect(() => parse(undefined, $)).toThrow('Parse rule cannot be undefined or null');
    });

    test('should throw error for invalid Cheerio instance', () => {
      expect(() => parse('div', null)).toThrow('Cheerio instance ($) is required and must be a function');
      expect(() => parse('div', undefined)).toThrow('Cheerio instance ($) is required and must be a function');
      expect(() => parse('div', 'not-a-function')).toThrow('Cheerio instance ($) is required and must be a function');
      expect(() => parse('div', 123)).toThrow('Cheerio instance ($) is required and must be a function');
    });

    test('should throw error for unknown filters', () => {
      expect(() => parse('div | unknownFilter', $)).toThrow('Unknown filter: unknownFilter');
    });

    test('should provide detailed error information', () => {
      try {
        parse('div | unknownFilter', $);
      } catch (error) {
        expect(error.message).toContain('unknownFilter');
        expect(error.filterName).toBe('unknownFilter');
        expect(error.details.query).toBe('div | unknownFilter');
      }
    });
  });

  describe('Empty and malformed HTML', () => {
    test('should handle completely empty HTML', () => {
      const $ = loadCheerio('');
      expect(parse('div', $)).toBeUndefined();
      expect(parse('[div]', $)).toEqual([]);
    });

    test('should handle whitespace-only HTML', () => {
      const $ = loadCheerio('   \n\t   ');
      expect(parse('div', $)).toBeUndefined();
      expect(parse('[div]', $)).toEqual([]);
    });

    test('should handle malformed HTML', () => {
      const $ = loadCheerio('<div><p>Unclosed tags<span>More unclosed');
      expect(parse('div', $)).toBeTruthy();
      expect(parse('p', $)).toBeTruthy();
      expect(parse('span', $)).toBeTruthy();
    });

    test('should handle HTML with only text', () => {
      const $ = loadCheerio('Just plain text');
      expect(parse('div', $)).toBeUndefined();
      // Cheerio wraps plain text in body
      const bodyResult = parse('body', $);
      expect(bodyResult).toBe('Just plain text');
    });

    test('should handle HTML with special characters', () => {
      const $ = loadCheerio('<div>Special chars: &lt;&gt;&amp;"\'</div>');
      expect(parse('div', $)).toBe('Special chars: <>&"\'');
    });
  });

  describe('Complex selector edge cases', () => {
    const complexHtml = `
      <div class="container">
        <div class="item" data-id="1">
          <span class="title">Item 1</span>
          <span class="price">$10.99</span>
        </div>
        <div class="item" data-id="2">
          <span class="title">Item 2</span>
          <span class="price">$15.50</span>
        </div>
      </div>
    `;
    const $ = loadCheerio(complexHtml);

    test('should handle non-existent selectors', () => {
      expect(parse('.non-existent', $)).toBeUndefined();
      expect(parse('[.non-existent]', $)).toEqual([]);
      expect(parse('#missing-id', $)).toBeUndefined();
    });

    test('should handle complex nested selectors', () => {
      expect(parse('.container .item .title', $)).toBe('Item 1');
      expect(parse('[.container .item .title]', $)).toEqual(['Item 1', 'Item 2']);
    });

    test('should handle attribute selectors', () => {
      expect(parse('.item[data-id="1"] .title', $)).toBe('Item 1');
      expect(parse('.item[data-id="999"] .title', $)).toBeUndefined();
    });

    test('should handle pseudo selectors', () => {
      // 使用标准CSS选择器，因为新的条件语法改变了处理方式
      expect(parse('.item:first-child .title', $)).toBe('Item 1');
      expect(parse('.item:last-child .title', $)).toBe('Item 2');
    });
  });

  describe('Filter edge cases', () => {
    const $ = loadCheerio('<div class="test">  123.45abc  </div>');

    test('should handle filter chain with errors', () => {
      // 测试过滤器链中的错误传播
      expect(() => parse('.test | trim | unknownFilter', $)).toThrow();
    });

    test('should handle empty values in filters', () => {
      const $empty = loadCheerio('<div class="empty"></div>');
      expect(parse('.empty | int', $empty)).toBeNaN();
      expect(parse('.empty | float', $empty)).toBeNaN();
      expect(parse('.empty | bool', $empty)).toBe(false);
      expect(parse('.empty | trim', $empty)).toBe('');
    });

    test('should handle null/undefined values in filters', () => {
      const $null = loadCheerio('<div></div>');
      expect(parse('.missing | trim', $null)).toBeUndefined();
    });

    test('should handle complex filter chains', () => {
      expect(parse('.test | trim | slice:0:6 | float', $)).toBe(123.45);
    });
  });

  describe('Object and array rule edge cases', () => {
    const $ = loadCheerio(`
      <div class="product">
        <h1>Product Name</h1>
        <span class="price">$99.99</span>
        <ul class="features">
          <li>Feature 1</li>
          <li>Feature 2</li>
        </ul>
      </div>
    `);

    test('should handle empty objects', () => {
      expect(parse({}, $)).toEqual({});
    });

    test('should handle nested empty objects', () => {
      const result = parse({
        product: {},
        info: {
          details: {}
        }
      }, $);
      expect(result).toEqual({
        product: {},
        info: {
          details: {}
        }
      });
    });

    test('should handle mixed successful and failed extractions', () => {
      const result = parse({
        name: 'h1',
        price: '.price | slice:1: | float',
        missing: '.non-existent',
        features: '[.features li]'
      }, $);

      expect(result.name).toBe('Product Name');
      expect(result.price).toBe(99.99);
      expect(result.missing).toBeUndefined();
      expect(result.features).toEqual(['Feature 1', 'Feature 2']);
    });

    test('should handle array rules with missing divider', () => {
      expect(parse(['h1'], $)).toBe('Product Name');
    });

    test('should handle array rules with functions', () => {
      const result = parse(['h1', text => text.toUpperCase()], $);
      expect(result).toBe('PRODUCT NAME');
    });
  });

  describe('Memory and performance edge cases', () => {
    test('should handle large HTML documents', () => {
      // 生成大型HTML文档
      const largeHtml = '<div>' + '<p>Item</p>'.repeat(1000) + '</div>';
      const $ = loadCheerio(largeHtml);
      
      const result = parse('[p]', $);
      expect(result).toHaveLength(1000);
      expect(result[0]).toBe('Item');
      expect(result[999]).toBe('Item');
    });

    test('should handle deeply nested structures', () => {
      // 生成深度嵌套的HTML
      let nestedHtml = '<div>';
      for (let i = 0; i < 100; i++) {
        nestedHtml += `<div class="level-${i}">`;
      }
      nestedHtml += 'Deep content';
      for (let i = 0; i < 100; i++) {
        nestedHtml += '</div>';
      }
      nestedHtml += '</div>';

      const $ = loadCheerio(nestedHtml);
      expect(parse('.level-99', $)).toBe('Deep content');
    });

    test('should handle many simultaneous extractions', () => {
      const $ = loadCheerio('<div><span>test</span></div>');
      
      // 执行大量并发解析
      const promises = Array.from({ length: 100 }, () => 
        Promise.resolve(parse('span', $))
      );

      return Promise.all(promises).then(results => {
        expect(results).toHaveLength(100);
        results.forEach(result => {
          expect(result).toBe('test');
        });
      });
    });
  });

  describe('Unicode and encoding edge cases', () => {
    test('should handle Unicode characters', () => {
      const $ = loadCheerio('<div>你好世界 🌍 Здравствуй мир</div>');
      expect(parse('div', $)).toBe('你好世界 🌍 Здравствуй мир');
    });

    test('should handle HTML entities', () => {
      const $ = loadCheerio('<div>&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;</div>');
      expect(parse('div', $)).toBe('<script>alert("test")</script>');
    });

    test('should handle mixed encoding', () => {
      const $ = loadCheerio('<div>Mixed: ASCII + 中文 + العربية + 🎉</div>');
      const result = parse('div', $);
      expect(result).toContain('ASCII');
      expect(result).toContain('中文');
      expect(result).toContain('العربية');
      expect(result).toContain('🎉');
    });
  });
});
