/**
 * cparse 高级功能示例
 * 展示语法糖功能、过滤器系统和结构化数据提取
 */

const { loadCheerio, parse } = require('../index.js');

// 示例HTML
const html = `
<!DOCTYPE html>
<html>
<head>
    <title>高级功能示例</title>
</head>
<body>
    <nav class="navigation">
        <ul class="menu">
            <li class="menu-item active">
                <a href="/home" class="nav-link">首页</a>
            </li>
            <li class="menu-item">
                <a href="/products" class="nav-link external">产品</a>
            </li>
            <li class="menu-item">
                <a href="/about" class="nav-link">关于我们</a>
            </li>
        </ul>
    </nav>
    
    <main class="content">
        <article class="post" data-id="1">
            <h1 class="title">第一篇文章</h1>
            <div class="meta">
                <span class="author">张三</span>
                <span class="date">2024-01-15</span>
                <span class="views">1,234</span>
            </div>
            <div class="content-body">
                <p>这是第一篇文章的内容...</p>
                <p>包含多个段落。</p>
            </div>
            <div class="tags">
                <span class="tag">技术</span>
                <span class="tag">JavaScript</span>
                <span class="tag">Node.js</span>
            </div>
        </article>
        
        <article class="post" data-id="2">
            <h1 class="title">第二篇文章</h1>
            <div class="meta">
                <span class="author">李四</span>
                <span class="date">2024-01-16</span>
                <span class="views">2,567</span>
            </div>
            <div class="content-body">
                <p>这是第二篇文章的内容...</p>
            </div>
            <div class="tags">
                <span class="tag">教程</span>
                <span class="tag">前端</span>
            </div>
        </article>
    </main>
    
    <aside class="sidebar">
        <div class="widget">
            <h3>热门标签</h3>
            <div class="tag-cloud">
                <a href="/tag/javascript" class="tag-link" data-count="15">JavaScript</a>
                <a href="/tag/nodejs" class="tag-link" data-count="8">Node.js</a>
                <a href="/tag/frontend" class="tag-link" data-count="12">前端</a>
            </div>
        </div>
    </aside>
</body>
</html>
`;

const $ = loadCheerio(html);

console.log('=== cparse 高级功能示例 ===\n');

// 1. 语法糖功能示例
console.log('1. 语法糖功能示例:');
console.log('属性提取语法:');
console.log('  链接地址:', parse('[nav a@href]', $));
console.log('  文章ID:', parse('[.post@data-id]', $));

console.log('\n数组提取语法:');
console.log('  所有标题:', parse('[.title]', $));
console.log('  所有标签:', parse('[.tag]', $));

console.log('\n类条件简化:');
console.log('  活跃菜单项:', parse('.menu-item[.active] .nav-link', $));
console.log('  外部链接:', parse('a[.external]@href', $));

console.log('\n自定义伪选择器:');
console.log('  非空段落:', parse('p:not-empty', $));

// 2. 强大的过滤器系统
console.log('\n2. 强大的过滤器系统:');
console.log('字符串处理:');
console.log('  大写转换:', parse('.title | upper', $));
console.log('  首字母大写:', parse('.author | capitalize', $));
console.log('  字符串分割:', parse('.views | split:,', $));
console.log('  正则匹配:', parse('.views | regex:\\d+', $));
console.log('  字符串替换:', parse('.views | replace:,:_', $));

console.log('\n数组处理:');
const tags = parse('[.tag]', $);
console.log('  所有标签:', tags);
console.log('  数组长度:', parse('[.tag] | length', $));
console.log('  第一个标签:', parse('[.tag] | first', $));
console.log('  最后一个标签:', parse('[.tag] | last', $));
console.log('  标签连接:', parse('[.tag] | join: , ', $));
console.log('  去重排序:', parse('[.tag] | unique | sort', $));

console.log('\n数字处理:');
console.log('  浮点数:', parse('.views | regex:\\d+ | first | float', $));
console.log('  格式化数字:', parse('.views | regex:\\d+ | first | number:0', $));

// 3. Cheerio 原生选择器支持
console.log('\n3. Cheerio 原生选择器支持:');
console.log('标准 CSS 选择器:');
console.log('  第一篇文章:', parse('.post:first-child .title', $));
console.log('  最后一篇文章:', parse('.post:last-child .title', $));
console.log('  属性选择器:', parse('a[href="/products"]', $));
console.log('  包含文本:', parse('a:contains("产品")', $));

console.log('\n嵌套选择器:');
console.log('  导航链接:', parse('[nav > ul > li > a@href]', $));
console.log('  文章标题:', parse('[main > article > h1]', $));
console.log('  文章元数据:', parse('[article > .meta > span]', $));
console.log('  侧边栏标签链接:', parse('[aside > .widget > .tag-cloud > a@href]', $));

// 4. 复杂数据提取示例
console.log('\n4. 复杂数据提取示例:');

// 提取导航菜单
const navigation = parse({
  items: [
    'nav .menu-item',
    {
      text: '.nav-link | trim',
      url: '.nav-link@href',
      isActive: '.nav-link@class | regex:active | length | bool',
      isExternal: '.nav-link@class | regex:external | length | bool'
    }
  ]
}, $);

console.log('导航菜单:', JSON.stringify(navigation, null, 2));

// 提取文章列表
const articles = parse([
  '.post',
  {
    id: '@data-id | int',
    title: '.title | trim',
    author: '.meta .author | trim',
    date: '.meta .date',
    views: '.meta .views | regex:\\d+ | first | int',
    content: '.content-body p | join:  ',
    tags: ['.tags .tag', 'text | trim'],
    tagCount: '.tags .tag | length'
  }
], $);

console.log('\n文章列表:', JSON.stringify(articles, null, 2));

// 提取侧边栏信息
const sidebar = parse({
  widgets: [
    '.sidebar .widget',
    {
      title: 'h3 | trim',
      type: '@class | regex:widget-\\w+ | first | replace:widget-:',
      content: {
        tagLinks: [
          '.tag-cloud a',
          {
            text: 'text | trim',
            url: '@href',
            count: '@data-count | int'
          }
        ]
      }
    }
  ]
}, $);

console.log('\n侧边栏信息:', JSON.stringify(sidebar, null, 2));

// 5. 错误处理示例
console.log('\n5. 错误处理示例:');

try {
  // 使用不存在的过滤器
  parse('.title | unknownFilter', $);
} catch (error) {
  console.log('过滤器错误:', error.name, '-', error.message);
  console.log('可用过滤器:', error.context?.availableFilters?.slice(0, 5).join(', '), '...');
}

try {
  // 无效的查询
  parse('', $);
} catch (error) {
  console.log('查询错误:', error.name, '-', error.message);
}

// 6. 性能优化示例
console.log('\n6. 性能优化示例:');

// 批量提取 vs 多次单独提取
console.time('批量提取');
const batchResult = parse({
  titles: '[.title]',
  authors: '[.author]',
  dates: '[.date]',
  tags: '[.tag]'
}, $);
console.timeEnd('批量提取');

console.time('多次单独提取');
const separateResult = {
  titles: parse('[.title]', $),
  authors: parse('[.author]', $),
  dates: parse('[.date]', $),
  tags: parse('[.tag]', $)
};
console.timeEnd('多次单独提取');

console.log('批量提取结果数量:', Object.keys(batchResult).length);
console.log('单独提取结果数量:', Object.keys(separateResult).length);

console.log('\n=== 示例完成 ===');
