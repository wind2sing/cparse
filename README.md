# cparse

一个基于 Cheerio 的 HTML 解析和数据提取工具库。

## 特性

- 基于 Cheerio 1.1.0 构建，提供强大的 HTML 解析能力
- 扩展了 Cheerio 的功能，添加了便捷的数据提取方法
- 支持 Axios 和 Got HTTP 客户端的集成
- 提供丰富的过滤器用于数据处理（30+ 内置过滤器）
- 支持相对 URL 转换为绝对 URL
- 支持条件查询和嵌套查询语法
- 完善的错误处理和验证机制
- 高性能设计，支持大规模数据处理
- 完整的 TypeScript 类型支持（即将推出）

## 安装

```bash
npm install cparse
```

## 基本用法

### 加载 HTML

```javascript
const { loadCheerio } = require('cparse');

const html = '<div class="title">Hello World</div>';
const $ = loadCheerio(html);

console.log($('.title').text()); // "Hello World"
```

### 数据解析

```javascript
const { parse, loadCheerio } = require('cparse');

const html = `
<ul id="fruits">
  <li class="apple">Apple</li>
  <li class="orange">Orange</li>
  <li class="pear">Pear</li>
</ul>
`;

const $ = loadCheerio(html);

// 提取单个值
const firstFruit = parse('#fruits li', $); // "Apple"

// 提取所有值
const allFruits = parse('[#fruits li]', $); // ["Apple", "Orange", "Pear"]

// 使用过滤器
const numbers = parse('[.number | int]', $); // 将文本转换为整数
```

### HTTP 客户端集成

#### Axios 集成

```javascript
const axios = require('axios');
const { cheerioHookForAxios } = require('cparse');

const client = axios.create();
cheerioHookForAxios(client);

// 现在响应会自动包含 $ 属性
const response = await client.get('https://example.com');
const title = response.$('title').text();
```

#### Got 集成

```javascript
const got = require('got');
const { cheerioHookForGot } = require('cparse');

const client = got.extend({});
cheerioHookForGot(client);

const response = await client.get('https://example.com');
const title = response.$('title').text();

## 高级用法

### 复杂数据提取

```javascript
const { parse, loadCheerio } = require('cparse');

const html = `
<div class="product">
  <h2 class="title">iPhone 15</h2>
  <span class="price">$999.00</span>
  <div class="specs">
    <span class="storage">128GB</span>
    <span class="color">Blue</span>
  </div>
  <div class="rating" data-score="4.5">★★★★☆</div>
</div>
`;

const $ = loadCheerio(html);

// 提取结构化数据
const product = parse({
  title: '.title',
  price: '.price | float',
  storage: '.specs .storage',
  color: '.specs .color',
  rating: '.rating@data-score | float'
}, $);

console.log(product);
// {
//   title: "iPhone 15",
//   price: 999.00,
//   storage: "128GB",
//   color: "Blue",
//   rating: 4.5
// }
```

### 列表数据处理

```javascript
const html = `
<ul class="products">
  <li data-id="1">Product A - $10.99</li>
  <li data-id="2">Product B - $15.50</li>
  <li data-id="3">Product C - $8.75</li>
</ul>
`;

const $ = loadCheerio(html);

// 使用分割器提取列表数据
const products = parse([
  '[.products li]',
  {
    id: '@data-id | int',
    name: 'text | slice:0:-8 | trim',
    price: 'text | slice:-6: | float'
  }
], $);

console.log(products);
// [
//   { id: 1, name: "Product A", price: 10.99 },
//   { id: 2, name: "Product B", price: 15.50 },
//   { id: 3, name: "Product C", price: 8.75 }
// ]
```

### 条件处理和函数

```javascript
// 使用函数进行条件处理
const result = parse([
  '.content',
  (text) => text.includes('重要') ? text.toUpperCase() : text,
  (text) => text.replace(/\s+/g, ' ').trim()
], $);
```
```

## 扩展方法

