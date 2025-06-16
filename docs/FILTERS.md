# 过滤器参考文档

cparse 提供了30+个内置过滤器，用于数据转换和处理。

## 数据类型转换

### int
将值转换为整数。

**语法:** `int` 或 `int:defaultValue`

**参数:**
- `defaultValue` (number, 可选): 转换失败时的默认值，默认为0

**示例:**
```javascript
parse('.count | int', $)        // "123" -> 123
parse('.count | int:0', $)      // "abc" -> 0
parse('.count | int:-1', $)     // "" -> -1
```

### float
将值转换为浮点数。

**语法:** `float` 或 `float:defaultValue`

**参数:**
- `defaultValue` (number, 可选): 转换失败时的默认值，默认为0.0

**示例:**
```javascript
parse('.price | float', $)      // "3.14" -> 3.14
parse('.price | float:0', $)    // "abc" -> 0.0
```

### bool
将值转换为布尔值。

**语法:** `bool`

**转换规则:**
- 空字符串、null、undefined、0 -> false
- 其他值 -> true

**示例:**
```javascript
parse('.active | bool', $)      // "true" -> true
parse('.empty | bool', $)       // "" -> false
```

### number
格式化数字，保留指定小数位。

**语法:** `number` 或 `number:decimals`

**参数:**
- `decimals` (number, 可选): 小数位数，默认为2

**示例:**
```javascript
parse('.price | number', $)     // 123.456 -> "123.46"
parse('.price | number:0', $)   // 123.456 -> "123"
parse('.price | number:4', $)   // 123.456 -> "123.4560"
```

## 字符串处理

### trim
去除字符串首尾空白字符。

**语法:** `trim`

**示例:**
```javascript
parse('.text | trim', $)        // "  hello  " -> "hello"
```

### slice
字符串切片。

**语法:** `slice:start:end`

**参数:**
- `start` (number): 开始位置
- `end` (number, 可选): 结束位置

**示例:**
```javascript
parse('.text | slice:0:5', $)   // "hello world" -> "hello"
parse('.text | slice:6:', $)    // "hello world" -> "world"
parse('.text | slice:-5:', $)   // "hello world" -> "world"
```

### reverse
字符串反转。

**语法:** `reverse`

**示例:**
```javascript
parse('.text | reverse', $)     // "hello" -> "olleh"
```

### regex
正则表达式匹配。

**语法:** `regex:pattern` 或 `regex:pattern:flags`

**参数:**
- `pattern` (string): 正则表达式模式
- `flags` (string, 可选): 正则表达式标志

**示例:**
```javascript
parse('.text | regex:\\d+', $)      // "abc123def" -> ["123"]
parse('.text | regex:\\w+:g', $)    // "hello world" -> ["hello", "world"]
```

### replace
字符串替换。

**语法:** `replace:search:replacement` 或 `replace:search:replacement:flags`

**参数:**
- `search` (string): 搜索字符串或正则表达式
- `replacement` (string): 替换字符串
- `flags` (string, 可选): 正则表达式标志

**示例:**
```javascript
parse('.text | replace:old:new', $)         // "old text" -> "new text"
parse('.text | replace:\\d+:X:g', $)        // "abc123def456" -> "abcXdefX"
```

### split
字符串分割。

**语法:** `split:separator` 或 `split:separator:limit`

**参数:**
- `separator` (string): 分隔符
- `limit` (number, 可选): 限制分割数量

**示例:**
```javascript
parse('.text | split:,', $)         // "a,b,c" -> ["a", "b", "c"]
parse('.text | split:,:2', $)       // "a,b,c,d" -> ["a", "b"]
```

### join
数组连接为字符串。

**语法:** `join` 或 `join:separator`

**参数:**
- `separator` (string, 可选): 连接符，默认为逗号

**示例:**
```javascript
parse('[.items] | join', $)         // ["a", "b", "c"] -> "a,b,c"
parse('[.items] | join:-', $)       // ["a", "b", "c"] -> "a-b-c"
```

