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

const filter_parser = require('./format-parser');

/**
 * 查询解析结果缓存
 * 避免重复解析相同的查询字符串
 */
const parseCache = new Map();

/**
 * 解析查询字符串
 *
 * @param {string} str - 查询字符串
 * @returns {Object} 解析结果
 * @returns {string|null} returns.selector - CSS 选择器
 * @returns {string|undefined} returns.attribute - 属性名
 * @returns {Array} returns.filters - 过滤器数组
 * @returns {boolean} returns.getAll - 是否获取所有匹配元素
 *
 * @example
 * queryParser('h1')              // { selector: 'h1', attribute: undefined, filters: [], getAll: false }
 * queryParser('[h1]')            // { selector: 'h1', attribute: undefined, filters: [], getAll: true }
 * queryParser('a@href')          // { selector: 'a', attribute: 'href', filters: [], getAll: false }
 * queryParser('span | trim | int') // { selector: 'span', attribute: undefined, filters: [...], getAll: false }
 */
function queryParser(str) {
  // 参数验证
  if (typeof str !== 'string') {
    throw new Error(`Query should be string, got ${typeof str}: ${str}`);
  }

  // 检查缓存
  if (parseCache.has(str)) {
    return parseCache.get(str);
  }

  // 去除首尾空白
  str = str.trim();

  if (str === '') {
    throw new Error('Query string cannot be empty');
  }

  // 检查是否需要获取所有匹配元素 (用方括号包围)
  let getAll = false;
  if (str.startsWith('[') && str.endsWith(']')) {
    getAll = true;
    str = str.slice(1, -1).trim();

    if (str === '') {
      throw new Error('Empty selector inside brackets');
    }
  }

  // 分割过滤器
  const filters = str.split(rfilters);
  const selectorPart = filters.shift();

  // 解析选择器和属性
  const match = selectorPart.match(rselector) || [];
  const selector = match[1] ? match[1].trim() : match[1];
  const attribute = match[2];

  // 解析过滤器
  const parsedFilters = filters.length ? filter_parser(filters.join('|')) : [];

  const result = {
    selector: selector || null,
    attribute,
    filters: parsedFilters,
    getAll
  };

  // 缓存结果（限制缓存大小避免内存泄漏）
  if (parseCache.size < 1000) {
    parseCache.set(str, result);
  }

  return result;
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