cparse 为 Cheerio 添加了以下扩展方法：

### `.string()`
提取元素的纯文本内容（不包括子元素的标签）

```javascript
$('.content').string()
```

### `.nextNode()`
获取下一个兄弟节点的文本值

```javascript
$('.label').nextNode()
```

### `.extract(attr)`
提取单个元素的指定属性或内容

```javascript
$('.item').extract('text')    // 文本内容
$('.item').extract('html')    // HTML 内容
$('.item').extract('href')    // href 属性
```

### `.extractAll(attr)`
提取所有匹配元素的指定属性或内容

```javascript
$('.items').extractAll('text')  // 所有元素的文本内容数组
```

## 过滤器

cparse 提供了丰富的过滤器用于数据处理：

### 数据类型转换
- `int`: 转换为整数，支持默认值
  ```javascript
  parse('span | int', $)        // 提取数字
  parse('span | int:0', $)      // 提取数字，默认值为0
  ```

- `float`: 转换为浮点数
  ```javascript
  parse('.price | float', $)    // "3.14" -> 3.14
  ```

- `bool`: 转换为布尔值
  ```javascript
  parse('.active | bool', $)    // 任何非空值为true
  ```

### 字符串处理
- `trim`: 去除首尾空白
  ```javascript
  parse('.title | trim', $)     // "  Hello  " -> "Hello"
  ```

- `slice`: 字符串切片
  ```javascript
  parse('.text | slice:0:10', $)  // 截取前10个字符
  ```

- `reverse`: 字符串反转
  ```javascript
  parse('.text | reverse', $)   // "hello" -> "olleh"
  ```

- `regex`: 正则表达式匹配
  ```javascript
  parse('.text | regex:\\d+', $)      // 提取数字
  parse('.text | regex:\\w+:g', $)    // 提取所有单词
  ```

- `replace`: 字符串替换
  ```javascript
  parse('.text | replace:old:new', $)     // 简单替换
  parse('.text | replace:\\d+:X:g', $)    // 正则替换
  ```

- `split`: 字符串分割
  ```javascript
  parse('.text | split:,', $)         // 按逗号分割
  parse('.text | split:,:2', $)       // 限制分割数量
  ```

- `join`: 数组连接
  ```javascript
  parse('[.items] | join:-', $)       // 用连字符连接
  ```

- `capitalize`: 首字母大写
  ```javascript
  parse('.text | capitalize', $)      // "hello world" -> "Hello world"
  ```

- `upper`: 转换为大写
  ```javascript
  parse('.text | upper', $)           // "hello" -> "HELLO"
  ```

- `lower`: 转换为小写
  ```javascript
  parse('.text | lower', $)           // "HELLO" -> "hello"
  ```

- `title`: 标题格式化
  ```javascript
  parse('.text | title', $)           // "hello world" -> "Hello World"
  ```

### 数组和对象处理
- `length`: 获取长度
  ```javascript
  parse('[.items] | length', $)       // 数组长度
  parse('.text | length', $)          // 字符串长度
  ```

- `first`: 获取第一个元素
  ```javascript
  parse('[.items] | first', $)        // 数组第一个元素
  parse('.text | first', $)           // 字符串第一个字符
  ```

- `last`: 获取最后一个元素
  ```javascript
  parse('[.items] | last', $)         // 数组最后一个元素
  parse('.text | last', $)            // 字符串最后一个字符
  ```

- `unique`: 数组去重
  ```javascript
  parse('[.items] | unique', $)       // 去除重复元素
  ```

- `sort`: 数组排序
  ```javascript
  parse('[.items] | sort', $)         // 升序排序
  parse('[.items] | sort:desc', $)    // 降序排序
  ```

- `compact`: 过滤空值
  ```javascript
  parse('[.items] | compact', $)      // 移除null、undefined、空字符串等
  ```

### 数字处理
- `number`: 数字格式化
  ```javascript
  parse('.price | number:2', $)       // 保留2位小数
  parse('.price | number:0', $)       // 整数格式
  ```

