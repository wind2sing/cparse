const parse = require("./src/parse");
const cheerio = require("./src/cheerio");
const { loadCheerio, cheerioHookForAxios, cheerioHookForGot } = cheerio;
module.exports = {
  parse,
  loadCheerio,
  cheerioHookForAxios,
  cheerioHookForGot,
};
