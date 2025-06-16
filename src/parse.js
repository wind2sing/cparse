/**
 * @fileoverview 数据解析核心模块 - 简化版，专注于语法糖和过滤器
 * @module parse
 */

const queryParser = require('./query-parser');
const defaultFilters = require('./filters');
const { FilterError } = require('./errors');

/**
 * 解析单个查询规则 - 简化版
 * @private
 * @param {string|Function} query - 查询规则或函数
 * @param {CheerioAPI} $ - Cheerio 实例
 * @param {Object} filters - 过滤器对象
 * @returns {*} 解析结果
 */
function parse_one(query, $, filters) {
  if (typeof query === 'function') return query();

  const q = queryParser(query);

  // 直接使用 Cheerio 原生选择器（已经处理了语法糖转换）
  const elements = q.selector ? $(q.selector) : $().addBack();

  // 提取值
  let vals = elements.extractAll(q.attribute);

  // 应用过滤器
  if (q.getAll) {
    // 处理数组结果
    for (const filterInfo of q.filters) {
      const name = filterInfo['name'];
      vals = vals.map(val => {
        return filters[name](val, ...filterInfo['args']);
      });
    }
    return vals;
  } else {
    // 处理单个结果
    let val = vals[0];
    for (const filterInfo of q.filters) {
      const name = filterInfo['name'];
      try {
        if (!filters[name]) {
          throw new FilterError(
            `Unknown filter: ${name}`,
            name,
            val,
            {
              availableFilters: Object.keys(filters),
              query
            }
          );
        }
        val = filters[name](val, ...filterInfo['args']);
      } catch (error) {
        if (error instanceof FilterError) {
          throw error;
        }
        throw new FilterError(
          `Filter "${name}" failed: ${error.message}`,
          name,
          val,
          {
            originalError: error,
            query,
            args: filterInfo['args']
          }
        );
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