### 日期处理
- `date`: 转换为日期对象，支持时区
  ```javascript
  parse('.date | date', $)      // 解析日期字符串
  parse('.date | date:UTC', $)  // 指定UTC时区
  ```

### 尺寸解析
- `size`: 解析尺寸字符串
  ```javascript
  parse('.filesize | size', $)  // "1.5MB" -> 解析为字节数
  ```

## API 参考

### loadCheerio(html, options?, baseUrl?)

加载HTML字符串并返回Cheerio实例。

**参数:**
- `html` (string): HTML字符串
- `options` (object, 可选): Cheerio选项
  - `keepRelativeUrl` (boolean): 是否保持相对URL，默认false
- `baseUrl` (string, 可选): 基础URL，用于转换相对URL为绝对URL

**返回:** Cheerio实例

### parse(rule, $, filters?)

解析数据的核心函数。

**参数:**
- `rule` (string|object|array): 解析规则
- `$` (Cheerio): Cheerio实例
- `filters` (object, 可选): 自定义过滤器

**返回:** 解析结果

### cheerioHookForAxios(axiosInstance, options?)

为Axios实例添加Cheerio支持。

**参数:**
- `axiosInstance`: Axios实例
- `options` (object, 可选): Cheerio选项

### cheerioHookForGot(gotInstance, options?)

为Got实例添加Cheerio支持。

**参数:**
- `gotInstance`: Got实例
- `options` (object, 可选): Cheerio选项

## 查询语法

### 基本语法
- `selector`: CSS选择器
- `selector@attribute`: 提取属性值
- `[selector]`: 提取所有匹配元素
- `selector | filter`: 应用过滤器

### 高级查询语法

#### 条件查询
- `selector[.class]`: 包含指定类的元素
- `selector[attr]`: 包含指定属性的元素
- `selector[attr=value]`: 属性值匹配的元素
- `selector:first`: 第一个元素
- `selector:last`: 最后一个元素
- `selector:empty`: 空元素
- `selector:not-empty`: 非空元素
- `selector:contains("text")`: 包含指定文本的元素

```javascript
// 条件查询示例
parse('div[.active]', $)              // 包含active类的div
parse('input[type=text]', $)          // type为text的input
parse('img[alt]', $)                  // 有alt属性的img
parse('li:first', $)                  // 第一个li元素
parse('p:contains("重要")', $)         // 包含"重要"文本的p元素
```

#### 嵌套查询
- `parent > child`: 直接子元素查询
- `ancestor > descendant > target`: 多级嵌套查询

```javascript
// 嵌套查询示例
parse('nav > ul > li', $)             // nav下ul下的li元素
parse('article > .content > p', $)    // article下content类下的p元素
parse('[div > .item]', $)             // 获取所有div下item类的元素
```

#### 组合查询
```javascript
// 条件 + 属性提取
parse('a[.external]@href', $)         // 外部链接的href
parse('div[.active] > span', $)       // active div下的span

// 嵌套 + 条件 + 过滤器
parse('ul > li:first | trim', $)      // 第一个li的文本并去空格
parse('[nav > .menu > a@href]', $)    // 所有菜单链接的href数组
```

### 特殊属性
- `text`: 元素文本内容
- `html`: 元素HTML内容
- `outerHtml`: 包含元素本身的HTML
- `string`: 纯文本内容（不包含子元素标签）
- `nextNode`: 下一个兄弟节点的文本值

### 示例
```javascript
// 基本选择器
parse('h1', $)                    // 第一个h1的文本
parse('[h1]', $)                  // 所有h1的文本数组
parse('a@href', $)                // 第一个链接的href属性
parse('[a@href]', $)              // 所有链接的href数组

// 过滤器链
parse('span | trim | int', $)     // 文本 -> 去空格 -> 转整数
parse('[li | trim]', $)           // 所有li元素去空格后的数组

// 复杂对象
parse({
  title: 'h1',
  links: '[a@href]',
  count: '.count | int'
}, $)

// 分割器语法
parse(['[.item]', {
  name: '.name',
  price: '.price | float'
}], $)
```

