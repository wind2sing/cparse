/**
 * Regexps
 */

const rselector = /^([^@]*)(?:@\s*([\w-_:]+))?$/;
const rfilters = /\s*\|(?!\=)\s*/;
const filter_parser = require("./format-parser");

function queryParser(str) {
  if (typeof str !== "string") throw `query should be string:${str}`;
  str = str.trim();
  let getAll = false;
  if (str.startsWith("[") && str.endsWith("]")) {
    getAll = true;
    str = str.slice(1, -1).trim();
  }
  let filters = str.split(rfilters);
  var z = filters.shift();
  var m = z.match(rselector) || [];
  return {
    selector: m[1] ? m[1].trim() : m[1],
    attribute: m[2],
    filters: filters.length ? filter_parser(filters.join("|")) : [],
    getAll
  };
}
module.exports = queryParser;
