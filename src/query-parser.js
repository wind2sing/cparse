/**
 * @fileoverview 查询语法解析器
 * @module query-parser
 */

/**
 * 选择器和属性匹配正则表达式
 * 匹配格式: selector@attribute
 * 例如: "h1@text", "a@href", ".title"
 */
const rselector = /^([^@]*)(?:@\s*([\w-_:]+))?$/;

/**
 * 过滤器分割正则表达式
 * 匹配管道符 | 但不匹配 |=
 */
const rfilters = /\s*\|(?!=)\s*/;

/**
 * 条件查询正则表达式
 * 匹配格式: selector[condition] 或 selector:condition
 * 例如: "div[.active]", "li:first", "p:contains('text')"
 */
const rcondition = /^([^[\]:]+)(?:[[:]\s*([^\]\s]+)\s*]?)$/;

/**
 * 嵌套查询正则表达式
 * 匹配格式: selector > nested_selector
 * 例如: "div > .title", "ul > li > a"
 */
const rnested = /\s*>\s*/;

const filter_parser = require('./format-parser');
const { QueryParseError, Validator } = require('./errors');

/**
 * 查询解析结果缓存
 * 避免重复解析相同的查询字符串
 */
const parseCache = new Map();

/**
 * 解析条件查询
 * @param {string} condition - 条件字符串
 * @returns {Object} 条件对象
 */
