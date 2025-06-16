"use strict";
const cheerio = require("cheerio");
const absoluteUrl = require("./absolute-url");
const enablePlugin = require("./plugin");

// 在cheerio 1.0+中，需要在load后的实例上启用插件
function enablePluginOnInstance($) {
  if ($ && typeof $ === 'function') {
    enablePlugin($);
  }
  return $;
}

function loadCheerio(text, cheerioOptions, responseUrl) {
  cheerioOptions = cheerioOptions || {};
  const $ = cheerio.load(text, cheerioOptions);

  // 在cheerio 1.0+中启用插件
  enablePluginOnInstance($);

  if (!cheerioOptions.keepRelativeUrl && responseUrl) {
    absoluteUrl(responseUrl, $);
  }
  return $;
}

function cheerioHookForAxios(instance, cheerioOptions = {}) {
  instance.interceptors.response.use((res) => {
    if (
      /^text\/(html|xml)(?:;.*)?/.test(res.headers["content-type"]) &&
      res.body &&
      !cheerioOptions.disable
    ) {
      res.$ = loadCheerio(
        res.data,
        cheerioOptions,
        res.request.res.responseUrl
      );
    }
    return res;
  });
  return instance;
}

function cheerioHookForGot(instance, cheerioOptions = {}) {
  instance.defaults.options.hooks.afterResponse.push(
    (res, retryWithMergedOptions) => {
      if (
        /^text\/(html|xml)(?:;.*)?/.test(res.headers["content-type"]) &&
        res.body &&
        !cheerioOptions.disable
      ) {
        res.$ = loadCheerio(res.body, cheerioOptions, res.url);
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
