/**
 * @fileoverview 数据解析核心模块
 * @module parse
 */

const queryParser = require('./query-parser');
const defaultFilters = require('./filters');

/**
 * 解析单个查询规则
 * @private
 * @param {string|Function} query - 查询规则或函数
 * @param {CheerioAPI} $ - Cheerio 实例
 * @param {Object} filters - 过滤器对象
 * @returns {*} 解析结果
 */
function parse_one(query, $, filters) {
  if (typeof query === 'function') return query();

  let q = queryParser(query);
  let vals;

  if (q.selector) vals = $(q.selector).extractAll(q.attribute);
  else
    vals = $()
      .addBack()
      .extractAll(q.attribute);

  // filters operation
  if (q.getAll) {
    for (const filterInfo of q.filters) {
      let name = filterInfo['name'];
      vals = vals.map(val => {
        return filters[name](val, ...filterInfo['args']);
      });
    }
    return vals;
  } else {
    let val = vals[0];
    for (const filterInfo of q.filters) {
      let name = filterInfo['name'];
      try {
        if (!filters[name]) {
          throw new Error(`Unknown filter: ${name}. Available filters: ${Object.keys(filters).join(', ')}`);
        }
        val = filters[name](val, ...filterInfo['args']);
      } catch (error) {
        const errorMessage = `Parse error in query "${query}" with filter "${name}": ${error.message}`;
        console.error(errorMessage);
        const enhancedError = new Error(errorMessage);
        enhancedError.originalError = error;
        enhancedError.query = query;
        enhancedError.filter = name;
        enhancedError.value = val;
        throw enhancedError;
      }
    }
    return val;
  }
}

/**
 * 判断是否需要使用分割器语法
 * @private
 * @param {Array} queries - 查询数组
 * @returns {boolean} 是否需要分割
 */
function shouldDivide(queries) {
  return queries.length > 1 && typeof queries[1] !== 'function';
}

/**
 * 数据解析主函数
 *
 * @param {string|Object|Array|Function} rule - 解析规则
 * @param {CheerioAPI} $ - Cheerio 实例
 * @param {Object} [filters] - 自定义过滤器
 * @returns {*} 解析结果
 *
 * @example
 * // 基本用法
 * parse('h1', $)                    // 提取第一个 h1 的文本
 * parse('[h1]', $)                  // 提取所有 h1 的文本数组
 * parse('a@href', $)                // 提取第一个链接的 href 属性
 *
 * @example
 * // 使用过滤器
 * parse('span | int', $)            // 提取数字并转换为整数
 * parse('span | trim | slice:0:10', $) // 去空格后截取前10个字符
 *
 * @example
 * // 结构化数据
 * parse({
 *   title: 'h1',
 *   links: '[a@href]',
 *   count: '.count | int'
 * }, $)
 *
 * @example
 * // 分割器语法
 * parse(['[.item]', {
 *   name: '.name',
 *   price: '.price | float'
 * }], $)
 *
 * @example
 * // 函数处理
 * parse(['h1', text => text.toUpperCase()], $)
 */
function parse(rule, $, filters) {
  // 参数验证
  if (rule === undefined || rule === null) {
    throw new Error('Parse rule cannot be undefined or null');
  }

  if (!$ || typeof $ !== 'function') {
    throw new Error('Cheerio instance ($) is required and must be a function');
  }

  // 合并过滤器
  filters = {
    ...defaultFilters,
    ...filters
  };
  if (Array.isArray(rule)) {
    if (shouldDivide(rule)) {
      // ['[.quote]', {...} , func, func ...]
      let divider = rule[0];
      rule = rule.slice(1);
      let q = queryParser(divider);

      if (q.getAll) {
        let vals = [];
        $(q.selector).each((i, el) => {
          let child = $(el);
          vals[i] = parse(rule, child.find.bind(child), filters);
        });
        return vals;
      } else {
        let child = $(q.selector).eq(0);
        if (child.length) return parse(rule, child.find.bind(child), filters);
        else return;
      }
    }
    // [rule, func, func...]
    let query = rule[0],
      toFilters = rule.slice(1);
    let val = parse(query, $, filters);
    return toFilters.reduce((v, toFilter) => toFilter(v), val);
  } else if (typeof rule === 'object') {
    // {a:'..', b: [...]}
    return Object.entries(rule).reduce((obj, [k, v]) => {
      obj[k] = parse(v, $, filters);
      return obj;
    }, {});
  } else {
    // '...'
    return parse_one(rule, $, filters);
  }
}
module.exports = parse;
