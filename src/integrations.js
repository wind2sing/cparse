/**
 * @fileoverview 通用 HTTP 客户端集成工厂
 * @module integrations
 */

'use strict';
const { loadCheerio } = require('./cheerio/index.js');

/**
 * 创建一个通用的 Cheerio 钩子函数，用于集成各种 HTTP 客户端。
 *
 * @param {object} options - 插件配置
 * @param {string} options.name - 插件名称 (e.g., 'Axios', 'Got')
 * @param {(instance: object) => boolean} options.validate - 验证客户端实例的函数
 * @param {(instance: object, hook: Function) => void} options.attach - 将钩子附加到实例的函数
 * @param {(response: object) => string} options.getBody - 从响应中获取 HTML body 的函数
 * @param {(response: object) => string} options.getUrl - 从响应中获取最终 URL 的函数
 * @returns {(instance: object, cheerioOptions?: object) => object} - 返回一个配置好的钩子函数
 */
function createCheerioHook({ name, validate, attach, getBody, getUrl }) {
  return function (instance, cheerioOptions = {}) {
    if (!validate(instance)) {
      throw new Error(`Invalid ${name} instance provided`);
    }

    const hook = (response) => {
      try {
        if (
          !response ||
          !response.headers ||
          !/^text\/(html|xml)(?:;.*)?/.test(response.headers['content-type']) ||
          cheerioOptions.disable
        ) {
          return response;
        }

        const body = getBody(response);
        if (!body) {
          return response;
        }

        const url = getUrl(response);
        response.$ = loadCheerio(body, cheerioOptions, url);
      } catch (error) {
        console.warn(`Failed to inject Cheerio into ${name} response:`, error.message);
      }
      return response;
    };

    attach(instance, hook);
    return instance;
  };
}

/**
 * 为 Axios 实例添加 Cheerio 支持
 */
const cheerioHookForAxios = createCheerioHook({
  name: 'Axios',
  validate: (instance) => instance && instance.interceptors && instance.interceptors.response,
  attach: (instance, hook) => instance.interceptors.response.use(hook),
  getBody: (response) => response.data,
  getUrl: (response) => response.request?.res?.responseUrl || response.config?.url,
});

/**
 * 为 Got 实例添加 Cheerio 支持
 */
const cheerioHookForGot = createCheerioHook({
  name: 'Got',
  validate: (instance) => instance && instance.defaults && instance.defaults.options && instance.defaults.options.hooks,
  attach: (instance, hook) => {
    const { hooks } = instance.defaults.options;
    if (!hooks.afterResponse) {
      hooks.afterResponse = [];
    }
    hooks.afterResponse.push(hook);
  },
  getBody: (response) => response.body,
  getUrl: (response) => response.url,
});

module.exports = {
  createCheerioHook,
  cheerioHookForAxios,
  cheerioHookForGot,
}; 