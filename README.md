# cparse

[![npm version](https://badge.fury.io/js/cparse.svg)](https://badge.fury.io/js/cparse)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/cparse.svg)](https://nodejs.org/)

一个基于 Cheerio 的强大 HTML 解析和数据提取工具库，专为简化网页数据抓取而设计。

## ✨ 核心特性

### 🎯 **语法糖增强**
- **属性提取语法**：`selector@attribute` - 直接提取属性值
- **数组提取语法**：`[selector]` - 获取所有匹配元素
- **标准 CSS 支持**：完全兼容 Cheerio 原生 CSS 选择器
- **自定义伪选择器**：`:not-empty` - 扩展的伪选择器

### 🔧 **强大的过滤器系统**
- **30+ 内置过滤器**：数据类型转换、字符串处理、数组操作等
- **过滤器链**：`selector | filter1 | filter2` - 链式数据处理
- **自定义过滤器**：支持扩展自定义过滤器

### 🚀 **Cheerio 功能扩展**
- **扩展方法**：`.string()`, `.nextNode()`, `.extract()`, `.extractAll()`
- **HTTP 集成**：Axios 和 Got 客户端无缝集成
- **URL 处理**：相对 URL 自动转换为绝对 URL

### 🛡️ **企业级特性**
- **完善的错误处理**：多种错误类型和详细错误信息
- **高性能设计**：查询缓存、批量处理优化
- **TypeScript 支持**：完整的类型定义
- **全面测试**：200+ 测试用例保证质量

## 📦 安装

```bash
npm install cparse
```

**系统要求**：Node.js >= 18.17.0

## 🚀 快速开始

### 基础用法

```javascript
const { loadCheerio, parse } = require('cparse');

const html = '<div class="title">Hello World</div>';
const $ = loadCheerio(html);

// 传统用法
const title = parse('.title', $); // "Hello World"

// 🎯 新增：简化语法 - 直接在 $ 实例上调用 parse
const title2 = $.parse('.title'); // "Hello World"

// 数组提取（语法糖）
const items = $.parse('[.item]'); // 所有 .item 元素的文本数组

// 属性提取（语法糖）
const links = $.parse('[a@href]'); // 所有链接的 href 属性数组

// 过滤器链
const price = $.parse('.price | trim | float'); // 文本 -> 去空格 -> 转浮点数
```

### 🎯 简化语法对比

```javascript
// ❌ 传统用法：需要传递 $ 参数
const title = parse('.title', $);
const data = parse({ title: '.title', count: '.count | int' }, $);

// ✅ 简化用法：直接在 $ 实例上调用
const title = $.parse('.title');
const data = $.parse({ title: '.title', count: '.count | int' });
```

### 结构化数据提取

```javascript
const html = `
<div class="product">
  <h2 class="title">iPhone 15</h2>
  <span class="price">$999.00</span>
  <div class="rating" data-score="4.5">★★★★☆</div>
</div>
`;

const $ = loadCheerio(html);

// 使用简化语法提取结构化数据
const product = $.parse({
  title: '.title',
  price: '.price | regex:\\d+\\.\\d+ | float',
  rating: '.rating@data-score | float'
});

console.log(product);
// { title: "iPhone 15", price: 999.00, rating: 4.5 }
```

## 🔗 HTTP 客户端集成

### Axios 集成

```javascript
const axios = require('axios');
const { cheerioHookForAxios, parse } = require('cparse');

const client = axios.create();
cheerioHookForAxios(client);

// 响应自动包含 $ 属性，可以直接使用简化语法
const response = await client.get('https://example.com');
const title = response.$.parse('title');
const links = response.$.parse('[a@href]');
```

### Got 集成

```javascript
const got = require('got');
const { cheerioHookForGot, parse } = require('cparse');

const client = got.extend({});
cheerioHookForGot(client);

const response = await client.get('https://example.com');
const data = response.$.parse({
  title: 'title',
  description: 'meta[name="description"]@content'
});
```

## 🎯 简化语法 - 直接在 $ 实例上调用

**v2.0.2+ 新增功能**：现在可以直接在 Cheerio 实例上调用 `parse` 方法，无需传递 `$` 参数！

### 语法对比

| 传统用法 | 简化用法 | 说明 |
|---------|---------|------|
| `parse('.title', $)` | `$.parse('.title')` | 基本选择器 |
| `parse('[.item]', $)` | `$.parse('[.item]')` | 数组提取 |
| `parse('a@href', $)` | `$.parse('a@href')` | 属性提取 |
| `parse('.price \| float', $)` | `$.parse('.price \| float')` | 过滤器链 |
| `parse({...}, $)` | `$.parse({...})` | 结构化数据 |

### 使用示例

```javascript
const { loadCheerio } = require('cparse');
const $ = loadCheerio('<div class="title">Hello</div>');

// ✅ 推荐：使用简化语法
const title = $.parse('.title');
const data = $.parse({
  title: '.title',
  items: '[.item]',
  link: 'a@href'
});

// ❌ 传统用法（仍然支持）
const { parse } = require('cparse');
const title2 = parse('.title', $);
```

## 🎯 核心语法糖功能

cparse 的核心价值在于提供简洁的语法糖，简化常见的数据提取操作：

### 1. 属性提取语法 `@`

```javascript
// 传统 Cheerio 写法
$('a').map((i, el) => $(el).attr('href')).get();

// cparse 简化语法
$.parse('[a@href]');
```

### 2. 数组提取语法 `[]`

```javascript
// 传统 Cheerio 写法
$('.item').map((i, el) => $(el).text()).get();

// cparse 简化语法
$.parse('[.item]');
```

### 3. 标准 CSS 选择器支持

```javascript
// 完全支持 Cheerio 原生 CSS 选择器
$.parse('div.active');           // 类选择器
$.parse('input[type="text"]');   // 属性选择器
$.parse('li:first-child');       // 伪选择器
```

### 4. 自定义伪选择器

```javascript
// :not-empty 伪选择器（Cheerio 原生不支持）
parse('p:not-empty', $); // 转换为 p:not(:empty)
```

## 🔧 强大的过滤器系统

cparse 提供了 30+ 内置过滤器，支持链式调用进行复杂的数据处理：

```javascript
// 过滤器链示例
parse('.price | trim | regex:\\d+\\.\\d+ | float', $);
// 文本 -> 去空格 -> 正则提取 -> 转浮点数
```

### 📊 过滤器分类

#### 数据类型转换
| 过滤器 | 功能 | 示例 |
|--------|------|------|
| `int` | 转换为整数 | `parse('.count \| int', $)` |
| `float` | 转换为浮点数 | `parse('.price \| float', $)` |
| `bool` | 转换为布尔值 | `parse('.active \| bool', $)` |

#### 字符串处理
| 过滤器 | 功能 | 示例 |
|--------|------|------|
| `trim` | 去除首尾空白 | `parse('.title \| trim', $)` |
| `slice` | 字符串切片 | `parse('.text \| slice:0:10', $)` |
| `regex` | 正则表达式匹配 | `parse('.text \| regex:\\d+', $)` |
| `replace` | 字符串替换 | `parse('.text \| replace:old:new', $)` |
| `split` | 字符串分割 | `parse('.text \| split:,', $)` |
| `upper/lower` | 大小写转换 | `parse('.text \| upper', $)` |
| `capitalize` | 首字母大写 | `parse('.text \| capitalize', $)` |
| `title` | 标题格式化 | `parse('.text \| title', $)` |

#### 数组处理
| 过滤器 | 功能 | 示例 |
|--------|------|------|
| `length` | 获取长度 | `parse('[.items] \| length', $)` |
| `first/last` | 首/末元素 | `parse('[.items] \| first', $)` |
| `unique` | 数组去重 | `parse('[.items] \| unique', $)` |
| `sort` | 数组排序 | `parse('[.items] \| sort', $)` |
| `compact` | 过滤空值 | `parse('[.items] \| compact', $)` |
| `join` | 数组连接 | `parse('[.items] \| join:-', $)` |

#### 特殊处理
| 过滤器 | 功能 | 示例 |
|--------|------|------|
| `date` | 日期解析 | `parse('.date \| date', $)` |
| `size` | 尺寸解析 | `parse('.filesize \| size', $)` |
| `number` | 数字格式化 | `parse('.price \| number:2', $)` |

## 📚 API 参考

### 核心函数

#### `loadCheerio(html, options?, baseUrl?)`
加载 HTML 并返回扩展的 Cheerio 实例

```javascript
const $ = loadCheerio('<div>Hello</div>', {}, 'https://example.com');
```

#### `parse(rule, $, filters?)`
数据解析核心函数

```javascript
// 字符串规则
parse('h1', $)

// 对象规则
parse({ title: 'h1', links: '[a@href]' }, $)

// 数组规则（分割器语法）
parse(['[.item]', { name: '.name', price: '.price | float' }], $)
```

### HTTP 集成

#### `cheerioHookForAxios(instance, options?)`
为 Axios 添加 Cheerio 支持

#### `cheerioHookForGot(instance, options?)`
为 Got 添加 Cheerio 支持

## 🎯 查询语法详解

### 基础语法

| 语法 | 说明 | 示例 |
|------|------|------|
| `selector` | 标准 CSS 选择器 | `parse('h1', $)` |
| `selector@attr` | 属性提取语法糖 | `parse('a@href', $)` |
| `[selector]` | 数组提取语法糖 | `parse('[.item]', $)` |
| `selector \| filter` | 过滤器链 | `parse('.price \| float', $)` |

### 语法糖功能

#### 1. 标准 CSS 选择器支持
```javascript
// 完全支持 Cheerio 原生 CSS 选择器
parse('div.active', $)           // 类选择器
parse('input[type="text"]', $)   // 属性选择器
parse('li:first-child', $)       // 伪选择器
```

#### 2. 自定义伪选择器
```javascript
// 语法糖（cparse 扩展）
$.parse('p:not-empty')
// 转换为 Cheerio 原生
$.parse('p:not(:empty)')
```

#### 3. 复杂选择器支持
```javascript
// 直接使用 Cheerio 原生选择器
parse('nav > ul > li:first-child', $)
parse('input[type="text"]:focus', $)
parse('p:contains("重要")', $)
```

### 高级用法

#### 结构化数据提取
```javascript
const data = parse({
  title: 'h1',
  price: '.price | float',
  tags: '[.tag]',
  link: 'a@href'
}, $);
```

#### 分割器语法（列表处理）
```javascript
const items = parse([
  '[.product]',  // 分割器：每个 .product 元素
  {
    name: '.name',
    price: '.price | float',
    inStock: '.stock | bool'
  }
], $);
```

#### 函数处理
```javascript
const result = parse([
  '.content',
  text => text.toUpperCase(),
  text => text.trim()
], $);
```

## 🚀 Cheerio 扩展方法

cparse 为 Cheerio 添加了便捷的扩展方法：

### 扩展方法列表

| 方法 | 功能 | 示例 |
|------|------|------|
| `.string()` | 纯文本内容（不含子元素标签） | `$('.content').string()` |
| `.nextNode()` | 下一个兄弟节点的文本 | `$('.label').nextNode()` |
| `.extract(attr)` | 提取单个元素的属性/内容 | `$('.item').extract('href')` |
| `.extractAll(attr)` | 提取所有元素的属性/内容 | `$('.items').extractAll('text')` |

### 特殊属性值

在 `extract()` 和 `extractAll()` 中可使用的特殊属性：

- `text`: 文本内容
- `html`: HTML 内容
- `outerHtml`: 包含元素本身的 HTML
- `string`: 纯文本内容
- `nextNode`: 下一个兄弟节点文本

## 🛡️ 错误处理

cparse 提供完善的错误处理机制：

### 错误类型

- **QueryParseError**: 查询语法错误
- **FilterError**: 过滤器执行错误
- **ValidationError**: 参数验证错误

```javascript
try {
  parse('.text | unknownFilter', $);
} catch (error) {
  if (error.name === 'FilterError') {
    console.log(`过滤器错误: ${error.filterName}`);
    console.log(`可用过滤器: ${error.context.availableFilters}`);
  }
}
```
## ⚡ 性能优化

### 自动查询缓存
```javascript
// 第一次解析会缓存结果
parse('h1', $);
// 第二次使用相同查询直接使用缓存
parse('h1', $); // 更快
```

### 批量处理建议
```javascript
// ✅ 推荐：一次性提取所有数据
const data = parse({
  titles: '[h1]',
  links: '[a@href]',
  prices: '[.price | float]'
}, $);

// ❌ 避免：多次单独查询
```

## 🔄 重构优化

### v2.0.0 重大更新

**🎯 核心优化**
- **移除重复实现**：删除与 Cheerio 原生功能重复的代码
- **专注语法糖**：保留真正有价值的语法糖功能
- **性能提升**：直接使用 Cheerio 原生选择器，性能更优
- **代码简化**：代码量减少 40%，维护性大幅提升

**🚀 保留的核心价值**
- ✅ 属性提取语法：`selector@attribute`
- ✅ 数组提取语法：`[selector]`
- ✅ 标准 CSS 支持：完全兼容 Cheerio 原生选择器
- ✅ 自定义伪选择器：`:not-empty`
- ✅ 强大的过滤器系统
- ✅ 结构化数据提取
- ✅ HTTP 客户端集成

**🗑️ 移除的重复功能**
- ❌ 条件查询处理（Cheerio 原生支持）
- ❌ 嵌套查询处理（Cheerio 原生支持）
- ❌ 伪选择器重复实现（Cheerio 原生支持）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发环境

```bash
# 克隆项目
git clone https://github.com/your-username/cparse.git

# 安装依赖
npm install

# 运行测试
npm test

# 运行 lint
npm run lint
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**