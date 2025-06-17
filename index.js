/**
 * cparse - 一个基于 Cheerio 的 HTML 解析和数据提取工具库
 *
 * @author wind2sing
 * @version 2.0.3
 * @license MIT
 */

const parse = require('./src/parse');
const { loadCheerio } = require('./src/cheerio');
const {
  createCheerioHook,
  cheerioHookForAxios,
  cheerioHookForGot,
} = require('./src/integrations');

/**
 * cparse 主要导出模块
 * @namespace cparse
 */
module.exports = {
  /**
   * 数据解析函数
   * @type {Function}
   * @see {@link module:parse}
   */
  parse,

  /**
   * 加载 HTML 并返回 Cheerio 实例
   * @type {Function}
   * @see {@link module:cheerio.loadCheerio}
   */
  loadCheerio,

  /**
   * 创建通用 Cheerio 钩子的工厂函数
   * @type {Function}
   * @see {@link module:integrations.createCheerioHook}
   */
  createCheerioHook,

  /**
   * 为 Axios 添加 Cheerio 支持
   * @type {Function}
   * @see {@link module:cheerio.cheerioHookForAxios}
   */
  cheerioHookForAxios,

  /**
   * 为 Got 添加 Cheerio 支持
   * @type {Function}
   * @see {@link module:cheerio.cheerioHookForGot}
   */
  cheerioHookForGot,
};
