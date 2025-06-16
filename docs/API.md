# API 参考文档

## 核心函数

### loadCheerio(html, options?, baseUrl?)

加载HTML字符串并返回扩展的Cheerio实例。

**参数:**
- `html` (string): HTML字符串
- `options` (object, 可选): Cheerio选项
  - `keepRelativeUrl` (boolean): 是否保持相对URL，默认false
  - `xmlMode` (boolean): 是否使用XML模式，默认false
  - `decodeEntities` (boolean): 是否解码HTML实体，默认true
- `baseUrl` (string, 可选): 基础URL，用于转换相对URL为绝对URL

**返回:** 扩展的Cheerio实例

**示例:**
```javascript
const { loadCheerio } = require('cparse');

const $ = loadCheerio('<div>Hello</div>');
const $withBase = loadCheerio('<a href="/page">Link</a>', {}, 'https://example.com');
```

### parse(rule, $, filters?)

解析数据的核心函数。

**参数:**
- `rule` (string|object|array|function): 解析规则
  - string: CSS选择器查询
  - object: 对象结构解析
  - array: 分割器语法 `[selector, structure]`
  - function: 自定义处理函数
- `$` (Cheerio): Cheerio实例
- `filters` (object, 可选): 自定义过滤器对象

**返回:** 解析结果，类型取决于规则

**示例:**
```javascript
const { parse, loadCheerio } = require('cparse');

const $ = loadCheerio('<div class="title">Hello World</div>');

// 字符串规则
const title = parse('.title', $); // "Hello World"

// 对象规则
const data = parse({
  title: '.title',
  count: '.count | int'
}, $);

// 分割器规则
const items = parse([
  '[.item]',
  { name: '.name', price: '.price | float' }
], $);
```

## HTTP客户端集成

### cheerioHookForAxios(axiosInstance, options?)

为Axios实例添加Cheerio支持。

**参数:**
- `axiosInstance`: Axios实例
- `options` (object, 可选): Cheerio选项

**示例:**
```javascript
const axios = require('axios');
const { cheerioHookForAxios } = require('cparse');

const client = axios.create();
cheerioHookForAxios(client);

const response = await client.get('https://example.com');
const title = response.$('title').text();
```

### cheerioHookForGot(gotInstance, options?)

为Got实例添加Cheerio支持。

**参数:**
- `gotInstance`: Got实例
- `options` (object, 可选): Cheerio选项

**示例:**
```javascript
const got = require('got');
const { cheerioHookForGot } = require('cparse');

const client = got.extend({});
cheerioHookForGot(client);

const response = await client.get('https://example.com');
const title = response.$('title').text();
```

## Cheerio扩展方法

### .string()

提取元素的纯文本内容，不包括子元素的HTML标签。

**返回:** string

**示例:**
```javascript
$('<div>Hello <span>World</span></div>').string(); // "Hello "
```

### .nextNode()

获取下一个兄弟节点的文本值。

**返回:** string

**示例:**
```javascript
$('<div>Label: <span>Value</span></div>').find('div').nextNode(); // "Value"
```

### .extract(attr?)

提取单个元素的指定属性或内容。

**参数:**
- `attr` (string, 可选): 属性名，默认为'text'

**返回:** any

**支持的属性:**
- `text`: 文本内容
- `html`: HTML内容
- `outerHtml`: 包含元素本身的HTML
- `string`: 纯文本内容
- `nextNode`: 下一个兄弟节点文本
- 任何HTML属性名

**示例:**
```javascript
$('.item').extract();           // 文本内容
$('.item').extract('html');     // HTML内容
$('.item').extract('href');     // href属性
```

### .extractAll(attr?)

提取所有匹配元素的指定属性或内容。

**参数:**
- `attr` (string, 可选): 属性名，默认为'text'

**返回:** Array

**示例:**
```javascript
$('.items').extractAll();       // 所有元素的文本内容数组
$('.items').extractAll('href'); // 所有元素的href属性数组
```

## 错误处理

### 错误类型

#### ParseError
```javascript
class ParseError extends Error {
  constructor(message, details = {})
  // 属性: name, message, details
}
```

#### QueryParseError
```javascript
class QueryParseError extends ParseError {
  constructor(message, query, details = {})
  // 属性: name, message, query, details
}
```

#### FilterError
```javascript
class FilterError extends ParseError {
  constructor(message, filterName, value, details = {})
  // 属性: name, message, filterName, value, details
}
```

#### ValidationError
```javascript
class ValidationError extends ParseError {
  constructor(message, field, value, details = {})
  // 属性: name, message, field, value, details
}
```

### Validator类

#### Validator.validateQuery(query)
验证查询字符串。

**参数:**
- `query` (any): 待验证的查询

**返回:** string - 验证后的查询字符串

**抛出:** ValidationError

#### Validator.validateSelector(selector)
验证选择器。

**参数:**
- `selector` (any): 待验证的选择器

**返回:** string|null - 验证后的选择器

**抛出:** ValidationError

#### Validator.validateFilterName(filterName, availableFilters?)
验证过滤器名称。

**参数:**
- `filterName` (any): 待验证的过滤器名称
- `availableFilters` (object, 可选): 可用过滤器对象

**返回:** string - 验证后的过滤器名称

**抛出:** ValidationError

### ErrorHandler类

#### ErrorHandler.wrap(fn, context?)
包装函数以提供统一的错误处理。

**参数:**
- `fn` (Function): 要包装的函数
- `context` (string, 可选): 错误上下文

**返回:** Function - 包装后的函数

#### ErrorHandler.safeExecute(fn, defaultValue?)
安全执行函数，返回结果或默认值。

**参数:**
- `fn` (Function): 要执行的函数
- `defaultValue` (any, 可选): 默认返回值

**返回:** any - 执行结果或默认值

#### ErrorHandler.formatError(error)
格式化错误信息。

**参数:**
- `error` (Error): 错误对象

**返回:** Object - 格式化的错误信息

## 查询语法详解

### 基本选择器
- `h1`: 选择第一个h1元素
- `.class`: 选择第一个class类元素
- `#id`: 选择id元素
- `[selector]`: 选择所有匹配的元素

### 属性提取
- `selector@attr`: 提取指定属性
- `selector@text`: 提取文本内容（默认）
- `selector@html`: 提取HTML内容
- `selector@outerHtml`: 提取包含元素的HTML

### 条件查询
- `selector[.class]`: 包含指定类
- `selector[attr]`: 包含指定属性
- `selector[attr=value]`: 属性值匹配
- `selector:first`: 第一个元素
- `selector:last`: 最后一个元素
- `selector:empty`: 空元素
- `selector:contains("text")`: 包含文本

### 嵌套查询
- `parent > child`: 直接子元素
- `a > b > c`: 多级嵌套

### 过滤器
- `selector | filter`: 应用单个过滤器
- `selector | filter1 | filter2`: 过滤器链
- `selector | filter:arg1:arg2`: 带参数的过滤器

## 性能考虑

### 查询缓存
- 解析后的查询会自动缓存
- 缓存大小限制为1000个条目
- 使用 `queryParser.clearCache()` 清理缓存

### 最佳实践
1. 使用具体的选择器而不是通用选择器
2. 批量提取数据而不是多次单独查询
3. 合理使用过滤器链
4. 对于大量数据，考虑分批处理
