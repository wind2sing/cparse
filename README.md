# cparse

一个基于 Cheerio 的 HTML 解析和数据提取工具库。

## 特性

- 基于 Cheerio 1.1.0 构建，提供强大的 HTML 解析能力
- 扩展了 Cheerio 的功能，添加了便捷的数据提取方法
- 支持 Axios 和 Got HTTP 客户端的集成
- 提供丰富的过滤器用于数据处理
- 支持相对 URL 转换为绝对 URL

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

## 版本历史

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