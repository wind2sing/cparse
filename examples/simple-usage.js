/**
 * 简化用法示例
 * 演示如何直接在 Cheerio 实例上调用 parse 方法
 */

const { loadCheerio } = require('../index.js');

// 示例 HTML
const html = `
<!DOCTYPE html>
<html>
<head>
    <title>简化用法示例</title>
</head>
<body>
    <div class="container">
        <h1 class="title">欢迎使用 cparse 简化语法</h1>
        <p class="description">现在可以直接在 $ 实例上调用 parse 方法</p>
        
        <ul class="features">
            <li>更简洁的语法</li>
            <li>更直观的调用</li>
            <li>更好的开发体验</li>
        </ul>
        
        <div class="stats">
            <span class="downloads">2000+</span>
            <span class="stars">100</span>
            <span class="version">2.0.2</span>
        </div>
        
        <a href="/docs" class="link">查看文档</a>
        <a href="/api" class="link">API 参考</a>
    </div>
</body>
</html>
`;

console.log('=== 简化用法示例 ===\n');

// 1. 加载 HTML
const $ = loadCheerio(html);
console.log('1. 加载 HTML 完成');

// 2. 使用新的简化语法 - 直接在 $ 实例上调用 parse
console.log('\n2. 使用简化语法:');

// 基本提取
const title = $.parse('.title');
console.log('   页面标题:', title);

const description = $.parse('.description');
console.log('   页面描述:', description);

// 属性提取
const linkHrefs = $.parse('[.link@href]');
console.log('   链接地址:', linkHrefs);

// 使用过滤器
const downloads = $.parse('.downloads | int');
console.log('   下载次数:', downloads, '(类型:', typeof downloads, ')');

// 提取所有匹配元素
const features = $.parse('[.features li]');
console.log('   功能列表:', features);

// 结构化数据提取
const pageInfo = $.parse({
    title: '.title',
    description: '.description',
    features: '[.features li]',
    stats: {
        downloads: '.downloads | int',
        stars: '.stars | int',
        version: '.version'
    },
    links: '[.link@href]'
});

console.log('\n3. 结构化数据:');
console.log(JSON.stringify(pageInfo, null, 2));

// 4. 对比传统用法
console.log('\n4. 语法对比:');
console.log('传统用法: parse(\'.title\', $)');
console.log('简化用法: $.parse(\'.title\')');
console.log('');
console.log('传统用法: parse({ title: \'.title\', count: \'.count | int\' }, $)');
console.log('简化用法: $.parse({ title: \'.title\', count: \'.count | int\' })');

console.log('\n=== 示例完成 ===');
