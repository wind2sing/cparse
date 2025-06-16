/**
 * @fileoverview 数据解析核心模块
 * @module parse
 */

const queryParser = require('./query-parser');
const defaultFilters = require('./filters');
const { FilterError } = require('./errors');

/**
 * 应用条件过滤
 * @private
 * @param {Object} elements - Cheerio 元素集合
 * @param {Object} condition - 条件对象
 * @returns {Object} 过滤后的元素集合
 */
function applyCondition(elements, condition) {
  if (!condition) return elements;

  switch (condition.type) {
  case 'first':
    return elements.first();
  case 'last':
    return elements.last();
  case 'empty':
    return elements.filter(':empty');
  case 'not-empty':
    return elements.filter(':not(:empty)');
  case 'contains':
    return elements.filter(`:contains("${condition.value}")`);
  case 'has-class':
    return elements.filter(`.${condition.value}`);
  case 'has-attribute':
    return elements.filter(`[${condition.attribute}]`);
  case 'attribute':
    return elements.filter(`[${condition.attribute}="${condition.value}"]`);
  case 'selector':
    return elements.filter(condition.value);
  case 'pseudo':
    return elements.filter(`:${condition.value}`);
  default:
    return elements;
  }
}

/**
 * 处理嵌套查询
 * @private
 * @param {Array} nested - 嵌套选择器数组
 * @param {CheerioAPI} $ - Cheerio 实例
 * @returns {Object} 最终的元素集合
 */
function processNested(nested, $) {
  let current = $(nested[0]);

  for (let i = 1; i < nested.length; i++) {
    current = current.find(nested[i]);
  }

  return current;
}

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
  let elements;

  // 处理嵌套查询
  if (q.nested) {
    elements = processNested(q.nested, $);
  } else if (q.selector) {
    elements = $(q.selector);
  } else {
    elements = $().addBack();
  }

  // 应用条件过滤
  if (q.condition) {
    elements = applyCondition(elements, q.condition);
  }

  // 提取值
  let vals = elements.extractAll(q.attribute);

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
