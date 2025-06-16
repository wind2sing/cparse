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

/**
 * 为 Axios 实例添加 Cheerio 支持
 *
 * @param {Object} instance - Axios 实例
 * @param {Object} [cheerioOptions={}] - Cheerio 选项
 * @param {boolean} [cheerioOptions.disable=false] - 是否禁用 Cheerio 注入
 * @param {boolean} [cheerioOptions.keepRelativeUrl=false] - 是否保持相对 URL
 * @returns {Object} 配置后的 Axios 实例
 *
 * @example
 * const axios = require('axios');
 * const { cheerioHookForAxios } = require('cparse');
 *
 * const client = axios.create();
 * cheerioHookForAxios(client);
 *
 * // 现在响应会自动包含 $ 属性
 * const response = await client.get('https://example.com');
 * const title = response.$('title').text();
 */
function cheerioHookForAxios(instance, cheerioOptions = {}) {
  if (!instance || !instance.interceptors) {
    throw new Error('Invalid Axios instance provided');
  }

  instance.interceptors.response.use((res) => {
    try {
      if (
        /^text\/(html|xml)(?:;.*)?/.test(res.headers['content-type']) &&
        res.data &&
        !cheerioOptions.disable
      ) {
        res.$ = loadCheerio(
          res.data,
          cheerioOptions,
          res.request?.res?.responseUrl || res.config?.url
        );
      }
    } catch (error) {
      console.warn('Failed to inject Cheerio into Axios response:', error.message);
      // 不抛出错误，只是警告，让响应继续
    }
    return res;
  });
  return instance;
}

/**
 * 为 Got 实例添加 Cheerio 支持
 *
 * @param {Object} instance - Got 实例
 * @param {Object} [cheerioOptions={}] - Cheerio 选项
 * @param {boolean} [cheerioOptions.disable=false] - 是否禁用 Cheerio 注入
 * @param {boolean} [cheerioOptions.keepRelativeUrl=false] - 是否保持相对 URL
 * @returns {Object} 配置后的 Got 实例
 *
 * @example
 * const got = require('got');
 * const { cheerioHookForGot } = require('cparse');
 *
 * const client = got.extend({});
 * cheerioHookForGot(client);
 *
 * const response = await client.get('https://example.com');
 * const title = response.$('title').text();
 */
function cheerioHookForGot(instance, cheerioOptions = {}) {
  if (!instance || !instance.defaults || !instance.defaults.options || !instance.defaults.options.hooks) {
    throw new Error('Invalid Got instance provided');
  }

  instance.defaults.options.hooks.afterResponse.push(
    (res) => {
      try {
        if (
          /^text\/(html|xml)(?:;.*)?/.test(res.headers['content-type']) &&
          res.body &&
          !cheerioOptions.disable
        ) {
          res.$ = loadCheerio(res.body, cheerioOptions, res.url);
        }
      } catch (error) {
        console.warn('Failed to inject Cheerio into Got response:', error.message);
        // 不抛出错误，只是警告，让响应继续
      }
      return res;
    }
  );
}
module.exports = {
  loadCheerio,
  cheerioHookForAxios,
  cheerioHookForGot,
};
