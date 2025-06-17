/**
 * @fileoverview Cheerio 扩展模块
 * @module cheerio
 */

'use strict';
const cheerio = require('cheerio');
const absoluteUrl = require('./absolute-url');
const enablePlugin = require('./plugin');

/**
 * 在 Cheerio 实例上启用插件
 * @private
 * @param {CheerioAPI} $ - Cheerio 实例
 * @returns {CheerioAPI} 启用插件后的 Cheerio 实例
 */
function enablePluginOnInstance($) {
  if ($ && typeof $ === 'function') {
    enablePlugin($);
  }
  return $;
}

/**
 * 加载 HTML 字符串并返回扩展的 Cheerio 实例
 *
 * @param {string} text - HTML 字符串
 * @param {Object} [cheerioOptions] - Cheerio 选项
 * @param {boolean} [cheerioOptions.keepRelativeUrl=false] - 是否保持相对 URL
 * @param {string} [responseUrl] - 基础 URL，用于转换相对 URL 为绝对 URL
 * @returns {CheerioAPI} 扩展的 Cheerio 实例
 *
 * @example
 * const $ = loadCheerio('<div>Hello</div>');
 * console.log($('div').text()); // "Hello"
 *
 * @example
 * // 转换相对 URL 为绝对 URL
 * const html = '<a href="/page">Link</a>';
 * const $ = loadCheerio(html, {}, 'https://example.com');
 * console.log($('a').attr('href')); // "https://example.com/page"
 */
function loadCheerio(text, cheerioOptions, responseUrl) {
  // 参数验证
  if (typeof text !== 'string') {
    throw new Error('HTML text must be a string');
  }

  if (text.trim() === '') {
    console.warn('Warning: Empty HTML string provided to loadCheerio');
  }

  cheerioOptions = cheerioOptions || {};

  try {
    const $ = cheerio.load(text, cheerioOptions);

    // 在cheerio 1.0+中启用插件
    enablePluginOnInstance($);

    if (!cheerioOptions.keepRelativeUrl && responseUrl) {
      if (typeof responseUrl !== 'string') {
        throw new Error('Response URL must be a string');
      }
      absoluteUrl(responseUrl, $);
    }
    return $;
  } catch (error) {
    const errorMessage = `Failed to load HTML with Cheerio: ${error.message}`;
    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.htmlLength = text.length;
    enhancedError.options = cheerioOptions;
    throw enhancedError;
  }
}

module.exports = {
  loadCheerio,
};
