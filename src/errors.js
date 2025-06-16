/**
 * 自定义错误类和错误处理工具
 */

/**
 * 基础解析错误类
 */
class ParseError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ParseError';
    this.details = details;
    
    // 保持堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ParseError);
    }
  }
}

/**
 * 查询解析错误
 */
class QueryParseError extends ParseError {
  constructor(message, query, details = {}) {
    super(message, { query, ...details });
    this.name = 'QueryParseError';
    this.query = query;
  }
}

/**
 * 过滤器错误
 */
class FilterError extends ParseError {
  constructor(message, filterName, value, details = {}) {
    super(message, { filterName, value, ...details });
    this.name = 'FilterError';
    this.filterName = filterName;
    this.value = value;
  }
}

/**
 * 选择器错误
 */
class SelectorError extends ParseError {
  constructor(message, selector, details = {}) {
    super(message, { selector, ...details });
    this.name = 'SelectorError';
    this.selector = selector;
  }
}

/**
 * 验证错误
 */
class ValidationError extends ParseError {
  constructor(message, field, value, details = {}) {
    super(message, { field, value, ...details });
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * 输入验证器
 */
class Validator {
  /**
   * 验证查询字符串
   * @param {*} query - 查询输入
   * @returns {string} 验证后的查询字符串
   * @throws {ValidationError} 验证失败时抛出
   */
  static validateQuery(query) {
    if (typeof query !== 'string') {
      throw new ValidationError(
        `Query must be a string, got ${typeof query}`,
        'query',
        query,
        { expectedType: 'string', actualType: typeof query }
      );
    }

    const trimmed = query.trim();
    if (trimmed === '') {
      throw new ValidationError(
        'Query string cannot be empty',
        'query',
        query,
        { reason: 'empty_string' }
      );
    }

    // 检查查询长度
    if (trimmed.length > 1000) {
      throw new ValidationError(
        'Query string is too long (max 1000 characters)',
        'query',
        query,
        { maxLength: 1000, actualLength: trimmed.length }
      );
    }

    return trimmed;
  }

  /**
   * 验证选择器
   * @param {*} selector - 选择器输入
   * @returns {string} 验证后的选择器
   * @throws {ValidationError} 验证失败时抛出
   */
  static validateSelector(selector) {
    if (selector === null || selector === undefined) {
      return selector;
    }

    if (typeof selector !== 'string') {
      throw new ValidationError(
        `Selector must be a string or null, got ${typeof selector}`,
        'selector',
        selector,
        { expectedType: 'string|null', actualType: typeof selector }
      );
    }

    // 检查危险的选择器模式
    const dangerousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<script/i,
      /on\w+\s*=/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(selector)) {
        throw new ValidationError(
          'Selector contains potentially dangerous content',
          'selector',
          selector,
          { reason: 'dangerous_pattern', pattern: pattern.toString() }
        );
      }
    }

    return selector;
  }

  /**
   * 验证过滤器名称
   * @param {*} filterName - 过滤器名称
   * @param {Object} availableFilters - 可用过滤器对象
   * @returns {string} 验证后的过滤器名称
   * @throws {ValidationError} 验证失败时抛出
   */
  static validateFilterName(filterName, availableFilters = {}) {
    if (typeof filterName !== 'string') {
      throw new ValidationError(
        `Filter name must be a string, got ${typeof filterName}`,
        'filterName',
        filterName,
        { expectedType: 'string', actualType: typeof filterName }
      );
    }

    if (filterName.trim() === '') {
      throw new ValidationError(
        'Filter name cannot be empty',
        'filterName',
        filterName,
        { reason: 'empty_string' }
      );
    }

    // 检查过滤器是否存在
    if (Object.keys(availableFilters).length > 0 && !availableFilters[filterName]) {
      throw new ValidationError(
        `Unknown filter: ${filterName}`,
        'filterName',
        filterName,
        { 
          reason: 'unknown_filter',
          availableFilters: Object.keys(availableFilters)
        }
      );
    }

    return filterName;
  }

  /**
   * 验证HTML内容
   * @param {*} html - HTML内容
   * @returns {string} 验证后的HTML
   * @throws {ValidationError} 验证失败时抛出
   */
  static validateHtml(html) {
    if (html === null || html === undefined) {
      return html;
    }

    if (typeof html !== 'string') {
      throw new ValidationError(
        `HTML must be a string, got ${typeof html}`,
        'html',
        html,
        { expectedType: 'string', actualType: typeof html }
      );
    }

    // 检查HTML长度
    if (html.length > 10 * 1024 * 1024) { // 10MB
      throw new ValidationError(
        'HTML content is too large (max 10MB)',
        'html',
        html,
        { maxSize: '10MB', actualSize: `${Math.round(html.length / 1024 / 1024)}MB` }
      );
    }

    return html;
  }
}

/**
 * 错误处理工具
 */
class ErrorHandler {
  /**
   * 包装函数以提供统一的错误处理
   * @param {Function} fn - 要包装的函数
   * @param {string} context - 错误上下文
   * @returns {Function} 包装后的函数
   */
  static wrap(fn, context = 'unknown') {
    return function(...args) {
      try {
        return fn.apply(this, args);
      } catch (error) {
        if (error instanceof ParseError) {
          // 重新抛出已知的解析错误
          throw error;
        }

        // 包装未知错误
        throw new ParseError(
          `${context}: ${error.message}`,
          { 
            originalError: error,
            context,
            args: args.map(arg => typeof arg === 'object' ? '[Object]' : String(arg))
          }
        );
      }
    };
  }

  /**
   * 安全执行函数，返回结果或错误信息
   * @param {Function} fn - 要执行的函数
   * @param {*} defaultValue - 默认返回值
   * @returns {*} 执行结果或默认值
   */
  static safeExecute(fn, defaultValue = null) {
    try {
      return fn();
    } catch (error) {
      console.warn('Safe execution failed:', error.message);
      return defaultValue;
    }
  }

  /**
   * 格式化错误信息
   * @param {Error} error - 错误对象
   * @returns {Object} 格式化的错误信息
   */
  static formatError(error) {
    const formatted = {
      name: error.name || 'Error',
      message: error.message,
      timestamp: new Date().toISOString()
    };

    if (error instanceof ParseError) {
      formatted.details = error.details;
    }

    if (error.stack) {
      formatted.stack = error.stack.split('\n').slice(0, 5); // 只保留前5行堆栈
    }

    return formatted;
  }
}

module.exports = {
  ParseError,
  QueryParseError,
  FilterError,
  SelectorError,
  ValidationError,
  Validator,
  ErrorHandler
};
