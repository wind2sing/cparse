# cparse 简化语法指南

## 🎯 概述

从 cparse v2.0.3 开始，我们引入了更简洁的调用方式！现在可以直接在 Cheerio 实例上调用 `parse` 方法，无需重复传递 `$` 参数。

## ✨ 新功能特性

### 直接在 $ 实例上调用 parse

```javascript
const { loadCheerio } = require('cparse');
const $ = loadCheerio('<div class="title">Hello World</div>');

// ✅ 新的简化语法
const title = $.parse('.title');

// ❌ 传统语法（仍然支持）
const { parse } = require('cparse');
const title2 = parse('.title', $);
```

## 📊 语法对比表

| 功能 | 传统语法 | 简化语法 | 节省字符 |
|------|---------|---------|----------|
| 基本选择器 | `parse('.title', $)` | `$.parse('.title')` | 8 个字符 |
| 属性提取 | `parse('a@href', $)` | `$.parse('a@href')` | 8 个字符 |
| 数组提取 | `parse('[.item]', $)` | `$.parse('[.item]')` | 8 个字符 |
| 过滤器链 | `parse('.price \| float', $)` | `$.parse('.price \| float')` | 8 个字符 |
| 结构化数据 | `parse({...}, $)` | `$.parse({...})` | 8 个字符 |

## 🚀 使用示例

### 基本用法

```javascript
const { loadCheerio } = require('cparse');
const $ = loadCheerio(`
  <div class="container">
    <h1 class="title">Hello World</h1>
    <p class="content">This is content</p>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
    <a href="/docs" class="link">Documentation</a>
  </div>
`);

// 基本提取
const title = $.parse('.title');                    // "Hello World"
const content = $.parse('.content');                // "This is content"

// 属性提取
const link = $.parse('.link@href');                 // "/docs"

// 数组提取
const items = $.parse('[li]');                      // ["Item 1", "Item 2", "Item 3"]

// 过滤器链
const upperTitle = $.parse('.title | upper');       // "HELLO WORLD"
```

### 结构化数据提取

```javascript
// 提取页面信息
const pageInfo = $.parse({
  title: '.title',
  content: '.content',
  items: '[li]',
  link: '.link@href'
});

console.log(pageInfo);
// {
//   title: "Hello World",
//   content: "This is content", 
//   items: ["Item 1", "Item 2", "Item 3"],
//   link: "/docs"
// }
```

### 复杂数据提取

```javascript
const html = `
  <div class="product" data-id="1">
    <h3 class="name">iPhone 15</h3>
    <span class="price">$999.00</span>
    <div class="rating" data-score="4.5">★★★★☆</div>
    <div class="tags">
      <span class="tag">手机</span>
      <span class="tag">苹果</span>
    </div>
  </div>
`;

const $ = loadCheerio(html);

// 使用分割器语法
const products = $.parse([
  '.product',
  {
    id: '@data-id | int',
    name: '.name',
    price: '.price | regex:\\d+\\.\\d+ | float',
    rating: '.rating@data-score | float',
    tags: ['.tags .tag', 'text']
  }
]);
```

## 🔗 HTTP 客户端集成

### Axios 集成

```javascript
const axios = require('axios');
const { cheerioHookForAxios } = require('cparse');

const client = axios.create();
cheerioHookForAxios(client);

// 使用简化语法
const response = await client.get('https://example.com');
const title = response.$.parse('title');
const links = response.$.parse('[a@href]');
```

### Got 集成

```javascript
const got = require('got');
const { cheerioHookForGot } = require('cparse');

const client = got.extend({});
cheerioHookForGot(client);

const response = await client.get('https://example.com');
const data = response.$.parse({
  title: 'title',
  description: 'meta[name="description"]@content'
});
```

## 💡 最佳实践

### 1. 推荐使用简化语法

```javascript
// ✅ 推荐：简洁明了
const title = $.parse('.title');
const items = $.parse('[.item]');
const data = $.parse({ title: '.title', count: '.count | int' });

// ❌ 不推荐：重复传递参数
const title = parse('.title', $);
const items = parse('[.item]', $);
const data = parse({ title: '.title', count: '.count | int' }, $);
```

### 2. 批量提取优于多次调用

```javascript
// ✅ 推荐：一次性提取
const data = $.parse({
  title: '.title',
  items: '[.item]',
  links: '[a@href]'
});

// ❌ 避免：多次单独调用
const title = $.parse('.title');
const items = $.parse('[.item]');
const links = $.parse('[a@href]');
```

### 3. 合理使用过滤器链

```javascript
// ✅ 推荐：清晰的过滤器链
const price = $.parse('.price | trim | regex:\\d+\\.\\d+ | float');

// ❌ 避免：过长的过滤器链
const result = $.parse('.text | trim | upper | slice:0:10 | replace:A:B | split: | join:-');
```

## 🔄 向后兼容性

简化语法完全向后兼容，传统语法仍然完全支持：

```javascript
const { loadCheerio, parse } = require('cparse');
const $ = loadCheerio(html);

// 两种语法都可以使用
const title1 = $.parse('.title');        // 新语法
const title2 = parse('.title', $);       // 传统语法

// 结果完全相同
console.log(title1 === title2);          // true
```

## 📈 性能对比

根据性能测试，简化语法的性能与传统语法基本相同，甚至略有优势：

- **传统语法**: 31.286ms (1000 次调用)
- **简化语法**: 28.336ms (1000 次调用)
- **性能提升**: ~9%

## 🎉 总结

简化语法带来的优势：

1. **更简洁**: 减少重复的参数传递
2. **更直观**: 方法调用更符合直觉
3. **更高效**: 略微的性能提升
4. **完全兼容**: 不破坏现有代码
5. **类型安全**: 完整的 TypeScript 支持

立即开始使用简化语法，让你的代码更加简洁优雅！
