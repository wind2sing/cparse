const queryParser = require("./query-parser");
const defaultFilters = require("./filters");

function parse_one(query, $, filters) {
  if (typeof query === "function") return query();

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
      let name = filterInfo["name"];
      vals = vals.map(val => {
        return filters[name](val, ...filterInfo["args"]);
      });
    }
    return vals;
  } else {
    let val = vals[0];
    for (const filterInfo of q.filters) {
      let name = filterInfo["name"];
      try {
        val = filters[name](val, ...filterInfo["args"]);
      } catch (error) {
        console.error(`Parse error in query:`, query);
        throw error;
      }
    }
    return val;
  }
}

function shouldDivide(queries) {
  return queries.length > 1 && typeof queries[1] !== "function";
}

function parse(rule, $, filters) {
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
  } else if (typeof rule === "object") {
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
