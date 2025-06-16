/**
 * 错误处理测试
 */

const {
  ParseError,
  QueryParseError,
  FilterError,
  SelectorError,
  ValidationError,
  Validator,
  ErrorHandler
} = require('../src/errors');

describe('错误处理', () => {
  describe('自定义错误类', () => {
    test('ParseError应该正确创建', () => {
      const error = new ParseError('Test message', { key: 'value' });
      expect(error.name).toBe('ParseError');
      expect(error.message).toBe('Test message');
      expect(error.details).toEqual({ key: 'value' });
      expect(error instanceof Error).toBe(true);
    });

    test('QueryParseError应该正确创建', () => {
      const error = new QueryParseError('Query error', 'h1@text', { line: 1 });
      expect(error.name).toBe('QueryParseError');
      expect(error.message).toBe('Query error');
      expect(error.query).toBe('h1@text');
      expect(error.details).toEqual({ query: 'h1@text', line: 1 });
    });

    test('FilterError应该正确创建', () => {
      const error = new FilterError('Filter error', 'trim', 'value', { arg: 1 });
      expect(error.name).toBe('FilterError');
      expect(error.filterName).toBe('trim');
      expect(error.value).toBe('value');
      expect(error.details).toEqual({ filterName: 'trim', value: 'value', arg: 1 });
    });

    test('SelectorError应该正确创建', () => {
      const error = new SelectorError('Selector error', '.test', { type: 'invalid' });
      expect(error.name).toBe('SelectorError');
      expect(error.selector).toBe('.test');
      expect(error.details).toEqual({ selector: '.test', type: 'invalid' });
    });

    test('ValidationError应该正确创建', () => {
      const error = new ValidationError('Validation error', 'field', 'value', { rule: 'required' });
      expect(error.name).toBe('ValidationError');
      expect(error.field).toBe('field');
      expect(error.value).toBe('value');
      expect(error.details).toEqual({ field: 'field', value: 'value', rule: 'required' });
    });
  });

  describe('Validator', () => {
    describe('validateQuery', () => {
      test('应该接受有效的查询字符串', () => {
        expect(Validator.validateQuery('h1')).toBe('h1');
        expect(Validator.validateQuery('  .title  ')).toBe('.title');
        expect(Validator.validateQuery('div > p')).toBe('div > p');
      });

      test('应该拒绝非字符串输入', () => {
        expect(() => Validator.validateQuery(123)).toThrow(ValidationError);
        expect(() => Validator.validateQuery(null)).toThrow(ValidationError);
        expect(() => Validator.validateQuery(undefined)).toThrow(ValidationError);
        expect(() => Validator.validateQuery({})).toThrow(ValidationError);
      });

      test('应该拒绝空字符串', () => {
        expect(() => Validator.validateQuery('')).toThrow(ValidationError);
        expect(() => Validator.validateQuery('   ')).toThrow(ValidationError);
      });

      test('应该拒绝过长的查询', () => {
        const longQuery = 'a'.repeat(1001);
        expect(() => Validator.validateQuery(longQuery)).toThrow(ValidationError);
      });
    });

    describe('validateSelector', () => {
      test('应该接受有效的选择器', () => {
        expect(Validator.validateSelector('h1')).toBe('h1');
        expect(Validator.validateSelector('.class')).toBe('.class');
        expect(Validator.validateSelector('#id')).toBe('#id');
        expect(Validator.validateSelector(null)).toBe(null);
        expect(Validator.validateSelector(undefined)).toBe(undefined);
      });

      test('应该拒绝非字符串选择器', () => {
        expect(() => Validator.validateSelector(123)).toThrow(ValidationError);
        expect(() => Validator.validateSelector({})).toThrow(ValidationError);
      });

      test('应该拒绝危险的选择器', () => {
        expect(() => Validator.validateSelector('javascript:alert(1)')).toThrow(ValidationError);
        expect(() => Validator.validateSelector('data:text/html,<script>')).toThrow(ValidationError);
        expect(() => Validator.validateSelector('<script>alert(1)</script>')).toThrow(ValidationError);
        expect(() => Validator.validateSelector('onclick=alert(1)')).toThrow(ValidationError);
      });
    });

    describe('validateFilterName', () => {
      test('应该接受有效的过滤器名称', () => {
        expect(Validator.validateFilterName('trim')).toBe('trim');
        expect(Validator.validateFilterName('int')).toBe('int');
      });

      test('应该拒绝非字符串过滤器名称', () => {
        expect(() => Validator.validateFilterName(123)).toThrow(ValidationError);
        expect(() => Validator.validateFilterName(null)).toThrow(ValidationError);
      });

      test('应该拒绝空过滤器名称', () => {
        expect(() => Validator.validateFilterName('')).toThrow(ValidationError);
        expect(() => Validator.validateFilterName('   ')).toThrow(ValidationError);
      });

      test('应该检查过滤器是否存在', () => {
        const filters = { trim: () => {}, int: () => {} };
        expect(Validator.validateFilterName('trim', filters)).toBe('trim');
        expect(() => Validator.validateFilterName('unknown', filters)).toThrow(ValidationError);
      });
    });

    describe('validateHtml', () => {
      test('应该接受有效的HTML', () => {
        expect(Validator.validateHtml('<div>test</div>')).toBe('<div>test</div>');
        expect(Validator.validateHtml('')).toBe('');
        expect(Validator.validateHtml(null)).toBe(null);
        expect(Validator.validateHtml(undefined)).toBe(undefined);
      });

      test('应该拒绝非字符串HTML', () => {
        expect(() => Validator.validateHtml(123)).toThrow(ValidationError);
        expect(() => Validator.validateHtml({})).toThrow(ValidationError);
      });

      test('应该拒绝过大的HTML', () => {
        const largeHtml = 'a'.repeat(11 * 1024 * 1024); // 11MB
        expect(() => Validator.validateHtml(largeHtml)).toThrow(ValidationError);
      });
    });
  });

  describe('ErrorHandler', () => {
    describe('wrap', () => {
      test('应该包装函数并处理错误', () => {
        const fn = () => {
          throw new Error('Test error');
        };
        const wrapped = ErrorHandler.wrap(fn, 'test context');
        
        expect(() => wrapped()).toThrow(ParseError);
        try {
          wrapped();
        } catch (error) {
          expect(error.details.context).toBe('test context');
          expect(error.details.originalError.message).toBe('Test error');
        }
      });

      test('应该保持ParseError不变', () => {
        const fn = () => {
          throw new QueryParseError('Query error', 'test');
        };
        const wrapped = ErrorHandler.wrap(fn, 'test context');
        
        expect(() => wrapped()).toThrow(QueryParseError);
      });

      test('应该正常返回结果', () => {
        const fn = (a, b) => a + b;
        const wrapped = ErrorHandler.wrap(fn, 'test context');
        
        expect(wrapped(1, 2)).toBe(3);
      });
    });

    describe('safeExecute', () => {
      test('应该返回函数结果', () => {
        const fn = () => 'success';
        expect(ErrorHandler.safeExecute(fn)).toBe('success');
      });

      test('应该返回默认值当函数抛出错误', () => {
        const fn = () => {
          throw new Error('Test error');
        };
        expect(ErrorHandler.safeExecute(fn, 'default')).toBe('default');
        expect(ErrorHandler.safeExecute(fn)).toBe(null);
      });
    });

    describe('formatError', () => {
      test('应该格式化普通错误', () => {
        const error = new Error('Test error');
        const formatted = ErrorHandler.formatError(error);
        
        expect(formatted.name).toBe('Error');
        expect(formatted.message).toBe('Test error');
        expect(formatted.timestamp).toBeDefined();
        expect(Array.isArray(formatted.stack)).toBe(true);
      });

      test('应该格式化ParseError', () => {
        const error = new ParseError('Parse error', { key: 'value' });
        const formatted = ErrorHandler.formatError(error);
        
        expect(formatted.name).toBe('ParseError');
        expect(formatted.details).toEqual({ key: 'value' });
      });
    });
  });
});
