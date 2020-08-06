const log = require("debug")("crawlx-filters");

module.exports = {
  int: (v, defaultVal) => {
    let d = typeof defaultVal === "undefined" ? v : defaultVal;
    return parseInt(/\d+/.exec(v) || [d]);
  },
  float: (v, defaultVal) => {
    let d = typeof defaultVal === "undefined" ? v : defaultVal;
    return parseFloat(/[+-]?([0-9]*[.])?[0-9]+/.exec(d) || [d]);
  },
  bool: v => Boolean(v),
  trim: value => (typeof value === "string" ? value.trim() : value),
  slice: (value, start, end) => value.slice(start, end),
  reverse: value =>
    value
      .split("")
      .reverse()
      .join(""),
  date: (v, append) => {
    if (append && typeof v === "string") v += append;
    let r = new Date(v);

    if (isNaN(r)) {
      let m = /(\d{4})\D*(\d{2})\D*(\d{2})\D*(\d{2}:\d{2}(:\d{2})?)?/.exec(v);
      if (m) {
        r = new Date(`${m[1]}-${m[2]}-${m[3]} ${m[4] || ""} ${append || ""}`);
      }
    }
    return r;
  },
  size: (() => {
    let debug = log.extend("parseSize");
    let validAmount = n => !isNaN(parseFloat(n)) && isFinite(n);
    let parsableUnit = u => u.match(/\D*/).pop() === u;
    return function(input) {
      let parsed = input.toString().match(/.*?([0-9\.,]+)(?:\s*)?(\w*).*/);
      if (!parsed) {
        debug(`Match failed: ${input}`);
        return input;
      }
      let amount = parsed[1].replace(",", ".");
      let unit = parsed[2];
      let validUnit = function(sourceUnit) {
        return sourceUnit === unit;
      };
      if (!validAmount(amount) || !parsableUnit(unit)) {
        debug("Can't interpret " + (input || "a blank string"));
        return input;
      }
      if (unit === "") return Math.round(Number(amount));

      let increments = [
        [["b", "bit", "bits"], 1 / 8],
        [["B", "Byte", "Bytes", "bytes"], 1],
        [["Kb"], 128],
        [["k", "K", "kb", "KB", "KiB", "Ki", "ki"], 1024],
        [["Mb"], 131072],
        [["m", "M", "mb", "MB", "MiB", "Mi", "mi"], Math.pow(1024, 2)],
        [["Gb"], 1.342e8],
        [["g", "G", "gb", "GB", "GiB", "Gi", "gi"], Math.pow(1024, 3)],
        [["Tb"], 1.374e11],
        [["t", "T", "tb", "TB", "TiB", "Ti", "ti"], Math.pow(1024, 4)],
        [["Pb"], 1.407e14],
        [["p", "P", "pb", "PB", "PiB", "Pi", "pi"], Math.pow(1024, 5)],
        [["Eb"], 1.441e17],
        [["e", "E", "eb", "EB", "EiB", "Ei", "ei"], Math.pow(1024, 6)]
      ];
      for (let i = 0; i < increments.length; i++) {
        let _increment = increments[i];

        if (_increment[0].some(validUnit)) {
          return Math.round(amount * _increment[1]);
        }
      }

      debug(unit + " doesn't appear to be a valid unit");
      return input;
    };
  })()
};