### capitalize
首字母大写。

**语法:** `capitalize`

**示例:**
```javascript
parse('.text | capitalize', $)      // "hello world" -> "Hello world"
```

### upper
转换为大写。

**语法:** `upper`

**示例:**
```javascript
parse('.text | upper', $)           // "hello" -> "HELLO"
```

### lower
转换为小写。

**语法:** `lower`

**示例:**
```javascript
parse('.text | lower', $)           // "HELLO" -> "hello"
```

### title
标题格式化（每个单词首字母大写）。

**语法:** `title`

**示例:**
```javascript
parse('.text | title', $)           // "hello world" -> "Hello World"
```

## 数组和对象处理

### length
获取字符串或数组的长度。

**语法:** `length`

**示例:**
```javascript
parse('.text | length', $)          // "hello" -> 5
parse('[.items] | length', $)       // ["a", "b", "c"] -> 3
```

### first
获取数组第一个元素或字符串第一个字符。

**语法:** `first`

**示例:**
```javascript
parse('[.items] | first', $)        // ["a", "b", "c"] -> "a"
parse('.text | first', $)           // "hello" -> "h"
```

### last
获取数组最后一个元素或字符串最后一个字符。

**语法:** `last`

**示例:**
```javascript
parse('[.items] | last', $)         // ["a", "b", "c"] -> "c"
parse('.text | last', $)            // "hello" -> "o"
```

### unique
数组去重。

**语法:** `unique`

**示例:**
```javascript
parse('[.items] | unique', $)       // [1, 2, 2, 3] -> [1, 2, 3]
```

### sort
数组排序。

**语法:** `sort` 或 `sort:order`

**参数:**
- `order` (string, 可选): 排序方向，"asc"（升序）或"desc"（降序），默认为"asc"

**示例:**
```javascript
parse('[.items] | sort', $)         // [3, 1, 2] -> [1, 2, 3]
parse('[.items] | sort:desc', $)    // [3, 1, 2] -> [3, 2, 1]
```

### compact
过滤数组中的空值（null、undefined、空字符串、0、NaN）。

**语法:** `compact`

**示例:**
```javascript
parse('[.items] | compact', $)      // [1, null, 2, "", 3, 0] -> [1, 2, 3, false]
```

## 日期处理

### date
将字符串转换为日期对象。

**语法:** `date` 或 `date:timezone`

**参数:**
- `timezone` (string, 可选): 时区，如"UTC"

**示例:**
```javascript
parse('.date | date', $)            // "2024-01-15" -> Date对象
parse('.date | date:UTC', $)        // 指定UTC时区
```

## 尺寸处理

### size
解析尺寸字符串为字节数。

**语法:** `size`

**支持的单位:** B, KB, MB, GB, TB

**示例:**
```javascript
parse('.filesize | size', $)        // "1.5MB" -> 1572864
parse('.filesize | size', $)        // "1KB" -> 1024
```

## 自定义过滤器

你可以通过第三个参数传递自定义过滤器：

```javascript
const customFilters = {
  double: (value) => value * 2,
  prefix: (value, prefix) => prefix + value
};

const result = parse('.number | double | prefix:$', $, customFilters);
// 如果 .number 的值是 "5"，结果将是 "$10"
```

## 过滤器链

过滤器可以链式调用：

```javascript
parse('.text | trim | upper | slice:0:10', $)
// 1. 去除空白
// 2. 转换为大写
// 3. 截取前10个字符
```

## 错误处理

当过滤器执行失败时，会抛出 `FilterError`：

```javascript
try {
  parse('.text | unknownFilter', $);
} catch (error) {
  console.log(error.name);        // "FilterError"
  console.log(error.filterName);  // "unknownFilter"
  console.log(error.value);       // 处理的值
}
```

## 性能提示

1. **避免复杂的正则表达式**：复杂的正则可能影响性能
2. **合理使用过滤器链**：过长的过滤器链可能降低可读性
3. **缓存重复计算**：对于相同的过滤器操作，结果会被缓存