## 错误处理

cparse 提供了完善的错误处理机制，包括多种错误类型和验证功能。

### 错误类型

#### ParseError
基础解析错误，所有其他错误的父类。

#### QueryParseError
查询解析错误，当查询语法不正确时抛出。

```javascript
try {
  parse('', $); // 空查询
} catch (error) {
  console.log(error.name);    // "QueryParseError"
  console.log(error.query);   // 导致错误的查询
}
```

#### FilterError
过滤器错误，当过滤器执行失败时抛出。

```javascript
try {
  parse('.text | unknownFilter', $);
} catch (error) {
  console.log(error.name);        // "FilterError"
  console.log(error.filterName);  // "unknownFilter"
  console.log(error.value);       // 处理的值
}
```

#### ValidationError
验证错误，当输入参数不符合要求时抛出。

```javascript
try {
  parse(123, $); // 查询必须是字符串
} catch (error) {
  console.log(error.name);   // "ValidationError"
  console.log(error.field);  // "query"
  console.log(error.value);  // 123
}
```

### 安全执行

使用 `ErrorHandler.safeExecute` 进行安全执行，避免程序崩溃：

```javascript
const { ErrorHandler } = require('cparse/src/errors');

const result = ErrorHandler.safeExecute(() => {
  return parse('.risky-selector', $);
}, 'default-value');

// 如果解析失败，返回默认值而不是抛出错误
```

### 输入验证

使用 `Validator` 类进行输入验证：

```javascript
const { Validator } = require('cparse/src/errors');

// 验证查询字符串
try {
  const validQuery = Validator.validateQuery(userInput);
  const result = parse(validQuery, $);
} catch (error) {
  console.log('无效的查询:', error.message);
}

// 验证HTML内容
try {
  const validHtml = Validator.validateHtml(htmlContent);
  const $ = loadCheerio(validHtml);
} catch (error) {
  console.log('无效的HTML:', error.message);
}
```

## 性能优化

### 查询缓存
cparse 自动缓存解析后的查询，提高重复查询的性能：

```javascript
// 第一次解析会缓存结果
parse('h1', $);
// 第二次使用相同查询会直接使用缓存
parse('h1', $); // 更快
```

### 批量处理
对于大量数据，建议使用批量处理：

```javascript
// 推荐：一次性提取所有需要的数据
const data = parse({
  titles: '[h1]',
  links: '[a@href]',
  prices: '[.price | float]'
}, $);

// 避免：多次单独查询
// const titles = parse('[h1]', $);
// const links = parse('[a@href]', $);
// const prices = parse('[.price | float]', $);
```

### 选择器优化
使用高效的CSS选择器：

```javascript
// 推荐：具体的选择器
parse('#content .title', $)

// 避免：过于宽泛的选择器
parse('* .title', $)
```

## 版本历史

### v1.1.0 (即将发布)
- 🎉 新增30+个内置过滤器，包括字符串处理、数组操作、数字格式化等
- 🚀 支持条件查询语法：`selector[.class]`、`selector:first`、`selector:contains("text")`等
- 🔗 支持嵌套查询语法：`parent > child > target`
- 🛡️ 完善的错误处理和验证机制，包括自定义错误类型
- ⚡ 性能优化：查询缓存、批量处理支持
- 🧪 新增集成测试和性能测试
- 📚 完善的文档和示例

### v1.0.6
- 升级到 Cheerio 1.1.0
- 修复了与 Cheerio 1.0+ 版本的兼容性问题
- 重构了插件系统以适应新的 Cheerio API
- 所有测试通过，确保功能稳定性

## 开发

```bash
# 安装依赖
npm install

# 运行测试
npm test
```

## 许可证

MIT