function parseCondition(condition) {
  if (!condition) return null;

  // 处理类选择器 .class
  if (condition.startsWith('.')) {
    return {
      type: 'has-class',
      value: condition.slice(1)
    };
  }

  // 处理 contains('text') 格式
  const containsMatch = condition.match(/^contains\(['"]([^'"]*)['"]\)$/);
  if (containsMatch) {
    return {
      type: 'contains',
      value: containsMatch[1]
    };
  }

  // 处理属性条件 attr=value
  const attrMatch = condition.match(/^([^=]+)=(.+)$/);
  if (attrMatch) {
    return {
      type: 'attribute',
      attribute: attrMatch[1].trim(),
      value: attrMatch[2].trim().replace(/^['"]|['"]$/g, '')
    };
  }

  // 处理伪选择器
  switch (condition) {
  case 'first':
    return { type: 'first' };
  case 'last':
    return { type: 'last' };
  case 'empty':
    return { type: 'empty' };
  case 'not-empty':
    return { type: 'not-empty' };
  default:
    // 检查是否是属性存在性查询（没有等号的单词）
    if (/^\w+$/.test(condition)) {
      return {
        type: 'has-attribute',
        attribute: condition
      };
    }
    // 默认作为选择器条件
    return {
      type: 'selector',
      value: condition
    };
  }
}

/**
 * 解析嵌套查询
 * @param {string} selector - 选择器字符串
 * @returns {Array} 嵌套选择器数组
 */
function parseNested(selector) {
  if (!selector.includes('>')) {
    return [selector.trim()];
  }

  return selector.split(rnested).map(s => s.trim()).filter(s => s);
}

/**
 * 处理嵌套查询的解析
 * @param {Array} nested - 嵌套选择器数组
 * @returns {Object} 解析结果
 */
function processNestedQuery(nested) {
  const lastSelector = nested[nested.length - 1];
  const conditionMatch = lastSelector.match(rcondition);

  let selector, attribute, condition = null;

  if (conditionMatch) {
    const baseSelector = conditionMatch[1].trim();
    const conditionStr = conditionMatch[2];
    condition = parseCondition(conditionStr);

    // 更新嵌套数组中的最后一个选择器
    nested[nested.length - 1] = baseSelector;
  }

  // 解析属性
  const match = nested[nested.length - 1].match(rselector) || [];
  selector = match[1] ? match[1].trim() : match[1];
  attribute = match[2];

  // 更新嵌套数组中的最后一个选择器
  if (selector) {
    nested[nested.length - 1] = selector;
  }

  return { selector, attribute, condition };
}

/**
 * 处理单个选择器的解析
 * @param {string} selectorPart - 选择器部分
 * @returns {Object} 解析结果
 */
function processSingleQuery(selectorPart) {
  const conditionMatch = selectorPart.match(rcondition);
  let selector, attribute, condition = null;

  if (conditionMatch) {
    const baseSelector = conditionMatch[1].trim();
    const conditionStr = conditionMatch[2];
    condition = parseCondition(conditionStr);

    // 解析基础选择器和属性
    const match = baseSelector.match(rselector) || [];
    selector = match[1] ? match[1].trim() : match[1];
    attribute = match[2];
  } else {
    // 解析选择器和属性
    const match = selectorPart.match(rselector) || [];
    selector = match[1] ? match[1].trim() : match[1];
    attribute = match[2];
  }

  return { selector, attribute, condition };
}

/**
 * 解析查询字符串
 *
 * @param {string} str - 查询字符串
 * @returns {Object} 解析结果
 * @returns {string|null} returns.selector - CSS 选择器
 * @returns {string|undefined} returns.attribute - 属性名
 * @returns {Array} returns.filters - 过滤器数组
 * @returns {boolean} returns.getAll - 是否获取所有匹配元素
 * @returns {Object|null} returns.condition - 条件对象
 * @returns {Array} returns.nested - 嵌套选择器数组
 *
 * @example
 * queryParser('h1')              // { selector: 'h1', attribute: undefined, filters: [], getAll: false }
 * queryParser('[h1]')            // { selector: 'h1', attribute: undefined, filters: [], getAll: true }
 * queryParser('a@href')          // { selector: 'a', attribute: 'href', filters: [], getAll: false }
 * queryParser('span | trim | int') // { selector: 'span', attribute: undefined, filters: [...], getAll: false }
 * queryParser('div[.active]')    // { selector: 'div', condition: { type: 'has-class', value: 'active' }, ... }
 * queryParser('ul > li > a')     // { nested: ['ul', 'li', 'a'], ... }
 * queryParser('p:contains("text")') // { selector: 'p', condition: { type: 'contains', value: 'text' }, ... }
 */
function queryParser(str) {
  try {
    // 参数验证
    const validatedQuery = Validator.validateQuery(str);

    // 检查缓存
    if (parseCache.has(validatedQuery)) {
      return parseCache.get(validatedQuery);
    }

    const originalStr = validatedQuery;
    str = validatedQuery;

    // 检查是否需要获取所有匹配元素 (用方括号包围)
    let getAll = false;
    if (str.startsWith('[') && str.endsWith(']')) {
      getAll = true;
      str = str.slice(1, -1).trim();

      if (str === '') {
        throw new QueryParseError('Empty selector inside brackets', originalStr);
      }
    }

    // 分割过滤器
    const filters = str.split(rfilters);
    const selectorPart = filters.shift();

    // 检查是否有嵌套查询
    const nested = parseNested(selectorPart);
    const isNested = nested.length > 1;

    let selector, attribute, condition;

    if (isNested) {
      ({ selector, attribute, condition } = processNestedQuery(nested));
    } else {
      ({ selector, attribute, condition } = processSingleQuery(selectorPart));
    }

    // 解析过滤器
    const parsedFilters = filters.length ? filter_parser(filters.join('|')) : [];

    const result = {
      selector: selector || null,
      attribute,
      filters: parsedFilters,
      getAll,
      condition,
      nested: isNested ? nested : null
    };

    // 缓存结果（限制缓存大小避免内存泄漏）
    if (parseCache.size < 1000) {
      parseCache.set(originalStr, result);
    }

    return result;
  } catch (error) {
    if (error instanceof QueryParseError) {
      throw error;
    }
    throw new QueryParseError(`Failed to parse query: ${error.message}`, str, { originalError: error });
  }
}

/**
 * 清理查询解析缓存
 * 用于测试或内存管理
 */
queryParser.clearCache = function() {
  parseCache.clear();
};

/**
 * 获取缓存统计信息
 */
queryParser.getCacheStats = function() {
  return {
    size: parseCache.size,
    maxSize: 1000
  };
};

module.exports = queryParser;
