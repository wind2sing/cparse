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

- `int`: 转换为整数
- `float`: 转换为浮点数
- `bool`: 转换为布尔值
- `trim`: 去除首尾空白
- `slice`: 字符串切片
- `reverse`: 字符串反转
- `date`: 转换为日期对象
- `size`: 解析尺寸字符串

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