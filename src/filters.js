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
   * 正则表达式匹配
   * @param {*} value - 输入值
   * @param {string} pattern - 正则表达式模式
   * @param {string} [flags] - 正则表达式标志
   * @returns {*} 匹配结果或原始值
   * @example
   * regex("hello123", "\\d+") // ["123"]
   * regex("Hello World", "\\w+", "g") // ["Hello", "World"]
   */
  regex: (value, pattern, flags) => {
    if (typeof value !== 'string') return value;
    try {
      const regex = new RegExp(pattern, flags);
      const matches = value.match(regex);
      return matches ? Array.from(matches) : [];
    } catch (error) {
      console.warn(`Invalid regex pattern: ${pattern}`, error.message);
      return value;
    }
  },

  /**
   * 字符串替换
   * @param {*} value - 输入值
   * @param {string} search - 搜索字符串或正则表达式
   * @param {string} replacement - 替换字符串
   * @param {string} [flags] - 正则表达式标志（当search为正则时）
   * @returns {*} 替换后的字符串
   * @example
   * replace("hello world", "world", "universe") // "hello universe"
   * replace("hello123world456", "\\d+", "X", "g") // "helloXworldX"
   */
  replace: (value, search, replacement, flags) => {
    if (typeof value !== 'string') return value;
    try {
      if (flags) {
        // 使用正则表达式替换
        const regex = new RegExp(search, flags);
        return value.replace(regex, replacement);
      } else {
        // 简单字符串替换
        return value.replace(search, replacement);
      }
    } catch (error) {
      console.warn(`Invalid replace pattern: ${search}`, error.message);
      return value;
    }
  },

  /**
   * 字符串分割
   * @param {*} value - 输入值
   * @param {string} separator - 分隔符
   * @param {number} [limit] - 限制分割数量
   * @returns {*} 分割后的数组
   * @example
   * split("a,b,c", ",") // ["a", "b", "c"]
   * split("a,b,c,d", ",", 2) // ["a", "b"]
   */
  split: (value, separator, limit) => {
    if (typeof value !== 'string') return value;
    return value.split(separator, limit);
  },

  /**
   * 数组连接
   * @param {*} value - 输入值（数组）
   * @param {string} [separator=","] - 连接符
   * @returns {*} 连接后的字符串
   * @example
   * join(["a", "b", "c"], "-") // "a-b-c"
   * join(["a", "b", "c"]) // "a,b,c"
   */
  join: (value, separator = ',') => {
    if (Array.isArray(value)) {
      return value.join(separator);
    }
    return value;
  },

  /**
   * 首字母大写
   * @param {*} value - 输入值
   * @returns {*} 首字母大写的字符串
   * @example
   * capitalize("hello world") // "Hello world"
   */
  capitalize: (value) => {
    if (typeof value !== 'string') return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  },

  /**
   * 转换为大写
   * @param {*} value - 输入值
   * @returns {*} 大写字符串
   * @example
   * upper("hello") // "HELLO"
   */
  upper: (value) => {
    if (typeof value !== 'string') return value;
    return value.toUpperCase();
  },

  /**
   * 转换为小写
   * @param {*} value - 输入值
   * @returns {*} 小写字符串
   * @example
   * lower("HELLO") // "hello"
   */
  lower: (value) => {
    if (typeof value !== 'string') return value;
    return value.toLowerCase();
  },

  /**
   * 标题格式化（每个单词首字母大写）
   * @param {*} value - 输入值
   * @returns {*} 标题格式的字符串
   * @example
   * title("hello world") // "Hello World"
   */
  title: (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  /**
   * 获取字符串长度
   * @param {*} value - 输入值
   * @returns {*} 字符串长度或原始值
   * @example
   * length("hello") // 5
   * length([1,2,3]) // 3
   */
  length: (value) => {
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length;
    }
    return value;
  },

  /**
   * 获取数组第一个元素
   * @param {*} value - 输入值
   * @returns {*} 第一个元素或原始值
   * @example
   * first([1,2,3]) // 1
   * first("hello") // "h"
   */
  first: (value) => {
    if (Array.isArray(value)) {
      return value[0];
    }
    if (typeof value === 'string') {
      return value.length > 0 ? value[0] : undefined;
    }
    return value;
  },

  /**
   * 获取数组最后一个元素
   * @param {*} value - 输入值
   * @returns {*} 最后一个元素或原始值
   * @example
   * last([1,2,3]) // 3
   * last("hello") // "o"
   */
  last: (value) => {
    if (Array.isArray(value)) {
      return value[value.length - 1];
    }
    if (typeof value === 'string') {
      return value.length > 0 ? value[value.length - 1] : undefined;
    }
    return value;
  },

  /**
   * 数组去重
   * @param {*} value - 输入值
   * @returns {*} 去重后的数组或原始值
   * @example
   * unique([1,2,2,3,3,3]) // [1,2,3]
   */
  unique: (value) => {
    if (Array.isArray(value)) {
      return [...new Set(value)];
    }
    return value;
  },

  /**
   * 数组排序
   * @param {*} value - 输入值
   * @param {string} [order="asc"] - 排序方向：asc（升序）或desc（降序）
   * @returns {*} 排序后的数组或原始值
   * @example
   * sort([3,1,2]) // [1,2,3]
   * sort([3,1,2], "desc") // [3,2,1]
   */
  sort: (value, order = 'asc') => {
    if (Array.isArray(value)) {
      const sorted = [...value].sort((a, b) => {
        if (a < b) return order === 'asc' ? -1 : 1;
        if (a > b) return order === 'asc' ? 1 : -1;
        return 0;
      });
      return sorted;
    }
    return value;
  },

  /**
   * 数组过滤（移除空值）
   * @param {*} value - 输入值
   * @returns {*} 过滤后的数组或原始值
   * @example
   * compact([1, null, 2, undefined, 3, "", 4]) // [1, 2, 3, 4]
   */
  compact: (value) => {
    if (Array.isArray(value)) {
      return value.filter(item =>
        item !== null &&
        item !== undefined &&
        item !== '' &&
        item !== 0 &&
        !Number.isNaN(item)
      );
    }
    return value;
  },

  /**
   * 数字格式化
   * @param {*} value - 输入值
   * @param {number} [decimals=2] - 小数位数
   * @returns {*} 格式化后的数字字符串或原始值
   * @example
   * number(123.456, 2) // "123.46"
   * number(123.456, 0) // "123"
   */
  number: (value, decimals = 2) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toFixed(decimals);
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
