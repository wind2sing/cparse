/**
 * @fileoverview 内置过滤器集合
 * @module filters
 */

/**
 * 调试输出函数
 * @private
 */
const debug = function () {
  console.error(...arguments);
};

/**
 * 内置过滤器对象
 * 包含各种数据转换和处理函数
 */
module.exports = {
  /**
   * 转换为整数
   * @param {*} v - 输入值
   * @param {*} [defaultVal] - 默认值
   * @returns {number} 整数值
   * @example
   * int("123") // 123
   * int("abc", 0) // 0
   */
  int: (v, defaultVal) => {
    const defaultValue = typeof defaultVal === 'undefined' ? v : defaultVal;
    const match = String(v).match(/\d+/);
    return parseInt(match ? match[0] : defaultValue, 10);
  },

  /**
   * 转换为浮点数
   * @param {*} v - 输入值
   * @param {*} [defaultVal] - 默认值
   * @returns {number} 浮点数值
   * @example
   * float("123.45") // 123.45
   * float("abc", 0.0) // 0.0
   */
  float: (v, defaultVal) => {
    const defaultValue = typeof defaultVal === 'undefined' ? v : defaultVal;
    const match = String(defaultValue).match(/[+-]?([0-9]*[.])?[0-9]+/);
    return parseFloat(match ? match[0] : defaultValue);
  },

  /**
   * 转换为布尔值
   * @param {*} v - 输入值
   * @returns {boolean} 布尔值
   * @example
   * bool("true") // true
   * bool("") // false
   * bool(1) // true
   */
  bool: (v) => Boolean(v),

  /**
   * 去除字符串首尾空白
   * @param {*} value - 输入值
   * @returns {*} 处理后的值
   * @example
   * trim("  hello  ") // "hello"
   */
  trim: (value) => (typeof value === 'string' ? value.trim() : value),

  /**
   * 字符串切片
   * @param {*} value - 输入值
   * @param {number} start - 开始位置
   * @param {number} [end] - 结束位置
   * @returns {*} 切片结果
   * @example
   * slice("hello", 1, 3) // "el"
   */
  slice: (value, start, end) => {
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.slice(start, end);
    }
    return value;
  },

  /**
   * 字符串反转
   * @param {*} value - 输入值
   * @returns {*} 反转后的字符串
   * @example
   * reverse("hello") // "olleh"
   */
  reverse: (value) => {
    if (typeof value === 'string') {
      return value.split('').reverse().join('');
    }
    return value;
  },
  /**
   * 转换为日期对象
   * @param {*} v - 输入值
   * @param {string} [append] - 附加字符串（如时区）
   * @returns {Date} 日期对象
   * @example
   * date("2024-01-15") // Date object
   * date("2024-01-15", " UTC") // Date object with UTC timezone
   * date("20240115") // Date object (auto-parsed)
   */
  date: (v, append) => {
    if (append && typeof v === 'string') {
      v += append;
    }

    let result = new Date(v);

    // 如果标准解析失败，尝试自定义格式
    if (isNaN(result)) {
      const match = /(\d{4})\D*(\d{2})\D*(\d{2})\D*(\d{2}:\d{2}(:\d{2})?)?/.exec(String(v));
      if (match) {
        const dateStr = `${match[1]}-${match[2]}-${match[3]} ${match[4] || ''} ${append || ''}`;
        result = new Date(dateStr);
      }
    }

    return result;
  },
  /**
   * 解析尺寸字符串为字节数
   * @param {*} input - 输入值（如 "1.5MB", "256GB"）
   * @returns {number|*} 字节数或原始值（如果解析失败）
   * @example
   * size("1.5MB") // 1572864
   * size("256GB") // 274877906944
   * size("invalid") // "invalid"
   */
  size: (() => {
    const validAmount = (n) => !isNaN(parseFloat(n)) && isFinite(n);
    const parsableUnit = (u) => u.match(/\D*/).pop() === u;

    return function (input) {
      if(typeof input !== 'string') return input;
      let parsed = input.toString().match(/.*?([0-9.,]+)(?:\s*)?(\w*).*/);
      if (!parsed) {
        debug(`Match failed: ${input}`);
        return input;
      }
      let amount = parsed[1].replace(',', '.');
      let unit = parsed[2];
      let validUnit = function (sourceUnit) {
        return sourceUnit === unit;
      };
      if (!validAmount(amount) || !parsableUnit(unit)) {
        debug('Can\'t interpret ' + (input || 'a blank string'));
        return input;
      }
      if (unit === '') return Math.round(Number(amount));

      let increments = [
        [['b', 'bit', 'bits'], 1 / 8],
        [['B', 'Byte', 'Bytes', 'bytes'], 1],
        [['Kb'], 128],
        [['k', 'K', 'kb', 'KB', 'KiB', 'Ki', 'ki'], 1024],
        [['Mb'], 131072],
        [['m', 'M', 'mb', 'MB', 'MiB', 'Mi', 'mi'], Math.pow(1024, 2)],
        [['Gb'], 1.342e8],
        [['g', 'G', 'gb', 'GB', 'GiB', 'Gi', 'gi'], Math.pow(1024, 3)],
        [['Tb'], 1.374e11],
        [['t', 'T', 'tb', 'TB', 'TiB', 'Ti', 'ti'], Math.pow(1024, 4)],
        [['Pb'], 1.407e14],
        [['p', 'P', 'pb', 'PB', 'PiB', 'Pi', 'pi'], Math.pow(1024, 5)],
        [['Eb'], 1.441e17],
        [['e', 'E', 'eb', 'EB', 'EiB', 'Ei', 'ei'], Math.pow(1024, 6)],
      ];
      for (let i = 0; i < increments.length; i++) {
        let _increment = increments[i];

        if (_increment[0].some(validUnit)) {
          return Math.round(amount * _increment[1]);
        }
      }

      debug(unit + ' doesn\'t appear to be a valid unit');
      return input;
    };
  })(),
};
