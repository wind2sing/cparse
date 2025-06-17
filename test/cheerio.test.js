/**
 * Cheerio 模块单元测试
 */

const { loadCheerio } = require('../src/cheerio');
const { cheerioHookForAxios, cheerioHookForGot } = require('../src/integrations');

describe('Cheerio Module', () => {
  const sampleHtml = `
    <html>
      <head><title>Test Page</title></head>
      <body>
        <h1 class="title">Hello World</h1>
        <p class="content">This is a test</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
        <a href="/relative" class="link">Relative Link</a>
        <a href="https://example.com" class="external">External Link</a>
      </body>
    </html>
  `;

  describe('loadCheerio', () => {
    test('should load HTML and return Cheerio instance', () => {
      const $ = loadCheerio(sampleHtml);
      expect(typeof $).toBe('function');
      expect($('title').text()).toBe('Test Page');
      expect($('h1').text()).toBe('Hello World');
    });

    test('should handle empty HTML', () => {
      const $ = loadCheerio('');
      expect(typeof $).toBe('function');
      // Cheerio creates a default structure even for empty HTML
      expect($('body').length).toBeGreaterThanOrEqual(0);
    });

    test('should handle malformed HTML', () => {
      const $ = loadCheerio('<div><p>Unclosed tags');
      expect(typeof $).toBe('function');
      expect($('div').length).toBe(1);
      expect($('p').length).toBe(1);
    });

    test('should throw error for non-string input', () => {
      expect(() => loadCheerio(123)).toThrow('HTML text must be a string');
      expect(() => loadCheerio(null)).toThrow('HTML text must be a string');
      expect(() => loadCheerio(undefined)).toThrow('HTML text must be a string');
    });

    test('should convert relative URLs to absolute', () => {
      const $ = loadCheerio(sampleHtml, {}, 'https://example.com');
      expect($('a.link').attr('href')).toBe('https://example.com/relative');
      expect($('a.external').attr('href')).toBe('https://example.com/');
    });

    test('should keep relative URLs when option is set', () => {
      const $ = loadCheerio(sampleHtml, { keepRelativeUrl: true }, 'https://example.com');
      expect($('a.link').attr('href')).toBe('/relative');
      expect($('a.external').attr('href')).toBe('https://example.com');
    });

    test('should throw error for invalid response URL', () => {
      expect(() => loadCheerio(sampleHtml, {}, 123)).toThrow('Response URL must be a string');
    });
  });

  describe('Cheerio extensions', () => {
    let $;

    beforeEach(() => {
      $ = loadCheerio(sampleHtml);
    });

    test('should have string() method', () => {
      expect(typeof $('h1').string).toBe('function');
      expect($('h1').string()).toBe('Hello World');
    });

    test('should have nextNode() method', () => {
      expect(typeof $('h1').nextNode).toBe('function');
    });

    test('should have extract() method', () => {
      expect(typeof $('h1').extract).toBe('function');
      expect($('h1').extract()).toBe('Hello World');
      expect($('h1').extract('text')).toBe('Hello World');
    });

    test('should have extractAll() method', () => {
      expect(typeof $('li').extractAll).toBe('function');
      const items = $('li').extractAll();
      expect(items).toEqual(['Item 1', 'Item 2', 'Item 3']);
    });

    test('extract() should handle different attributes', () => {
      expect($('h1').extract('html')).toContain('Hello World');
      expect($('a.link').extract('href')).toBe('/relative');
    });

    test('extractAll() should handle different attributes', () => {
      const hrefs = $('a').extractAll('href');
      expect(hrefs).toEqual(['/relative', 'https://example.com']);
    });

    test('should have parse() method on Cheerio instance', () => {
      expect(typeof $.parse).toBe('function');
    });

    test('$.parse() should work with basic selectors', () => {
      expect($.parse('h1')).toBe('Hello World');
      expect($.parse('.title')).toBe('Hello World');
      expect($.parse('title')).toBe('Test Page');
    });

    test('$.parse() should work with attribute extraction', () => {
      expect($.parse('a.link@href')).toBe('/relative');
      expect($.parse('a.external@href')).toBe('https://example.com');
    });

    test('$.parse() should work with array extraction', () => {
      expect($.parse('[li]')).toEqual(['Item 1', 'Item 2', 'Item 3']);
      expect($.parse('[a@href]')).toEqual(['/relative', 'https://example.com']);
    });

    test('$.parse() should work with structured data', () => {
      const result = $.parse({
        title: 'h1',
        content: '.content',
        items: '[li]',
        links: '[a@href]'
      });

      expect(result).toEqual({
        title: 'Hello World',
        content: 'This is a test',
        items: ['Item 1', 'Item 2', 'Item 3'],
        links: ['/relative', 'https://example.com']
      });
    });

    test('$.parse() should work with custom filters', () => {
      const customFilters = {
        reverse: (str) => str.split('').reverse().join('')
      };

      expect($.parse('h1', customFilters)).toBe('Hello World');
      expect($.parse('h1 | reverse', customFilters)).toBe('dlroW olleH');
    });
  });

  describe('cheerioHookForAxios', () => {
    test('should throw error for invalid Axios instance', () => {
      expect(() => cheerioHookForAxios(null)).toThrow('Invalid Axios instance provided');
      expect(() => cheerioHookForAxios({})).toThrow('Invalid Axios instance provided');
      expect(() => cheerioHookForAxios({ interceptors: null })).toThrow('Invalid Axios instance provided');
    });

    test('should add interceptor to valid Axios instance', () => {
      const mockAxios = {
        interceptors: {
          response: {
            use: jest.fn()
          }
        }
      };

      const result = cheerioHookForAxios(mockAxios);
      expect(result).toBe(mockAxios);
      expect(mockAxios.interceptors.response.use).toHaveBeenCalledTimes(1);
    });

    test('should handle response with HTML content', () => {
      const mockAxios = {
        interceptors: {
          response: {
            use: jest.fn()
          }
        }
      };

      cheerioHookForAxios(mockAxios);
      const interceptor = mockAxios.interceptors.response.use.mock.calls[0][0];

      const mockResponse = {
        headers: { 'content-type': 'text/html' },
        data: sampleHtml,
        request: { res: { responseUrl: 'https://example.com' } }
      };

      const result = interceptor(mockResponse);
      expect(result).toBe(mockResponse);
      expect(typeof result.$).toBe('function');
      expect(result.$('title').text()).toBe('Test Page');
    });

    test('should skip non-HTML responses', () => {
      const mockAxios = {
        interceptors: {
          response: {
            use: jest.fn()
          }
        }
      };

      cheerioHookForAxios(mockAxios);
      const interceptor = mockAxios.interceptors.response.use.mock.calls[0][0];

      const mockResponse = {
        headers: { 'content-type': 'application/json' },
        data: '{"test": true}'
      };

      const result = interceptor(mockResponse);
      expect(result).toBe(mockResponse);
      expect(result.$).toBeUndefined();
    });

    test('should handle disabled option', () => {
      const mockAxios = {
        interceptors: {
          response: {
            use: jest.fn()
          }
        }
      };

      cheerioHookForAxios(mockAxios, { disable: true });
      const interceptor = mockAxios.interceptors.response.use.mock.calls[0][0];

      const mockResponse = {
        headers: { 'content-type': 'text/html' },
        data: sampleHtml
      };

      const result = interceptor(mockResponse);
      expect(result).toBe(mockResponse);
      expect(result.$).toBeUndefined();
    });
  });

  describe('cheerioHookForGot', () => {
    test('should throw error for invalid Got instance', () => {
      expect(() => cheerioHookForGot(null)).toThrow('Invalid Got instance provided');
      expect(() => cheerioHookForGot({})).toThrow('Invalid Got instance provided');
      expect(() => cheerioHookForGot({ defaults: null })).toThrow('Invalid Got instance provided');
    });

    test('should add hook to valid Got instance', () => {
      const mockGot = {
        defaults: {
          options: {
            hooks: {
              afterResponse: []
            }
          }
        }
      };

      cheerioHookForGot(mockGot);
      expect(mockGot.defaults.options.hooks.afterResponse).toHaveLength(1);
    });

    test('should handle response with HTML content', () => {
      const mockGot = {
        defaults: {
          options: {
            hooks: {
              afterResponse: []
            }
          }
        }
      };

      cheerioHookForGot(mockGot);
      const hook = mockGot.defaults.options.hooks.afterResponse[0];

      const mockResponse = {
        headers: { 'content-type': 'text/html' },
        body: sampleHtml,
        url: 'https://example.com'
      };

      const result = hook(mockResponse);
      expect(result).toBe(mockResponse);
      expect(typeof result.$).toBe('function');
      expect(result.$('title').text()).toBe('Test Page');
    });
  });
});
